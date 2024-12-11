import { EmberClient, Model } from 'emberplus-connection'
import { store, state } from '../../reducers/store'
import { remoteConnections } from '../../mainClasses'

//Utils:
import {
    fxParamsList,
    MixerProtocol,
} from '../../../../shared/src/constants/MixerProtocolInterface'
import {
    FaderActionTypes,
} from '../../../../shared/src/actions/faderActions'
import { logger } from '../logger'
import { SettingsActionTypes} from '../../../../shared/src/actions/settingsActions'
import { ChannelActionTypes } from '../../../../shared/src/actions/channelActions'
import { EmberElement, NumberedTreeNode } from 'emberplus-connection/dist/model'

// TODO - should these be util functions?
export function floatToDB(f: number): number {
    if (f >= 0.5) {
        return f * 40 - 30 // max dB value: +10.
    } else if (f >= 0.25) {
        return f * 80 - 50
    } else if (f >= 0.0625) {
        return f * 160 - 70
    } else if (f > 0.0) {
        return f * 480 - 90 // min dB value: -90 or -oo
    } else {
        return -191
    }
}

export function dbToFloat(d: number): number {
    let f: number
    if (d < -60) {
        f = (d + 90) / 480
    } else if (d < -30) {
        f = (d + 70) / 160
    } else if (d < -10) {
        f = (d + 50) / 80
    } else if (d <= 10) {
        f = (d + 30) / 40
    } else {
        f = 1
    }
    return Math.max(0, f)
}

export class LawoRubyMixerConnection {
    mixerProtocol: MixerProtocol
    mixerIndex: number
    emberConnection: EmberClient
    faders: { [index: number]: string } = {}

    constructor(mixerProtocol: MixerProtocol, mixerIndex: number) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.mixerProtocol = mixerProtocol
        this.mixerIndex = mixerIndex

        logger.info('Setting up Ember connection')
        this.emberConnection = new EmberClient(
            state.settings[0].mixers[this.mixerIndex].deviceIp,
            state.settings[0].mixers[this.mixerIndex].devicePort
        )

        store.dispatch({
            type: SettingsActionTypes.SET_MIXER_ONLINE,
            mixerIndex: this.mixerIndex,
            mixerOnline: false,
        })


        this.emberConnection.on('error', (error: any) => {
            if (
                (error.message + '').match(/econnrefused/i) ||
                (error.message + '').match(/disconnected/i)
            ) {
                logger.error('Ember connection not establised')
            } else {
                logger.data(error).error('Ember connection unknown error')
            }
        })
        this.emberConnection.on('disconnected', () => {
            logger.error('Lost Ember connection')
            store.dispatch({
                type: SettingsActionTypes.SET_MIXER_ONLINE,
                mixerIndex: this.mixerIndex,
                mixerOnline: false,
            })
            global.mainThreadHandler.updateMixerOnline(this.mixerIndex)
        })
        this.emberConnection.on('connected', () => {
            logger.info('Connected to Ember device')
            store.dispatch({
                type: SettingsActionTypes.SET_MIXER_ONLINE,
                mixerIndex: this.mixerIndex,
                mixerOnline: true,
            })
            global.mainThreadHandler.updateMixerOnline(this.mixerIndex)
        })

        logger.info('Connecting to Ember')
        this.emberConnection
            .connect()
            .then(async () => {
                logger.debug('Getting Directory')
                const req = await this.emberConnection.getDirectory(
                    this.emberConnection.tree
                )
                const r = await req.response

                logger.data(r).debug('Directory:')
                this.setupMixerConnection()
            })
            .then(() => {})
            .catch((e: any) => {
                logger.debug(e.stack)
            })
    }

    async setupMixerConnection() {
        logger.info(
            'Ember connection established - setting up subscription of channels'
        )

        // get the node that contains the sources
        const sourceNode = await this.emberConnection.getElementByPath(
            'Ruby.Sources'
        )
        // get the sources
        const req = await this.emberConnection.getDirectory(
            sourceNode as NumberedTreeNode<EmberElement>
        )
        const sources = await req.response

        // map sourceNames to their fader number
        if ('children' in sources) {
            for (const [_i, child] of Object.entries(sources.children)) {
                if (
                    child.contents.type === Model.ElementType.Node &&
                    child.contents.identifier
                ) {
                    const name = child.contents.identifier
                    const fader = await this.emberConnection.getElementByPath(
                        `Ruby.Sources.${name}.Fader.Number`
                    )
                    this.faders[
                        (fader.contents as Model.Parameter).value as number
                    ] = name
                }
            }
        }

        // Set channel labels
        state.settings[0].mixers[
            this.mixerIndex
        ].numberOfChannelsInType.forEach(
            async (numberOfChannels, typeIndex) => {
                for (
                    let channelTypeIndex = 0;
                    channelTypeIndex < numberOfChannels;
                    channelTypeIndex++
                ) {
                    if (this.faders[channelTypeIndex + 1]) {
                        // enable
                        store.dispatch({
                            type: ChannelActionTypes.SET_CHANNEL_LABEL,
                            mixerIndex: this.mixerIndex,
                            channel: channelTypeIndex,
                            label: this.faders[channelTypeIndex + 1],
                        })
                        store.dispatch({
                            type: FaderActionTypes.SET_CHANNEL_DISABLED,
                            faderIndex: channelTypeIndex,
                            disabled: false,
                        })
                        store.dispatch({
                            type: FaderActionTypes.SHOW_CHANNEL,
                            faderIndex: channelTypeIndex,
                            showChannel: true,
                        })
                    } else {
                        // disable
                        store.dispatch({
                            type: FaderActionTypes.SET_CHANNEL_DISABLED,
                            faderIndex: channelTypeIndex,
                            disabled: true,
                        })
                        store.dispatch({
                            type: ChannelActionTypes.SET_CHANNEL_LABEL,
                            mixerIndex: this.mixerIndex,
                            channel: channelTypeIndex,
                            label: '',
                        })
                        store.dispatch({
                            type: FaderActionTypes.SHOW_CHANNEL,
                            faderIndex: channelTypeIndex,
                            showChannel: false,
                        })
                    }
                }
            }
        )

        let ch: number = 1
        for (const typeIndex in state.settings[0].mixers[this.mixerIndex]
            .numberOfChannelsInType) {
            const numberOfChannels =
                state.settings[0].mixers[this.mixerIndex]
                    .numberOfChannelsInType[typeIndex]
            for (
                let channelTypeIndex = 0;
                channelTypeIndex < numberOfChannels;
                channelTypeIndex++
            ) {
                logger.debug(`Running subscriptions for ${this.faders[ch]}`)
                try {
                    await this.subscribeFaderLevel(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    await this.subscribeGainLevel(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    await this.subscribeInputSelector(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    await this.subscribeAMixState(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    ch++
                } catch (e) {
                    logger
                        .data(e)
                        .error(
                            `error during subscriptions of parameters for ${this.faders[ch]}`
                        )
                }
            }
        }
    }

    async subscribeFaderLevel(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.replace(
            '{channel}',
            sourceName
        )

        try {
            const node = await this.emberConnection.getElementByPath(command)
            if (node.contents.type !== Model.ElementType.Parameter) return

            logger.debug(`Subscription of channel level: ${command}`)
            const req = await this.emberConnection.subscribe(
                node as NumberedTreeNode<EmberElement>,
                () => {
                    const levelInDecibel: number = (
                        node.contents as Model.Parameter
                    ).value as number
                    logger.trace(
                        `Receiving Level from Ch ${ch}: ${levelInDecibel}`
                    )
                    if (
                        !state.channels[0].chMixerConnection[this.mixerIndex]
                            .channel[ch - 1].fadeActive &&
                        levelInDecibel >=
                            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                                .CHANNEL_OUT_GAIN[0].min
                    ) {
                        // update the fader
                        const level = dbToFloat(levelInDecibel)
                        store.dispatch  ({
                            type: FaderActionTypes.SET_FADER_LEVEL,
                            faderIndex: ch - 1,
                            level: level,
                        })

                        // toggle pgm based on level
                        logger.trace(`Set Channel ${ch} pgmOn ${level > 0}`)
                        store.dispatch({
                            type: FaderActionTypes.SET_PGM,
                            faderIndex: ch - 1,
                            pgmOn: level > 0,
                        })

                        global.mainThreadHandler.updatePartialStore(ch - 1)
                        if (remoteConnections) {
                            remoteConnections.updateRemoteFaderState(
                                ch - 1,
                                level
                            )
                        }
                    }
                }
            )
            await req.response
        } catch (e) {
            logger.data(e).debug('error when subscribing to fader level')
        }
    }
    async subscribeGainLevel(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        const proto =
            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                .CHANNEL_INPUT_GAIN[0]
        let command = proto.mixerMessage.replace('{channel}', sourceName)

        try {
            const node = await this.emberConnection.getElementByPath(command)
            if (node.contents.type !== Model.ElementType.Parameter) return

            logger.debug(`Subscription of channel gain: ${command}`)
            const req = await this.emberConnection.subscribe(
                node as NumberedTreeNode<EmberElement>,
                () => {
                    logger.trace(`Receiving Gain from Ch ${ch}`)
                    const value = (node.contents as Model.Parameter)
                        .value as number
                    const level = (value - proto.min) / (proto.max - proto.min)
                    if (
                        ((node.contents as Model.Parameter).value as number) >
                        proto.min
                    ) {
                        store.dispatch({
                            type: FaderActionTypes.SET_INPUT_GAIN,
                            faderIndex: ch - 1,
                            level: level,
                        })
                        global.mainThreadHandler.updatePartialStore(ch - 1)
                    }
                }
            )
            await req.response
        } catch (e) {
            logger.data(e).debug('Error when subscribing to gain level')
        }
    }
    async subscribeInputSelector(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_INPUT_SELECTOR[0].mixerMessage.replace(
            '{channel}',
            sourceName
        )

        try {
            const node = await this.emberConnection.getElementByPath(command)
            logger.debug(`set_cap ${ch} hasInputSel true`)
            store.dispatch({
                type: FaderActionTypes.SET_CAPABILITY,
                faderIndex: ch - 1,
                capability: 'hasInputSelector',
                enabled: true,
            })
            if (node.contents.type !== Model.ElementType.Parameter) {
                return
            }

            logger.debug(`Subscription of channel input selector: ${command}`)
            const req = await this.emberConnection.subscribe(
                node as NumberedTreeNode<EmberElement>,
                () => {
                    logger.trace(`Receiving InpSelector from Ch ${ch}`)
                    this.mixerProtocol.channelTypes[
                        typeIndex
                    ].fromMixer.CHANNEL_INPUT_SELECTOR.forEach(
                        (selector, i) => {
                            if (
                                selector.value ===
                                (node.contents as Model.Parameter).value
                            ) {
                                store.dispatch({
                                    type: FaderActionTypes.SET_INPUT_SELECTOR,
                                    faderIndex: ch - 1,
                                    selected: i + 1,
                                })
                                global.mainThreadHandler.updatePartialStore(
                                    ch - 1
                                )
                            }
                        }
                    )
                }
            )
            await req.response
        } catch (e) {
            if (e.message.match(/could not find node/i)) {
                logger.debug(`set_cap ${ch} hasInputSel false`)
                store.dispatch({
                    type: FaderActionTypes.SET_CAPABILITY,
                    faderIndex: ch - 1,
                    capability: 'hasInputSelector',
                    enabled: false,
                })
            }
            logger.data(e).debug('Error when subscribing to input selector')
        }
    }
    async subscribeAMixState(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_AMIX[0].mixerMessage.replace(
            '{channel}',
            sourceName
        )

        try {
            const node = await this.emberConnection.getElementByPath(command)
            logger.debug(`set_cap ${ch - 1} hasAMix true`)
            store.dispatch({
                type: FaderActionTypes.SET_CAPABILITY,
                faderIndex: ch - 1,
                capability: 'hasAMix',
                enabled: true,
            })
            if (node.contents.type !== Model.ElementType.Parameter) {
                return
            }

            logger.debug(`Subscription of AMix state: ${command}`)
            const req = await this.emberConnection.subscribe(
                node as NumberedTreeNode<EmberElement>,
                () => {
                    logger.trace(`Receiving AMix state from Ch ${ch}`)

                    store.dispatch({
                        type: FaderActionTypes.SET_AMIX,
                        faderIndex: ch - 1,
                        state: (node.contents as Model.Parameter).value === true,
                    })
                    global.mainThreadHandler.updatePartialStore(ch - 1)
                }
            )
            await req.response
        } catch (e) {
            if (e.message.match(/could not find node/i)) {
                logger.debug(`set_cap ${ch - 1} hasAMix false`)
                store.dispatch({
                    type: FaderActionTypes.SET_CAPABILITY,
                    faderIndex: ch - 1,
                    capability: 'hasAMix',
                    enabled: false,
                })
            }
            logger.data(e).debug('error when subscribing to input selector')
        }
    }

    subscribeChannelName() {
        return true
    }

    pingMixerCommand() {
        return true
    }

    sendOutMessage(
        mixerMessage: string,
        channel: number,
        value: string | number | boolean,
        type?: string
    ) {
        const channelString = this.faders[channel]

        if (!channelString) return

        let message = mixerMessage.replace('{channel}', channelString)

        this.emberConnection
            .getElementByPath(message)
            .then(async (element: any) => {
                logger.trace(`Sending out message: ${message}`)
                await (
                    await this.emberConnection.setValue(
                        element,
                        typeof value === 'string' ? parseFloat(value) : value
                    )
                ).response
            })
            .catch((error: any) => {
                logger.data(error).error('Ember Error ')
            })
    }

    sendOutLevelMessage(channel: number, value: number) {
        const source = this.faders[channel]
        if (!channel) return

        const mixerMessage =
            this.mixerProtocol.channelTypes[0].toMixer.CHANNEL_OUT_GAIN[0]
                .mixerMessage

        logger.trace(`Sending out Level: ${value}  To ${source}`)

        this.sendOutMessage(mixerMessage, channel, value)
    }

    updateOutLevel(channelIndex: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let protocol =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0]
        let level =
            (state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].outputLevel -
                protocol.min) *
            (protocol.max - protocol.min)
        this.sendOutLevelMessage(channelTypeIndex + 1, level)
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let protocol =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0]

        const level = floatToDB(outputLevel)

        this.sendOutLevelMessage(channelTypeIndex + 1, level)
    }

    async updatePflState(channelIndex: number) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex

        // fetch source name and function node
        const fader = this.faders[channelTypeIndex + 1]
        const fn = (await this.emberConnection.getElementByPath(
            'Ruby.Functions.SetPFLState'
        )) as Model.NumberedTreeNode<Model.EmberFunction>

        if (!fader || !fn)
            throw new Error(
                'Oops could not find node or function to update PFL state'
            )

        try {
            const { response } = await this.emberConnection.invoke(
                fn,
                {
                    value: fader,
                    type: Model.ParameterType.String,
                },
                {
                    value: state.faders[0].fader[channelIndex].pflOn,
                    type: Model.ParameterType.Boolean,
                }
            )
            await response
        } catch (e) {
            logger.data(e).error('Ember Error ')
        }
    }

    updateMuteState(channelIndex: number, muteOn: boolean) {
        return true
    }

    updateAMixState(channelIndex: number, amixOn: boolean) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let protocol =
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_AMIX[0]

        this.sendOutMessage(
            protocol.mixerMessage,
            channelTypeIndex + 1,
            amixOn,
            ''
        )
    }

    updateNextAux(channelIndex: number, level: number) {
        return true
    }

    updateInputGain(channelIndex: number, gain: number) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let protocol =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_INPUT_GAIN[0]

        let level = gain * (protocol.max - protocol.min) + protocol.min

        this.sendOutMessage(
            protocol.mixerMessage,
            channelTypeIndex + 1,
            level,
            ''
        )
    }
    updateInputSelector(channelIndex: number, inputSelected: number) {
        logger.debug(`input select ${channelIndex} ${inputSelected}`)
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let msg =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_INPUT_SELECTOR[inputSelected - 1]

        this.sendOutMessage(
            msg.mixerMessage,
            channelTypeIndex + 1,
            msg.value,
            ''
        )
        return true
    }

    updateFx(fxParam: fxParamsList, channelIndex: number, level: number) {
        return true
    }
    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        return true
    }

    updateChannelName(channelIndex: number) {
        return true
    }

    loadMixerPreset(presetName: string) {}

    injectCommand(command: string[]) {
        return true
    }

    updateChannelSetting(
        channelIndex: number,
        setting: string,
        value: string
    ) {}
}

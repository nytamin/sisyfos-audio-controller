//While developing mixer specific settings will be in one file.
//At first release these will be in seperate files
//So it´s easy to add new equipment.

export const MixerProtocolPresets =
    {
        reaper: {
            protocol: 'OSC',
            mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                            //client (use feedback from mixers fader level)
            leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
            pingCommand: [
                {
                    oscMessage: "/note_in_use",
                    value: 0,
                    type: "f"
                }
            ],
            pingTime: 0,  //Bypass ping when pingTime is zero
            initializeCommand: [], // oscMessage, value, type
            fromMixer: {
                CHANNEL_FADER_LEVEL: '/track/{channel}/volume',
                CHANNEL_OUT_GAIN: '/track/{channel}/fx/1/fxparam/1/value',
                CHANNEL_VU: '/track/{channel}/vu',
                CHANNEL_NAME: '/track/{channel}/name',
            },
            toMixer: {
                CHANNEL_FADER_LEVEL: '/track/{channel}/volume',
                CHANNEL_OUT_GAIN: '/track/{channel}/fx/1/fxparam/1/value',
            },
            fader: {
                min: 0,
                max: 1,
                zero: 0.75,
                step: 0.01,
                fadeTime: 40,  //Total time for a fade in ms.
            },
            meter: {
                min: 0,
                max: 1,
                zero: 0.75,
                test: 0.6,
            },
        },
        behringer: {
            protocol: 'OSC',
            mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                            //client (use feedback from mixers fader level)
            leadingZeros: true,
            pingCommand: [
                {
                    oscMessage: "/xremote",
                    value: "",
                    type: "f"
                },
                {
                    oscMessage: "/meters",
                    value: "/meters/1",
                    type: "s"
                }
            ],
            pingTime: 9500,
            initializeCommand: [
                {
                    oscMessage: "/info",
                    value: 0,
                    type: "f"
                }
            ],
            fromMixer: {
                CHANNEL_FADER_LEVEL: 'none',        //'none' ignores this command
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
                CHANNEL_VU: '/meters/1',
                CHANNEL_NAME: '/ch/{channel}/config/name',
            },
            toMixer: {
                CHANNEL_FADER_LEVEL: 'none',
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
            },
            fader: {
                min: 0,
                max: 1,
                zero: 0.75,
                step: 0.01,
                fadeTime: 40,
            },
            meter: {
                min: 0,
                max: 1,
                zero: 0.75,
                test: 0.6,
            },
        },
        yamahacl1: {
            protocol: 'MIDI',
            mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                            //client (use feedback from mixers fader level)
            leadingZeros: false,
            pingCommand: [
                {
                    oscMessage: "/xremote",
                    value: "",
                    type: "f"
                },
                {
                    oscMessage: "/meters",
                    value: "/meters/1",
                    type: "s"
                }
            ],
            pingTime: 9500,
            initializeCommand: [
                {
                    oscMessage: "/info",
                    value: 0,
                    type: "f"
                }
            ],
            fromMixer: {
                CHANNEL_FADER_LEVEL: 'none',        //'none' ignores this command
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
                CHANNEL_VU: '/meters/1',
                CHANNEL_NAME: '/ch/{channel}/config/name',
            },
            toMixer: {
                CHANNEL_FADER_LEVEL: 'none',
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
            },
            fader: {
                min: 0,
                max: 1,
                zero: 0.75,
                step: 0.01,
                fadeTime: 40,
            },
            meter: {
                min: 0,
                max: 1,
                zero: 0.75,
                test: 0.6,
            },
        },
    }
;

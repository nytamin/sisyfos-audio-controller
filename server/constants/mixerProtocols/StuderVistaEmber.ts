import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface'

export const StuderVistaMaster: IMixerProtocol = {
    protocol: 'VISTA',
    label: 'Studer Vista 1-5-9',
    mode: 'master',
    FADE_DISPATCH_RESOLUTION: 5,
    leadingZeros: false, //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [
        {
            mixerMessage: '7F 8F FF FE D9 5C 80 30 80 00 00 00 00',
            value: 0,
            type: 'real',
            min: -90,
            max: 10,
            zero: 0,
        },
        {
            mixerMessage:
                '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 a1 15 31 13 a1 11 31 0f a2 0d 00 00 00 00 ',
            value: 0,
            type: 'real',
            min: -90,
            max: 10,
            zero: 0,
        },
    ],
    pingResponseCommand: [emptyMixerMessage()],
    pingTime: 6000, //Bypass ping when pingTime is zero
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [
        {
            channelTypeName: 'MONO',
            channelTypeColor: '#2f2f2f',
            fromMixer: {
                /*
                Max mono 2:
                29a1273125a1233121a11f311da21b3119a1173115a2133111e10f31
                7f 8f ff fe d9 5c 80 30 80 a1 2b 
                31 29 a1 27 
                31 25 a1 23 
                31 21 a1 1f 
                31 1d a2 1b 
                31 19 a1 17 
                31 15 a2 13 
                31 11 e1 0f 
                31 0d 63 0b 09 09 80 02 0d cc cc cc cc cc cd 0 0 0 0
                Min mono 2:
                7f 8f ff fe d9 5c 80 30 80 a1 25 
                31 23 a1 21 
                31 1f a1 1d 
                31 1b a1 19 
                31 17 a2 15 
                31 13 a1 11 
                31 0f a2 0d 
                31 0b e1 09 
                31 07 63 05 09 03 c0 06 2d 00 00 00 00
                */
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage: 'a1 a1 a1 {channel} a1 a2',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_VU: [emptyMixerMessage()],
                CHANNEL_VU_REDUCTION: [emptyMixerMessage()],
                CHANNEL_NAME: [emptyMixerMessage()],
                PFL: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [emptyMixerMessage()],
                RATIO: [emptyMixerMessage()],
                DELAY_TIME: [emptyMixerMessage()],
                LOW: [emptyMixerMessage()],
                LO_MID: [emptyMixerMessage()],
                MID: [emptyMixerMessage()],
                HIGH: [emptyMixerMessage()],
                AUX_LEVEL: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 29 31 27 a1 25 31 23 a1 21 31 1f a1 1d 31 1b {channel} 19 31 17 a1 15 31 13 a4 11 31 0f {aux} 0d 31 0b e1 09 31 07 63 {argument}',
                        //'7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_ON: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a1 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 01 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_OFF: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a1 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 00 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
            },
            toMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        // 7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {a3} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {05 09 03 c0 06 13 00 00 00 00}
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_NAME: [
                    {
                        mixerMessage:
                            'System/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Functions/Channel Attribute/User Label',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                PFL_ON: [emptyMixerMessage()],
                PFL_OFF: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [emptyMixerMessage()],
                RATIO: [emptyMixerMessage()],
                DELAY_TIME: [emptyMixerMessage()],
                LOW: [emptyMixerMessage()],
                LO_MID: [emptyMixerMessage()],
                MID: [emptyMixerMessage()],
                HIGH: [emptyMixerMessage()],
                AUX_LEVEL: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 29 31 27 a1 25 31 23 a1 21 31 1f a1 1d 31 1b {channel} 19 31 17 a1 15 31 13 a4 11 31 0f {aux} 0d 31 0b e1 09 31 07 63 {argument}',
                        //'7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_ON: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a1 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 01 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_OFF: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a1 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 00 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
            },
        },
        {
            channelTypeName: 'ST',
            channelTypeColor: '#3f2f2f',
            fromMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage:
                            'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Fader/Value',
                        value: 0,
                        type: 'real',
                        min: 0,
                        max: 1000,
                        zero: 750,
                    },
                ],
                CHANNEL_VU: [emptyMixerMessage()],
                CHANNEL_VU_REDUCTION: [emptyMixerMessage()],
                CHANNEL_NAME: [
                    {
                        mixerMessage:
                            'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Channel Attribute/User Label',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                PFL: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [emptyMixerMessage()],
                RATIO: [emptyMixerMessage()],
                DELAY_TIME: [emptyMixerMessage()],
                LOW: [emptyMixerMessage()],
                LO_MID: [emptyMixerMessage()],
                MID: [emptyMixerMessage()],
                HIGH: [emptyMixerMessage()],
                AUX_LEVEL: [emptyMixerMessage()],
                CHANNEL_MUTE_ON: [emptyMixerMessage()],
                CHANNEL_MUTE_OFF: [emptyMixerMessage()],
            },
            toMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        // 7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a2 19 31 17 b9 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 80 03 05 00 00 00 00
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a2 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_NAME: [
                    {
                        mixerMessage:
                            'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Channel Attribute/User Label',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                PFL_ON: [emptyMixerMessage()],
                PFL_OFF: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [emptyMixerMessage()],
                RATIO: [emptyMixerMessage()],
                DELAY_TIME: [emptyMixerMessage()],
                LOW: [emptyMixerMessage()],
                LO_MID: [emptyMixerMessage()],
                MID: [emptyMixerMessage()],
                HIGH: [emptyMixerMessage()],
                AUX_LEVEL: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 29 31 27 a1 25 31 23 a1 21 31 1f a2 1d 31 1b {channel} 19 31 17 a1 15 31 13 a4 11 31 0f {aux} 0d 31 0b e1 09 31 07 63 {argument}',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_ON: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a2 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 01 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_OFF: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a2 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 00 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
            },
        },
        {
            channelTypeName: 'Inp X',
            channelTypeColor: '#2f3f2f',
            fromMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage:
                            'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Fader/Value',
                        value: 0,
                        type: 'real',
                        min: 0,
                        max: 1000,
                        zero: 750,
                    },
                ],
                CHANNEL_VU: [emptyMixerMessage()],
                CHANNEL_VU_REDUCTION: [emptyMixerMessage()],
                CHANNEL_NAME: [
                    {
                        mixerMessage:
                            'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Channel Attribute/User Label',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                PFL: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [emptyMixerMessage()],
                RATIO: [emptyMixerMessage()],
                DELAY_TIME: [emptyMixerMessage()],
                LOW: [emptyMixerMessage()],
                LO_MID: [emptyMixerMessage()],
                MID: [emptyMixerMessage()],
                HIGH: [emptyMixerMessage()],
                AUX_LEVEL: [emptyMixerMessage()],
                CHANNEL_MUTE_ON: [emptyMixerMessage()],
                CHANNEL_MUTE_OFF: [emptyMixerMessage()],
            },
            toMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a3 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_NAME: [
                    {
                        mixerMessage:
                            'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Channel Attribute/User Label',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                PFL_ON: [emptyMixerMessage()],
                PFL_OFF: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [emptyMixerMessage()],
                RATIO: [emptyMixerMessage()],
                DELAY_TIME: [emptyMixerMessage()],
                LOW: [emptyMixerMessage()],
                LO_MID: [emptyMixerMessage()],
                MID: [emptyMixerMessage()],
                HIGH: [emptyMixerMessage()],
                AUX_LEVEL: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 29 31 27 a1 25 31 23 a1 21 31 1f a3 1d 31 1b {channel} 19 31 17 a1 15 31 13 a4 11 31 0f {aux} 0d 31 0b e1 09 31 07 63 {argument}',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_ON: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a3 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 01 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
                CHANNEL_MUTE_OFF: [
                    {
                        mixerMessage:
                            '7f 8f ff fe d9 5c 80 30 80 a1 23 31 21 a1 1f 31 1d a1 1b 31 19 a3 17 31 15 {channel} 13 31 11 a1 0f 31 0d a2 0b 31 09 e2 07 31 05 63 03 02 01 00 00 00 00 00',
                        value: 0,
                        type: 'real',
                        min: -90,
                        max: 10,
                        zero: 0,
                    },
                ],
            },
        },
    ],
    fader: {
        min: -90,
        max: 10,
        zero: 0,
        step: 1,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    },
}

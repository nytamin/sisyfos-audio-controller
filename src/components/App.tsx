import React, { Component } from 'react';
import { connect } from "react-redux";
import { Store } from '../reducers/indexReducer';

import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';

//Utils:
import { loadSnapshotState, saveSnapshotState } from '../utils/SettingsStorage';
import { MixerConnection } from '../utils/MixerConnection';
import { AutomationConnection } from '../utils/AutomationConnection';


class App extends Component<any, any> {
    mixerConnection: any;
    automationConnection: any;

    constructor(props: any) {
        super(props)
    }

    componentWillMount() {
        this.mixerConnection = new MixerConnection(this.props.store);
        this.automationConnection = new AutomationConnection(this.props.store, this.mixerConnection);
        this.snapShopStoreTimer();
        loadSnapshotState(this.props.store.channels[0], this.props.store.settings[0].numberOfChannels);
    }

    snapShopStoreTimer() {
        const saveTimer = setInterval(() => {
                saveSnapshotState(this.props.store.channels[0]);
            },
            2000);
    }

    render() {
        return (
        <div>
            <Channels mixerConnection = {this.mixerConnection} />
            {this.props.store.settings[0].showSettings ? <Settings/> : <div></div>}
        </div>
        )
    }
}


const mapStateToProps = (state: any) => {
    return {
        store: state
    }
}

export default connect<any, any>(mapStateToProps)(App) as any;

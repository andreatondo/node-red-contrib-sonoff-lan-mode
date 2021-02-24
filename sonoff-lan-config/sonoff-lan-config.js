const HANDSHAKE_TIMEOUT = 20 * 1000;
const RECONNECT_INTERVAL = 2 * 60  * 1000;

module.exports = function (RED) {
    function setSonoffStatus(node, status) {
        node.connectionStatus = status;
        node.emit('sonoffConnectionStatus', status);
    }

    function setSwitchStatus(node, status) {
        node.switchStatus = status;
        node.emit('sonoffSwitchStatus', status);
    }

    function SonoffLanConfigNode(config) {
        RED.nodes.createNode(this, config);

        this.host = config.host;
        this.port = config.port;
        this.deviceID = null;
        this.connectionStatus = 'initializing';
        this.switchStatus = 'unknown';

        this.setNodeStatus = function (node) {
            let status = this.connectionStatus;
            switch (this.connectionStatus) {
                case 'initializing':
                    node.status({fill: 'yellow', shape: 'dot', text: status});
                    break;
                case 'disconnected':
                    node.status({fill: 'red', shape: 'ring', text: status});
                    break;
                case 'failed':
                    node.status({fill: 'red', shape: 'ring', text: status});
                    break;
                case 'connected':
                    status += ', ' + this.switchStatus;
                    node.status({fill: 'green', shape: 'dot', text: status});
                    break;
                case '':
                    node.status({});
                    break;
                default:
                    node.status({fill: 'red', shape: 'ring', text: 'unknown'});
            }
        };

        this.fetchStatus = function () {
            const userOnlineMsg = {
                'action': 'userOnline',
                'userAgent': 'app',
                'version': 6,
                'nonce': '218114712620886',
                'apkVesrion': '1.8',
                'os': 'ios',
                'at': 'at',
                'apikey': 'apikey',
                'ts': Math.floor(new Date() / 1000) + '',
                'model': 'iPhone10,6',
                'romVersion': '11.1.2',
                'sequence': Math.floor(new Date()) + '',
            };
            this.ws.send(JSON.stringify(userOnlineMsg));
        };

        const WebSocket = require('ws');
        this.openConnection = () => {
            const ws = new WebSocket(
                'ws://' + this.host + ':' + this.port + '/',
                ['chat'],
                {handshakeTimeout: HANDSHAKE_TIMEOUT}
            );
            this.ws = ws;

            ws.on('error', (error) => {
                setSonoffStatus(this, 'failed');
            });

            ws.on('open', () => {
                this.log('Websocket connection enstablished!');
                this.fetchStatus();
            });

            ws.on('message', (data) => {
                let response = JSON.parse(data);
                if (this.deviceID === null) {
                    if (response.deviceid) {
                        this.deviceID = response.deviceid;
                        setSonoffStatus(this, 'connected');
                    } else {
                        setSonoffStatus(this, 'failed');
                        setTimeout(this.fetchStatus, 60 * 1000);
                    }
                } else if (response.params && response.params.switch) {
                    setSwitchStatus(this, response.params.switch);
                }
            });

            ws.on('close', () => {
                this.deviceID = null;
                setSonoffStatus(this, 'disconnected');
                setTimeout(this.openConnection, RECONNECT_INTERVAL);
            });
        };
        this.openConnection();

        this.on('close', function () {
            setSonoffStatus(this, "");
            this.removeAllListeners("sonoffConnectionStatus");

            setSwitchStatus(this, "");
            this.removeAllListeners("sonoffSwitchStatus");
        });
    }

    RED.nodes.registerType("sonoff-lan-config", SonoffLanConfigNode);
}
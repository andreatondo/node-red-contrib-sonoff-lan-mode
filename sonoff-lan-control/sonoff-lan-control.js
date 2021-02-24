module.exports = function (RED) {
    function SonoffLanControlNode(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        let sonoffConfig = RED.nodes.getNode(config.sonoffConfig);
        if (sonoffConfig) {
            node.statusListener = function (status) {
                sonoffConfig.setNodeStatus(node);
            }
            sonoffConfig.addListener('sonoffConnectionStatus', node.statusListener);
            sonoffConfig.addListener('sonoffSwitchStatus', node.statusListener);

            sonoffConfig.setNodeStatus(node);
        }

        node.on('input', function (msg) {
            if (!sonoffConfig) {
                return;
            }

            let updateMsg = {
                'action': 'update',
                'userAgent': 'app',
                'params': {
                    'switch': '',
                },
                'apikey': 'no-apikey', // No apikey needed in LAN mode
                'deviceid': sonoffConfig.deviceID,
                'sequence': Math.floor(new Date()) + '',
                'controlType': 4,
                'ts':  Math.floor(new Date() / 1000) + '',
            };

            updateMsg.params.switch = msg.payload.toLowerCase();

            sonoffConfig.ws.send(JSON.stringify(updateMsg));
            setTimeout(() => {
                sonoffConfig.fetchStatus();
            }, 300);
        });

        node.on('close', function () {
            if (node.statusListener) {
                node.sonoffConfig.removeListener("sonoffConnectionStatus", node.statusListener);
                node.sonoffConfig.removeListener("sonoffSwitchStatus", node.statusListener);
            }
        });

    }

    RED.nodes.registerType("sonoff-lan-control", SonoffLanControlNode);
};
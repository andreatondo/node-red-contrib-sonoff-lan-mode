module.exports = function (RED) {
    function SonoffLanListenerNode(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        let sonoffConfig = RED.nodes.getNode(config.sonoffConfig);
        if (sonoffConfig) {
            node.connectionStatusListener = function (status) {
                sonoffConfig.setNodeStatus(node);
            }
            sonoffConfig.addListener('sonoffConnectionStatus', node.connectionStatusListener);

            node.switchStatusListener = function (status) {
                let msg = {};
                msg.payload = status;
                node.send(msg);
                sonoffConfig.setNodeStatus(node);
            }
            sonoffConfig.addListener('sonoffSwitchStatus', node.switchStatusListener);

            sonoffConfig.setNodeStatus(node);
        }

        node.on('close', function () {
            if (node.connectionStatusListener) {
                node.sonoffConfig.removeListener("sonoffConnectionStatus", node.connectionStatusListener);
            }
            if (node.switchStatusListener) {
                node.sonoffConfig.removeListener("sonoffSwitchStatus", node.switchStatusListener);
            }
        });
    }

    RED.nodes.registerType("sonoff-lan-listener", SonoffLanListenerNode);
};
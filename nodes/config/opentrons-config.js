module.exports = function(RED) {
    function OpentronsConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.hostname = config.hostname;
        this.port = config.port || 31950;
        this.token = this.credentials.token;
    }
    
    RED.nodes.registerType("opentrons-config", OpentronsConfigNode, {
        credentials: {
            token: {type: "text"}
        }
    });
}
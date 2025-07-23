const axios = require('axios');

module.exports = function(RED) {
    function OpentronsLightsNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        
        this.server = RED.nodes.getNode(config.server);
        
        node.on('input', async function(msg, send, done) {
            if (!node.server) {
                node.error("No server configuration specified");
                return done(new Error("No server configuration specified"));
            }
            
            const hostname = node.server.hostname;
            const port = node.server.port || 31950;
            const token = node.server.token;
            
            const headers = {
                'Opentrons-Version': '3'
            };
            
            if (token) {
                headers['authenticationBearer'] = token;
            }
            
            const baseURL = `http://${hostname}:${port}`;
            
            // Get the 'on' state from config or msg
            let lightsOn = config.lightsOn;
            if (msg.payload !== undefined && typeof msg.payload === 'boolean') {
                lightsOn = msg.payload;
            } else if (msg.payload !== undefined && typeof msg.payload === 'object' && msg.payload.on !== undefined) {
                lightsOn = msg.payload.on;
            }
            
            try {
                node.status({fill: "blue", shape: "dot", text: "setting lights"});
                
                const response = await axios.post('/robot/lights', {
                    on: lightsOn
                }, {
                    baseURL: baseURL,
                    headers: headers
                });
                
                msg.payload = response.data;
                node.status({fill: "green", shape: "dot", text: lightsOn ? "on" : "off"});
                send(msg);
                done();
            } catch (error) {
                node.status({fill: "red", shape: "dot", text: "error"});
                if (done) {
                    done(error);
                } else {
                    node.error(error, msg);
                }
            }
        });
        
        node.on('close', function() {
            node.status({});
        });
    }
    
    RED.nodes.registerType("opentrons-lights", OpentronsLightsNode);
}
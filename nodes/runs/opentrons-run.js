const axios = require('axios');

module.exports = function(RED) {
    function OpentronsRunNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        
        this.server = RED.nodes.getNode(config.server);
        this.action = config.action;
        
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
            
            try {
                node.status({fill: "blue", shape: "dot", text: "processing"});
                
                let response;
                const action = msg.action || node.action;
                
                switch(action) {
                    case 'create':
                        const createData = msg.payload || {};
                        response = await axios.post('/runs', createData, {
                            baseURL: baseURL,
                            headers: headers
                        });
                        break;
                        
                    case 'get':
                        const runId = msg.runId || msg.payload?.runId;
                        if (!runId) {
                            throw new Error("Run ID is required for get action");
                        }
                        response = await axios.get(`/runs/${runId}`, {
                            baseURL: baseURL,
                            headers: headers
                        });
                        break;
                        
                    case 'list':
                        response = await axios.get('/runs', {
                            baseURL: baseURL,
                            headers: headers
                        });
                        break;
                        
                    case 'delete':
                        const deleteRunId = msg.runId || msg.payload?.runId;
                        if (!deleteRunId) {
                            throw new Error("Run ID is required for delete action");
                        }
                        response = await axios.delete(`/runs/${deleteRunId}`, {
                            baseURL: baseURL,
                            headers: headers
                        });
                        break;
                        
                    case 'current':
                        response = await axios.get('/runs/current_run', {
                            baseURL: baseURL,
                            headers: headers
                        });
                        break;
                        
                    default:
                        throw new Error(`Unknown action: ${action}`);
                }
                
                msg.payload = response.data;
                node.status({fill: "green", shape: "dot", text: "success"});
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
    
    RED.nodes.registerType("opentrons-run", OpentronsRunNode);
}
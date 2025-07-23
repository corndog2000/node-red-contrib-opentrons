const axios = require('axios');

module.exports = function(RED) {
    function OpentronsMaintenanceRunNode(config) {
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
                        response = await axios.post('/maintenance_runs', {
                            data: {}
                        }, {
                            baseURL: baseURL,
                            headers: headers
                        });
                        
                        // Store the maintenance run ID in the node configuration if auto-store is enabled
                        if (config.autoStore && response.data && response.data.data) {
                            const newId = response.data.data.id;
                            
                            // Update this node's configuration
                            const nodeToUpdate = RED.nodes.getNode(node.id);
                            if (nodeToUpdate) {
                                nodeToUpdate.maintenanceRunId = newId;
                                
                                // Save the updated configuration
                                RED.nodes.dirty(true);
                            }
                            
                            // Also update all maintenance command nodes on the same server to use this ID
                            RED.nodes.eachNode(function(otherNode) {
                                if (otherNode.type === 'opentrons-maintenance-command' && 
                                    otherNode.server === config.server && 
                                    otherNode.autoUseLatest !== false) {
                                    
                                    const commandNode = RED.nodes.getNode(otherNode.id);
                                    if (commandNode) {
                                        commandNode.maintenanceRunId = newId;
                                    }
                                }
                            });
                        }
                        break;
                        
                    case 'get':
                        const runId = config.maintenanceRunId || msg.maintenanceRunId || msg.payload?.maintenanceRunId;
                        if (!runId) {
                            throw new Error("Maintenance Run ID is required for get action. Either configure it in the node or pass it via msg.maintenanceRunId");
                        }
                        response = await axios.get(`/maintenance_runs/${runId}`, {
                            baseURL: baseURL,
                            headers: headers
                        });
                        break;
                        
                    case 'delete':
                        const deleteRunId = config.maintenanceRunId || msg.maintenanceRunId || msg.payload?.maintenanceRunId;
                        if (!deleteRunId) {
                            throw new Error("Maintenance Run ID is required for delete action. Either configure it in the node or pass it via msg.maintenanceRunId");
                        }
                        response = await axios.delete(`/maintenance_runs/${deleteRunId}`, {
                            baseURL: baseURL,
                            headers: headers
                        });
                        
                        // Clear the stored ID from this node and all command nodes if we deleted it
                        if (config.autoStore) {
                            const nodeToUpdate = RED.nodes.getNode(node.id);
                            if (nodeToUpdate) {
                                nodeToUpdate.maintenanceRunId = "";
                                RED.nodes.dirty(true);
                            }
                            
                            // Clear from command nodes too
                            RED.nodes.eachNode(function(otherNode) {
                                if (otherNode.type === 'opentrons-maintenance-command' && 
                                    otherNode.server === config.server) {
                                    
                                    const commandNode = RED.nodes.getNode(otherNode.id);
                                    if (commandNode && commandNode.maintenanceRunId === deleteRunId) {
                                        commandNode.maintenanceRunId = "";
                                    }
                                }
                            });
                        }
                        break;
                        
                    case 'current':
                        response = await axios.get('/maintenance_runs/current_run', {
                            baseURL: baseURL,
                            headers: headers
                        });
                        break;
                        
                    default:
                        throw new Error(`Unknown action: ${action}`);
                }
                
                msg.payload = response.data;
                
                // Always set the ID in msg for backward compatibility
                if (action === 'create' && response.data && response.data.data) {
                    msg.maintenanceRunId = response.data.data.id;
                }
                
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
    
    RED.nodes.registerType("opentrons-maintenance-run", OpentronsMaintenanceRunNode);
}
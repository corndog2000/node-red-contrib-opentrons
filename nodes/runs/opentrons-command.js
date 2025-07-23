const axios = require('axios');

module.exports = function(RED) {
    function OpentronsCommandNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        
        this.server = RED.nodes.getNode(config.server);
        this.commandType = config.commandType;
        
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
                node.status({fill: "blue", shape: "dot", text: "sending command"});
                
                const runId = msg.runId || msg.payload?.runId;
                if (!runId) {
                    throw new Error("Run ID is required. You must first create a run using the 'Run Management' node with 'Create Run' action, then pass the run ID as msg.runId");
                }
                
                // Get command type
                const commandType = msg.commandType || config.commandType;
                if (!commandType) {
                    throw new Error("Command type is required");
                }
                
                // Build command data
                let commandData = {
                    commandType: commandType,
                    params: {}
                };
                
                // Add parameters based on command type
                switch(commandType) {
                    case 'aspirate':
                    case 'dispense':
                        if (config.pipetteId || msg.pipetteId) commandData.params.pipetteId = msg.pipetteId || config.pipetteId;
                        if (config.labwareId || msg.labwareId) commandData.params.labwareId = msg.labwareId || config.labwareId;
                        if (config.wellName || msg.wellName) commandData.params.wellName = msg.wellName || config.wellName;
                        if (config.volume || msg.volume) commandData.params.volume = parseFloat(msg.volume || config.volume);
                        if (config.flowRate || msg.flowRate) commandData.params.flowRate = parseFloat(msg.flowRate || config.flowRate);
                        if (config.wellLocation || msg.wellLocation) commandData.params.wellLocation = msg.wellLocation || config.wellLocation;
                        if (config.offset || msg.offset) commandData.params.offset = msg.offset || config.offset;
                        break;
                        
                    case 'blowout':
                        if (config.pipetteId || msg.pipetteId) commandData.params.pipetteId = msg.pipetteId || config.pipetteId;
                        if (config.labwareId || msg.labwareId) commandData.params.labwareId = msg.labwareId || config.labwareId;
                        if (config.wellName || msg.wellName) commandData.params.wellName = msg.wellName || config.wellName;
                        if (config.flowRate || msg.flowRate) commandData.params.flowRate = parseFloat(msg.flowRate || config.flowRate);
                        if (config.wellLocation || msg.wellLocation) commandData.params.wellLocation = msg.wellLocation || config.wellLocation;
                        if (config.offset || msg.offset) commandData.params.offset = msg.offset || config.offset;
                        break;
                        
                    case 'pickUpTip':
                    case 'dropTip':
                        if (config.pipetteId || msg.pipetteId) commandData.params.pipetteId = msg.pipetteId || config.pipetteId;
                        if (config.labwareId || msg.labwareId) commandData.params.labwareId = msg.labwareId || config.labwareId;
                        if (config.wellName || msg.wellName) commandData.params.wellName = msg.wellName || config.wellName;
                        if (config.wellLocation || msg.wellLocation) commandData.params.wellLocation = msg.wellLocation || config.wellLocation;
                        if (config.offset || msg.offset) commandData.params.offset = msg.offset || config.offset;
                        break;
                        
                    case 'moveToWell':
                        if (config.pipetteId || msg.pipetteId) commandData.params.pipetteId = msg.pipetteId || config.pipetteId;
                        if (config.labwareId || msg.labwareId) commandData.params.labwareId = msg.labwareId || config.labwareId;
                        if (config.wellName || msg.wellName) commandData.params.wellName = msg.wellName || config.wellName;
                        if (config.wellLocation || msg.wellLocation) commandData.params.wellLocation = msg.wellLocation || config.wellLocation;
                        if (config.offset || msg.offset) commandData.params.offset = msg.offset || config.offset;
                        if (config.minimumZHeight || msg.minimumZHeight) commandData.params.minimumZHeight = parseFloat(msg.minimumZHeight || config.minimumZHeight);
                        if (config.forceDirect !== undefined || msg.forceDirect !== undefined) commandData.params.forceDirect = msg.forceDirect !== undefined ? msg.forceDirect : config.forceDirect;
                        if (config.speed || msg.speed) commandData.params.speed = parseFloat(msg.speed || config.speed);
                        break;
                        
                    case 'moveLabware':
                        if (config.labwareId || msg.labwareId) commandData.params.labwareId = msg.labwareId || config.labwareId;
                        if (config.newLocation || msg.newLocation) commandData.params.newLocation = msg.newLocation || config.newLocation;
                        if (config.strategy || msg.strategy) commandData.params.strategy = msg.strategy || config.strategy;
                        break;
                        
                    case 'loadLabware':
                        if (config.location || msg.location) commandData.params.location = msg.location || config.location;
                        if (config.loadName || msg.loadName) commandData.params.loadName = msg.loadName || config.loadName;
                        if (config.namespace || msg.namespace) commandData.params.namespace = msg.namespace || config.namespace;
                        if (config.version || msg.version) commandData.params.version = parseInt(msg.version || config.version);
                        if (config.labwareId || msg.labwareId) commandData.params.labwareId = msg.labwareId || config.labwareId;
                        break;
                        
                    case 'loadPipette':
                        if (config.pipetteName || msg.pipetteName) commandData.params.pipetteName = msg.pipetteName || config.pipetteName;
                        if (config.mount || msg.mount) commandData.params.mount = msg.mount || config.mount;
                        if (config.pipetteId || msg.pipetteId) commandData.params.pipetteId = msg.pipetteId || config.pipetteId;
                        break;
                        
                    case 'home':
                        if (config.axes || msg.axes) {
                            const axes = msg.axes || config.axes;
                            commandData.params.axes = typeof axes === 'string' ? JSON.parse(axes) : axes;
                        }
                        break;
                        
                    case 'waitForResume':
                    case 'pause':
                        if (config.message || msg.message) commandData.params.message = msg.message || config.message;
                        break;
                        
                    case 'delay':
                        if (config.seconds || msg.seconds) commandData.params.seconds = parseFloat(msg.seconds || config.seconds);
                        break;
                }
                
                // Override with any params from message
                if (msg.params) {
                    commandData.params = { ...commandData.params, ...msg.params };
                }
                
                const response = await axios.post(`/runs/${runId}/commands`, {
                    data: commandData
                }, {
                    baseURL: baseURL,
                    headers: headers
                });
                
                msg.payload = response.data;
                node.status({fill: "green", shape: "dot", text: "command sent"});
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
    
    RED.nodes.registerType("opentrons-command", OpentronsCommandNode);
}
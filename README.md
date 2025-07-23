# node-red-contrib-opentrons

A Node-RED palette for controlling Opentrons robots through their REST API.

## Installation

```bash
cd ~/.node-red
npm install /path/to/node-red-contrib-opentrons
```

Or install directly from the Node-RED palette manager.

## Nodes

### Configuration Node
- **opentrons-config**: Stores connection details for the Opentrons robot (hostname, port, authentication token)

### Health & Status Nodes
- **Health Check**: Get the health status of the robot
- **Get Lights**: Get the current lights status
- **Set Lights**: Control the robot's lights (on/off)
- **Robot Settings**: Get the robot's current settings

### Hardware Nodes
- **Get Instruments**: List all attached instruments (pipettes)
- **Get Modules**: List all attached modules (temperature, magnetic, etc.)

### Protocol & Run Management
- **Protocol Management**: List, get, delete, or analyze protocols
- **Run Management**: Create, list, get, delete runs or get the current run
- **Send Command**: Send commands to an active run

## Usage Examples

### Basic Health Check Flow
```
[Inject Node] → [Health Check] → [Debug Node]
```

### Control Robot Lights
```
[Inject Node (true/false)] → [Set Lights] → [Debug Node]
```

### Run a Protocol
1. Create a run with protocol ID
2. Send commands to the run
3. Monitor run status

## Configuration

All nodes require an Opentrons configuration node that specifies:
- **Hostname**: The IP address or hostname of your Opentrons robot
- **Port**: The API port (default: 31950)
- **Token**: Optional authentication token

## API Version

This palette uses Opentrons API version 3 (`Opentrons-Version: 3` header).

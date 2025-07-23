# Maintenance Command Node - Complete Reference Guide

The Maintenance Command node allows direct robot control without pre-defined protocols. Commands are sent to maintenance runs, giving you real-time control over the Opentrons robot.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Command Types](#command-types)
4. [Parameter Reference](#parameter-reference)
5. [Common Workflows](#common-workflows)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)

## Overview

The Maintenance Command node sends commands directly to an Opentrons robot using maintenance runs. This provides immediate robot control without requiring a pre-written protocol file.

### Key Features
- **Direct robot control** - No protocol file needed
- **Real-time execution** - Commands execute immediately
- **Parameter override** - Configure via node settings or message properties
- **Auto-run detection** - Automatically uses the latest maintenance run
- **Comprehensive command set** - Support for all major robot operations

## Setup

### Prerequisites
1. Opentrons robot accessible on your network
2. Robot server configuration (using Opentrons Config node)
3. Active maintenance run (created with Maintenance Run node)

### Basic Configuration
1. Drag the **Maintenance Command** node to your flow
2. Configure the **Server** (Opentrons Config node)
3. Enable **Auto-use Latest Run** (recommended)
4. Select your **Command Type**
5. Configure command-specific parameters
6. Deploy and trigger

## Command Types

The node supports 15 different command types, each with specific parameters:

| Command Type | Purpose | Category |
|---|---|---|
| [aspirate](#aspirate) | Draw liquid into pipette | Liquid Handling |
| [dispense](#dispense) | Dispense liquid from pipette | Liquid Handling |
| [blowout](#blowout) | Expel remaining liquid | Liquid Handling |
| [pickUpTip](#pickuptip) | Pick up pipette tip | Tip Management |
| [dropTip](#droptip) | Drop pipette tip | Tip Management |
| [moveToWell](#movetowell) | Move pipette to well | Movement |
| [moveLabware](#movelabware) | Move labware | Movement |
| [loadLabware](#loadlabware) | Load labware onto deck | Setup |
| [loadPipette](#loadpipette) | Load pipette onto mount | Setup |
| [home](#home) | Home robot axes | Calibration |
| [pause](#pause) | Pause execution | Control |
| [waitForResume](#waitforresume) | Wait for user resume | Control |
| [delay](#delay) | Wait for specified time | Control |

## Parameter Reference

### Common Parameter Types

#### String Parameters
- **pipetteId**: Unique identifier for a loaded pipette
- **labwareId**: Unique identifier for loaded labware
- **wellName**: Well position (e.g., "A1", "B2", "H12")
- **mount**: Pipette mount position ("left" or "right")

#### Numeric Parameters
- **volume**: Liquid volume in microliters (μL)
- **flowRate**: Flow rate in microliters per second (μL/s)
- **speed**: Movement speed in millimeters per second (mm/s)
- **seconds**: Time duration in seconds

#### Location Parameters
- **wellLocation**: Position within a well
  - `"top"`: Above the well
  - `"bottom"`: At the bottom of the well
  - `"center"`: Middle of the well
- **offset**: 3D position offset from well location
  - Format: `{x: 0, y: 0, z: 0}` (in millimeters)

---

## Command Specifications

### aspirate

**Purpose**: Draw liquid into the pipette from a specified well.

**Required Parameters**:
- `pipetteId` (string): ID of the pipette to use
- `labwareId` (string): ID of the source labware
- `wellName` (string): Source well (e.g., "A1")
- `volume` (number): Volume to aspirate in μL

**Optional Parameters**:
- `flowRate` (number): Aspiration flow rate in μL/s
- `wellLocation` (string): Position in well ("top", "bottom", "center")
- `offset` (object): Position offset `{x, y, z}` in mm

**Example Configuration**:
```javascript
{
  pipetteId: "p300_single_1",
  labwareId: "source_plate",
  wellName: "A1",
  volume: 100,
  flowRate: 50,
  wellLocation: "bottom",
  offset: {x: 0, y: 0, z: 1}
}
```

**Use Cases**:
- Drawing reagents from source plates
- Transferring samples
- Mixing operations

---

### dispense

**Purpose**: Dispense liquid from the pipette to a specified well.

**Required Parameters**:
- `pipetteId` (string): ID of the pipette to use
- `labwareId` (string): ID of the destination labware
- `wellName` (string): Destination well (e.g., "B2")
- `volume` (number): Volume to dispense in μL

**Optional Parameters**:
- `flowRate` (number): Dispense flow rate in μL/s
- `wellLocation` (string): Position in well ("top", "bottom", "center")
- `offset` (object): Position offset `{x, y, z}` in mm

**Example Configuration**:
```javascript
{
  pipetteId: "p300_single_1",
  labwareId: "dest_plate",
  wellName: "B1",
  volume: 100,
  flowRate: 25,
  wellLocation: "bottom"
}
```

**Use Cases**:
- Delivering samples to destination wells
- Adding reagents to reactions
- Plate filling operations

---

### blowout

**Purpose**: Expel any remaining liquid from the pipette tip.

**Required Parameters**:
- `pipetteId` (string): ID of the pipette
- `labwareId` (string): ID of the labware to blowout into
- `wellName` (string): Well to blowout into

**Optional Parameters**:
- `flowRate` (number): Blowout flow rate in μL/s
- `wellLocation` (string): Position in well
- `offset` (object): Position offset `{x, y, z}` in mm

**Example Configuration**:
```javascript
{
  pipetteId: "p300_single_1",
  labwareId: "trash",
  wellName: "A1",
  flowRate: 100
}
```

**Use Cases**:
- Ensuring complete liquid transfer
- Cleaning pipette tip
- Removing air bubbles

---

### pickUpTip

**Purpose**: Pick up a pipette tip from a tip rack.

**Required Parameters**:
- `pipetteId` (string): ID of the pipette
- `labwareId` (string): ID of the tip rack
- `wellName` (string): Tip position to pick up (e.g., "A1")

**Optional Parameters**:
- `wellLocation` (string): Usually "top" for tip racks
- `offset` (object): Position offset `{x, y, z}` in mm

**Example Configuration**:
```javascript
{
  pipetteId: "p300_single_1",
  labwareId: "tiprack_1",
  wellName: "A1",
  wellLocation: "top"
}
```

**Use Cases**:
- Starting liquid handling operations
- Replacing contaminated tips
- Sequential tip usage

---

### dropTip

**Purpose**: Drop the current pipette tip.

**Required Parameters**:
- `pipetteId` (string): ID of the pipette
- `labwareId` (string): ID of the destination (trash or tip rack)
- `wellName` (string): Position to drop tip

**Optional Parameters**:
- `wellLocation` (string): Position in destination
- `offset` (object): Position offset `{x, y, z}` in mm

**Example Configuration**:
```javascript
{
  pipetteId: "p300_single_1",
  labwareId: "trash",
  wellName: "A1"
}
```

**Use Cases**:
- Ending liquid handling operations
- Preventing cross-contamination
- Tip disposal

---

### moveToWell

**Purpose**: Move the pipette to a specific well position without liquid handling.

**Required Parameters**:
- `pipetteId` (string): ID of the pipette
- `labwareId` (string): ID of the labware
- `wellName` (string): Well to move to

**Optional Parameters**:
- `wellLocation` (string): Position within well
- `offset` (object): Position offset `{x, y, z}` in mm
- `minimumZHeight` (number): Minimum Z height during movement (mm)
- `forceDirect` (boolean): Skip safe Z movements (default: false)
- `speed` (number): Movement speed in mm/s

**Example Configuration**:
```javascript
{
  pipetteId: "p300_single_1",
  labwareId: "plate_1",
  wellName: "C3",
  wellLocation: "center",
  minimumZHeight: 10,
  speed: 50
}
```

**Use Cases**:
- Positioning for mixing
- Pre-positioning before liquid handling
- Quality control positioning

---

### moveLabware

**Purpose**: Move labware from one deck position to another.

**Required Parameters**:
- `labwareId` (string): ID of the labware to move
- `newLocation` (string): Destination deck position ("1", "2", "3", etc.)

**Optional Parameters**:
- `strategy` (string): Movement strategy
  - `"usingGripper"`: Use gripper module
  - `"manualMoveWithPause"`: Pause for manual movement

**Example Configuration**:
```javascript
{
  labwareId: "plate_1",
  newLocation: "3",
  strategy: "usingGripper"
}
```

**Use Cases**:
- Rearranging deck layout
- Moving plates between stations
- Workflow optimization

---

### loadLabware

**Purpose**: Load new labware onto the deck.

**Required Parameters**:
- `location` (string): Deck position ("1", "2", "3", etc.)
- `loadName` (string): Labware definition name
- `namespace` (string): Labware namespace (usually "opentrons")
- `version` (number): Labware definition version

**Optional Parameters**:
- `labwareId` (string): Custom ID for the labware

**Example Configuration**:
```javascript
{
  location: "1",
  loadName: "opentrons_96_tiprack_300ul",
  namespace: "opentrons",
  version: 1,
  labwareId: "my_tiprack_1"
}
```

**Common Labware Names**:
- `"opentrons_96_tiprack_300ul"`: 300μL tip rack
- `"opentrons_96_tiprack_1000ul"`: 1000μL tip rack
- `"nest_96_wellplate_100ul_pcr_full_skirt"`: 96-well PCR plate
- `"opentrons_10_tuberack_falcon_4ml_6x2"`: Tube rack
- `"opentrons_1_trash_1100ml_fixed"`: Trash bin

**Use Cases**:
- Setting up experimental layouts
- Adding new labware during runs
- Dynamic protocol modification

---

### loadPipette

**Purpose**: Load a pipette onto a mount.

**Required Parameters**:
- `pipetteName` (string): Pipette model name
- `mount` (string): Mount position ("left" or "right")

**Optional Parameters**:
- `pipetteId` (string): Custom ID for the pipette

**Example Configuration**:
```javascript
{
  pipetteName: "p300_single",
  mount: "left",
  pipetteId: "my_p300"
}
```

**Common Pipette Names**:
- `"p10_single"`: 10μL single-channel
- `"p50_single"`: 50μL single-channel
- `"p300_single"`: 300μL single-channel
- `"p1000_single"`: 1000μL single-channel
- `"p20_multi_gen2"`: 20μL multi-channel
- `"p300_multi_gen2"`: 300μL multi-channel

**Use Cases**:
- Initial robot setup
- Changing pipettes mid-protocol
- Multi-pipette workflows

---

### home

**Purpose**: Home the robot's axes to their reference positions.

**Optional Parameters**:
- `axes` (array): Array of axes to home (default: all axes)
  - Available axes: `["x", "y", "z", "a", "b", "c"]`
  - Common combinations: `["x", "y", "z"]`, `["z"]`

**Example Configuration**:
```javascript
{
  axes: ["x", "y", "z"]  // Home XYZ axes only
}
```

**Axis Definitions**:
- `x`: Left-right movement
- `y`: Front-back movement  
- `z`: Up-down movement (left mount)
- `a`: Up-down movement (right mount)
- `b`: Left pipette plunger
- `c`: Right pipette plunger

**Use Cases**:
- Initial robot calibration
- Recovery from errors
- Preparing for manual intervention

---

### pause

**Purpose**: Pause execution and display a message to the user.

**Optional Parameters**:
- `message` (string): Message to display during pause

**Example Configuration**:
```javascript
{
  message: "Please check the tip rack and click resume when ready"
}
```

**Use Cases**:
- User intervention points
- Quality control checks
- Manual verification steps

---

### waitForResume

**Purpose**: Pause and wait for user to manually resume execution.

**Optional Parameters**:
- `message` (string): Message to display while waiting

**Example Configuration**:
```javascript
{
  message: "Replace the empty tip rack and click resume to continue"
}
```

**Use Cases**:
- Consumable replacement
- Equipment maintenance
- Manual sample handling

---

### delay

**Purpose**: Wait for a specified amount of time.

**Required Parameters**:
- `seconds` (number): Time to wait in seconds (decimals allowed)

**Example Configuration**:
```javascript
{
  seconds: 30.5  // Wait for 30.5 seconds
}
```

**Use Cases**:
- Incubation periods
- Settling time after movements
- Timing-critical protocols

---

## Common Workflows

### Basic Liquid Transfer
```
1. loadPipette (mount: "left", pipetteName: "p300_single")
2. loadLabware (location: "1", loadName: "opentrons_96_tiprack_300ul")
3. loadLabware (location: "2", loadName: "source_plate")
4. loadLabware (location: "3", loadName: "dest_plate")
5. pickUpTip (pipetteId: "p300_1", labwareId: "tiprack", wellName: "A1")
6. aspirate (pipetteId: "p300_1", labwareId: "source", wellName: "A1", volume: 100)
7. dispense (pipetteId: "p300_1", labwareId: "dest", wellName: "A1", volume: 100)
8. dropTip (pipetteId: "p300_1", labwareId: "trash", wellName: "A1")
```

### Multi-Well Transfer with Mixing
```
1. Setup (loadPipette, loadLabware commands)
2. pickUpTip
3. For each well:
   - moveToWell (position above source)
   - aspirate (partial volume)
   - moveToWell (mixing position)
   - dispense + aspirate (mixing cycles)
   - dispense (to destination)
4. dropTip
```

### Serial Dilution
```
1. Setup labware and pipette
2. For each dilution step:
   - pickUpTip
   - aspirate (from previous concentration)
   - dispense (to new well with diluent)
   - Mix by aspirate/dispense cycles
   - dropTip
```

## Parameter Override via Messages

All parameters can be overridden by setting properties on the input message:

```javascript
// Override volume and flow rate
msg.volume = 150;
msg.flowRate = 75;

// Override well location and offset
msg.wellLocation = "bottom";
msg.offset = {x: 1, y: 0, z: 2};

// Override multiple parameters at once
msg.params = {
  volume: 200,
  flowRate: 100,
  wellLocation: "center"
};
```

## Troubleshooting

### Common Errors

**"Maintenance Run ID is required"**
- Enable "Auto-use Latest Run" and create a maintenance run first
- Or manually configure a maintenance run ID
- Or pass the ID via `msg.maintenanceRunId`

**"Command type is required"**
- Select a command type in the node configuration
- Or set `msg.commandType` in your flow

**"Pipette not found"**
- Ensure the pipette is loaded using `loadPipette` command
- Verify the `pipetteId` matches the loaded pipette

**"Labware not found"**
- Ensure labware is loaded using `loadLabware` command
- Verify the `labwareId` matches the loaded labware

**"Well does not exist"**
- Check that the `wellName` exists in the specified labware
- Verify labware definition is correct

### Best Practices

1. **Always load before use**: Load pipettes and labware before referencing them
2. **Use consistent IDs**: Keep pipette and labware IDs consistent throughout your flow
3. **Handle tips properly**: Always pick up tips before liquid handling, drop when done
4. **Check parameters**: Verify volume limits and flow rates for your pipette
5. **Test incrementally**: Build and test your workflow step by step
6. **Use error handling**: Implement try/catch blocks in your Node-RED flow
7. **Monitor robot status**: Check robot health and calibration regularly

### Performance Tips

1. **Minimize movements**: Plan efficient paths between operations
2. **Batch operations**: Group similar commands together
3. **Use appropriate speeds**: Balance speed with accuracy
4. **Optimize tip usage**: Reuse tips when contamination isn't a concern
5. **Parallel operations**: Use multiple pipettes when possible

---

## Reference Information

### Deck Positions
- Standard deck positions: "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"
- Some positions may be reserved for modules or fixed labware

### Volume Limits by Pipette
- p10_single: 1-10 μL
- p50_single: 5-50 μL  
- p300_single: 30-300 μL
- p1000_single: 100-1000 μL

### Coordinate System
- X-axis: Left (negative) to Right (positive)
- Y-axis: Front (negative) to Back (positive)  
- Z-axis: Down (negative) to Up (positive)
- Origin at front-left corner of deck

This comprehensive reference should provide all the information needed to effectively use the Maintenance Command node for direct robot control.
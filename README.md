# Three.js Drone Visualizer
 

<img src="http://fireflyeindhoven.nl/wp-content/uploads/2017/06/cropped-Artboard-1-2.png" width="30%">

## To-do list
 - [x] Visualize basic drone using KeyFrames
 - [x] Make basic mapping of field	 
 - [ ] Add the LED's on the drone	 
 - [ ] Add shadows and spotlight camera
 - [ ] Read trajectory from a websocket	 
 - [ ] Animate roters on the drone
 - [x] Make the map user interactable	 
 - [ ] Add start/load screen
 - [ ] Create multiple environments
 - [ ] Playback controls

## Installation

No installation is needed. However, a local web server must be used to run index.html.

## How it works
A list of quaternions is taken from the MATLAB simulation and converted into a CSV file. The CSV file (located in docs) is then read and broken down into seperate arrays containing each quarternion and it's dedicated timeframe. The arrays are then parsed as a JSON through the Three.js KeyFrameTracker where the simulation is then animated.   

# node-red-contrib-sonoff-lan-mode

Node-RED nodes to communicate with Sonoff Smart Switch devices on LAN.

No need for API keys, nor eWeLink cloud connection. The only requirement is to have Node-RED in the same network where Sonoff devices are installed.

## Install

You can install this node directly from the "Manage Palette" menu in the Node-RED interface.

Alternatively, run the following command in your Node-RED user directory - typically ~/.node-red on Linux or %HOMEPATH%\.nodered on Windows

    npm install node-red-contrib-sonoff-lan-mode

## Usage

Define a Sonoff configuration node, setting Host (IP Address) and port (defaults to 8081).<br>
Then use one of the following nodes to interact with your Sonoff device.

### sonoff-lan-listener

A node that subscribes to events from Sonoff

### sonoff-lan-control

A node that controls the Sonoff switch

Accepts an input `msg.payload` with content "on" to turn on the Sonoff switch, and "off" to turn it off.

## Supported devices

The library has only been tested on Sonoff Basic switch. 
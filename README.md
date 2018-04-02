# KaDoot - Open Source Kahoot bot spammer

KaDoot is a Kahoot bot spammer written in Javascript. It is a product of my reverse engineering efforts of the Kahoot API.

## About
Kahoot primarily uses websockets to communicate between the clients and the server. It also uses a REST API to generate websocket address for the client to connect to.

## Usage
`node main.js [game id],[playername],[player count]`

#### NOTE
- all pareameters must be seperated by a comma without spaces in between
- the maximum number of players supported is 30 before it crashes

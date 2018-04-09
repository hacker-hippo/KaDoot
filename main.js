const readline = require('readline');
const https = require('https');
const WebSocket = require('ws');
const kahoot = require("./kahoot.js")

var game_id, playernames, playercount;

const endpoint = "https://kahoot.it/reserve/session/"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question('Enter Game ID, Player names, and player count (all seperated by commas): ', (answer) => {
    var splits = answer.split(",")
    game_id = splits[0]
    playernames = splits[1]
    playercount = parseInt(splits[2])

    //Generic challenge function that works without the AngularJS context. Also used to create a websocket path.
    function challenge(msg, offset){
    return msg.replace(/./g, function(char, position) {return String.fromCharCode((((char.charCodeAt(0) * position) + offset) % 77) + 48);})
    }

    //Some obfuscated function ripped from Kahoot.it. Used to create a websocket path given the base64 decoded session tocket & completed challenge
    function h(e, t) {
        for (var n = "", r = 0; r < e.length; r++) {
                var o = e.charCodeAt(r)
                  , i = t.charCodeAt(r % t.length)
                  , a = o ^ i;
                n += String.fromCharCode(a)
            }
        return n
     }

    //Iterate over how many plaers the user wants connected
    for (let i = 0; i < playercount; i++){
        let ws;
        let CLIENT_ID;

    //Make the HTTP request
    https.get(endpoint + game_id, (resp) => {
        let data = '';

        console.log(resp.statusCode)
        //Extract the session token
        var session = resp.headers['x-kahoot-session-token']

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        //Base64 decode the session token
        let session_decode = new Buffer(session, 'base64').toString()
            
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            end = JSON.parse(data)

            //Extract the offset and message
            var k = data.match("var offset(.*)\; ")[0]
            var msg = data.match(/decode\.call\(this\,\ \'(.*)\'\)\;/)[1]

            //Evalute the offset
            var offset = new Function(k + "return offset")()

            //Create the WS function endpoint
            var yay = h(session_decode, challenge(msg, offset))
            console.log('wss://kahoot.it/cometd/' + game_id + "/" + yay)
            ws = new WebSocket('wss://kahoot.it/cometd/' + game_id + "/" + yay);
            ws.on('open', function open() {
                console.log("Websocket opened")
                //Tell the server we said hello
                ws.send(kahoot.create_handshake_packet(1))
            });

            ws.on('message', function incoming(data) {
                console.log(data)
                response = JSON.parse(data);
                if (parseInt(response[0]["id"]) == 1){
                    //Step 1 
                    CLIENT_ID = response[0]["clientId"]

                    //Actually connect to the game
                    ws.send(kahoot.create_data_packet("/service/controller", CLIENT_ID, 
                        {
                            type: "login", 
                            gameid: game_id, 
                            host: "kahoot.it", 
                            name: playernames + "_" + i
                        },2));
                }
            });
        });
    
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });   
    }
  rl.close();
});



module.exports.create_data_packet = function (channel, clientID, data, id){
    var packet = [{
        "channel": channel,
        "clientId": clientID,
        "id": id.toString(),
        "data": data
    }]
    return JSON.stringify(packet)
}

/*
 *
 *
    * */

module.exports.create_handshake_packet = function(id){
    var packet = [{
        "version":"1.0",
        "minimumVersion":"1.0",
        "channel":"/meta/handshake",
        "supportedConnectionTypes":["websocket","long-polling"],
        "advice":{
            "timeout":60000,
            "interval":0
        },
        "id":id.toString()
    }]
    return JSON.stringify(packet)
}

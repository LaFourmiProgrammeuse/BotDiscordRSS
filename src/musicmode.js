const Youtube = require("./youtube.js");

var l_c_musicmode = [{}]; //On stocke dedans les couples d'ID text/voice channel

module.exports.ToogleMusicMode = function (text_channel_id, voice_channel_id) { console.log(l_c_musicmode);

    for(var i = 0; i < l_c_musicmode.length; i++){

        if(l_c_musicmode[i]["text_channel_id"] == text_channel_id && l_c_musicmode[i]["voice_channel_id"] == voice_channel_id){

            l_c_musicmode = l_c_musicmode.slice(i, 1);
            return;
        }
    }

    //Le channel n'est pas dans la liste, on l'ajoute pour activer le mode musique
    l_c_musicmode.push({"text_channel_id" : text_channel_id, "voice_channel_id" : voice_channel_id});

}

module.exports.IsMusicMode = function (channel_id){

    for(var i = 0; i < l_c_musicmode.length; i++){

        if(l_c_musicmode[i]["text_channel_id"] == channel_id || l_c_musicmode[i]["voice_channel_id"] == channel_id){
            return true;
        }
    }
    return false;
}

module.exports.Search = function (query, text_channel, client){


}

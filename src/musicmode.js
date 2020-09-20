const Youtube = require("./youtube.js");
const Command = require("./command.js");

var MusicMode = module.exports;

var l_c_musicmode = Array(); //On stocke dedans les couples d'ID text/voice channel

var l_video_last_search = [];
var index_video_search = 0;
var n_video_per_search = 15;

var l_dispatcher = new Map(); // ID voice channel / StreamDispatcher


//getters */* setters
module.exports.GetListDispatcher = function(){
    return l_dispatcher;
}

module.exports.ToogleMusicMode = function (text_channel_id, voice_channel_id, channel) {

    for(var i = 0; i < l_c_musicmode.length; i++){

        if(l_c_musicmode[i]["text_channel_id"] == text_channel_id && l_c_musicmode[i]["voice_channel_id"] == voice_channel_id){

            console.log(l_c_musicmode.splice(i, 1));
            channel.send("Music mode has been desactivated for this channel");

            Command.Stop([voice_channel_id]);

            return;
        }
    }

    //Le channel n'est pas dans la liste, on l'ajoute pour activer le mode musique
    l_c_musicmode.push({"text_channel_id" : text_channel_id, "voice_channel_id" : voice_channel_id});
    channel.send("Music mode has been activated for this channel");

}

module.exports.IsMusicMode = function (channel_id){

    for(var i = 0; i < l_c_musicmode.length; i++){

        if(l_c_musicmode[i]["text_channel_id"] == channel_id || l_c_musicmode[i]["voice_channel_id"] == channel_id){
            return true;
        }
    }
    return false;
}

module.exports.GetLinkedVoiceChannel = function(text_channel_id){

    var l_linked_voice_channel = [];

    for(var i = 0; i < l_c_musicmode.length; i++){

        if(l_c_musicmode[i]["text_channel_id"] == text_channel_id){
            l_linked_voice_channel.push(l_c_musicmode[i]["voice_channel_id"]);
        }
    }
    return l_linked_voice_channel;
}

function GetLinkedTextChannel(voice_channel_id){

    var l_linked_text_channel = [];

    for(var i = 0; i < l_c_musicmode.length; i++){

        if(l_c_musicmode[i]["voice_channel_id"] == voice_channel_id){
            l_linked_text_channel.push(l_c_musicmode[i]["text_channel_id"]);
        }
    }
    return l_linked_text_channel;
}

module.exports.SearchVideo = function (query, text_channel, client, auto_play){

    query = query.replace(" ", "+")

    var params = {
        "part": "snippet",
        "type": "video",
        "q": query,
        "maxResults": n_video_per_search
    }

    var callback_arg = {"text_channel": text_channel, "client": client, "auto_play": auto_play}

    Youtube.Search(params, TreatSearchResponse, callback_arg);

}

function TreatSearchResponse(response, callback_arg){

    var data = response.data;
    var items = data.items;

    l_video_last_search = items;
    index_video_search = 0;

    var text_channel = callback_arg["text_channel"];
    var client = callback_arg["client"];
    var auto_play = callback_arg["auto_play"];

    Play(text_channel, client, auto_play);

}

async function Play(text_channel, client, auto_play){

    var url_video_to_play = "https://www.youtube.com/watch?v=" + l_video_last_search[index_video_search].id.videoId; console.log(url_video_to_play);
    var video_title = l_video_last_search[index_video_search].snippet.title;

    var l_voice_channel_id = MusicMode.GetLinkedVoiceChannel(text_channel.id);
    var l_voice_channel = [];

    for(voice_channel_id of l_voice_channel_id){

        var voice_channel = await client.channels.fetch(voice_channel_id);
        l_voice_channel.push(voice_channel);

        await voice_channel.join();


        if(auto_play){
            AutoPlay(voice_channel_id, url_video_to_play); console.log("autoplay");
        }
        else{
            var dispatcher = Command.Broadcast(voice_channel_id, url_video_to_play, 1); console.log("broadcast classique");
            dispatcher.on("finish", () => {
              MusicMode.GetListDispatcher().delete(voice_channel_id);
              console.log(MusicMode.GetListDispatcher());
            });
        }

    }

    if(auto_play){
        text_channel.send("Playing the title : "+video_title+" (Autoplay activated)");
    }
    else{
        text_channel.send("Playing the title : "+video_title);
    }
}

function AutoPlay(voice_channel_id, media_to_play) {

    Command.Broadcast(voice_channel_id, media_to_play, 1);

    var dispatcher = l_music_dispatcher.get(voice_channel_id);

    if(dispatcher == undefined){
        return;
    }

    dispatcher.on("finish", () => {
        MusicMode.AutoPlay(voice_channel_id, media_to_play);
    });

}

module.exports.NextVideo = function(text_channel, client){

    if(index_video_search+1 < n_video_per_search){
        index_video_search++;
    }

    Play(text_channel, client);
}

const Youtube = require("./youtube.js");
const Command = require("./command.js");

var l_c_musicmode = Array(); //On stocke dedans les couples d'ID text/voice channel

var l_video_last_search = [];
var index_video_search = 0;
var n_video_per_search = 15;

module.exports.ToogleMusicMode = function (text_channel_id, voice_channel_id, channel) {

    console.log(l_c_musicmode); console.log(text_channel_id + voice_channel_id);

    for(var i = 0; i < l_c_musicmode.length; i++){

        if(l_c_musicmode[i]["text_channel_id"] == text_channel_id && l_c_musicmode[i]["voice_channel_id"] == voice_channel_id){

            console.log(l_c_musicmode.splice(i, 1)); console.log(i);
            channel.send("Music mode has been desactivated for this channel");

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

function GetLinkedVoiceChannel(text_channel_id){

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

module.exports.SearchVideo = function (query, text_channel, client){

    query = query.replace(" ", "+")

    var params = {
        "part": "snippet",
        "type": "video",
        "q": query,
        "maxResults": n_video_per_search
    }

    var callback_arg = {"text_channel": text_channel, "client": client}

    Youtube.Search(params, TreatSearchResponse, callback_arg);

}

function TreatSearchResponse(response, callback_arg){

    var data = response.data;
    var items = data.items;

    l_video_last_search = items;
    index_video_search = 0;

    var text_channel = callback_arg["text_channel"];
    var client = callback_arg["client"];

    Play(text_channel, client);

}

async function Play(text_channel, client){

    var url_video_to_play = "https://www.youtube.com/watch?v=" + l_video_last_search[index_video_search].id.videoId; console.log(url_video_to_play);
    var video_title = l_video_last_search[index_video_search].snippet.title;

    var l_voice_channel_id = GetLinkedVoiceChannel(text_channel.id);
    var l_voice_channel = [];

    for(voice_channel_id of l_voice_channel_id){

        console.log(voice_channel_id);

        var voice_channel = await client.channels.fetch(voice_channel_id);
        l_voice_channel.push(voice_channel);

        await voice_channel.join();

        Command.Broadcast(voice_channel_id, url_video_to_play, 0);
        text_channel.send("Playing the title : "+video_title)
    }
}

module.exports.NextVideo = function(text_channel, client){

    if(index_video_search+1 < n_video_per_search){
        index_video_search++;
    }

    Play(text_channel, client);
}

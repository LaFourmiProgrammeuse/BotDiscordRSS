'use strict';

//Modules
const Discord = require('discord.js');
const Fs = require("fs");
const Stream = require("stream");
const Ytdl = require("ytdl-core");

const SynthesizeSpeech = require("./synthesize_speech.js");
const Index = require("./index.js");
const MusicMode = require("./musicmode.js");
const Rss = require("./rss.js");

var client = Index.GetDiscordClient();

var commands_def;
Fs.readFile("./commands.json", "utf8", (err, data) => {
    if(err) throw err;
    else commands_def = JSON.parse(data);
});

var Command = module.exports;


module.exports.TreatCommand = async function (command_no_parsed, channel, author) {

    Log("La commande \"" + command_no_parsed + "\" a été executé par " + author.username);

    var command = ParseCommand(command_no_parsed); //Command parsed
    var n_arg = command.length;

    switch(command[0]) {
        case "help":

        if(n_arg > 2){
            channel.send("Error : Too many arguments");
            break;
        }

        var page_index = parseInt(command[1]);

        if(isNaN(page_index)){
            page_index = 1;
        }

        ShowHelp(channel, page_index);
        break;

        case "moveto":

        if(n_arg > 2){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 2){
            channel.send("Error : Not enough arguments");
            break;
        }

        var channel_str = command[1];
        var channel_id = GetChannelId(channel.guild, channel_str);

        client.channels.fetch(channel_id).then(function (channel) {
            channel.join();
        });

        break;

        case "broadcast":

        if(n_arg > 3){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 3){
            channel.send("Error : Not enough arguments");
            break;
        }

        var channel_str = command[1];
        var channel_id = GetChannelId(channel.guild, channel_str);

        await client.channels.fetch(channel_id).then(function (channel) {
          channel.join();
        });

        var media_to_play = command[2];
        var auto_play = command[3];

        var dispatcher = Command.Broadcast(channel_id, media_to_play);

        dispatcher.on("finish", () => {
          MusicMode.GetListDispatcher().delete(channel_id);
        });

        break;

        case "stop":

        if(n_arg > 2){
            channel.send("Error : Too many arguments");
            break;
        }

        var l_channel_id;
        if(n_arg == 1){

            l_channel_id = [GetUserLoggedVoiceChannel(channel.guild, author)];

            /* Si l'utilisateur n'a pas spécifié de channel et qu'il n'est lui même connecté
               à aucun channel on regarde si il a lancé la commande stop dans un channel text
               linké avec un channel vocal (music mode activé) */

            if(l_channel_id == null){

              l_channel_id = MusicMode.GetLinkedVoiceChannel(channel.id);
            }
        }
        else if(n_arg == 2){

          var channel_str = command[1];
          l_channel_id = [channel_id = GetChannelId(channel.guild, channel_str)];
        }

        Command.Stop(l_channel_id);

        break;

        case "shutdown":
        async () => {
            await channel.send("Shutdown...");
            process.exit(1);
        }
        break;

        case "say":

        if(n_arg > 3){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 3){
            channel.send("Error : Not enough arguments");
            break;
        }

        var channel_str = command[1];
        var channel_id = GetChannelId(channel.guild, channel_str);

        var message = command[2];

        Say(channel_id, message);

        break;

        case "send":

        if(n_arg > 3){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 3){
            channel.send("Error : Not enough arguments");
            break;
        }

        var channel_str = command[1];
        channel_id = GetChannelId(channel.guild, channel_str);

        var message = command[2];

        Command.Send(channel_id, message);

        break;

        case "musicmode":

        var voice_channel_id;
        var text_channel_id;

        if(n_arg > 3){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 2){
            channel.send("Error : Not enough arguments");
            break;
        }

        if(n_arg < 3){
            voice_channel_str = command[1];
            voice_channel_id = GetChannelId(channel.guild, voice_channel_str);

            text_channel_id = channel.id;
        }
        else{
            var voice_channel_str = command[2];
            voice_channel_id = GetChannelId(channel.guild, voice_channel_str);

            var text_channel_str = command[1];
            text_channel_id = GetChannelId(channel.guild, text_channel_str);
        }

        MusicMode.ToogleMusicMode(text_channel_id, voice_channel_id, channel);

        break;

        case "syv":

        if(n_arg > 3){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 2){
            channel.send("Error : Not enough arguments");
            break;
        }

        var query = command[1];
        var auto_play_str = command[2];

        var auto_play;
        if(auto_play_str == "1" || auto_play_str == "true"){
            auto_play = 1;
        }
        else{
            auto_play = 0;
        }

        console.log(auto_play);

        if(!MusicMode.IsMusicMode(channel.id)){
            channel.send("Error: You have not activated the music mode for this channel.");
            return;
        }

        MusicMode.SearchVideo(query, channel, client, auto_play);

        break;

        case "nyv":

        MusicMode.NextVideo(channel, client);

        break;

        case "rsslist":

        if(n_arg > 2){
            channel.send("Error : Too many arguments");
            break;
        }

        var channel_id;

        if(n_arg < 2){
            channel_id = channel.id;
        }
        else if(n_arg == 2){
            var channel_str = command[1];
            channel_id = GetChannelId(channel.guild, channel_str);
        }

        ListRssLinks(channel_id);

        break;

        case "rssadd":

        if(n_arg > 3){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 2){
            channel.send("Error : Not enough arguments");
            break;
        }

        var channel_id;
        var author_username = author.username;
        var url;

        if(n_arg < 3){
            channel_id = channel.id;
            url = command[1];
        }
        else if(n_arg == 3){
            var channel_str = command[1];
            channel_id = GetChannelId(channel.guild, channel_str);

            url = command[2];
        }

        Rss.AddRssLink(url, author_username, channel_id);

        break;

        case "rssremove":

        if(n_arg > 3){
            channel.send("Error : Too many arguments");
            break;
        }
        else if(n_arg < 2){
            channel.send("Error : Not enough arguments");
            break;
        }

        var channel_id;
        var url;

        if(n_arg < 3){
            channel_id = channel.id;
            url = command[1];
        }
        else if(n_arg == 3){
            var channel_str = command[1];
            channel_id = GetChannelId(channel.guild, channel_str);

            url = command[2];
        }

        Rss.RemoveRssLink(url, channel_id);

        break;



        default:
        channel.send("Error: The command you typed does not exist");
    }

};

function ParseCommand(command) {

    var parsed_command = new Array();

    var quote = false;
    var arg = "";

    for(var c of command){

        if(c == " " && quote == false){
            parsed_command.push(arg);
            arg = "";
        }
        else if(c == "\""){
            if(quote == false){
                quote = true;
            }
            else {
                quote = false;
            }
        }
        else{
            arg = arg+c;
        }
    }

    parsed_command.push(arg);

    return parsed_command;
}

module.exports.IsNumber = function(value){
    return typeof value === 'number' && isFinite(value);
}

function Log(text) {

    var date = new Date();

    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    var date_string = "[" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "]";
    var text_to_log = date_string + " " + text;

    Fs.writeFile("../log.txt", text_to_log, (err) => {
        if(err) throw err;
    });
}

module.exports.Broadcast = function (channel_id, media_to_play, music){

    var dispatcher;

    for (const connection of client.voice.connections.values()) {
        if(channel_id == "all" || channel_id == connection.channel.id){

            if(music == 1){
                dispatcher = connection.play(Ytdl(media_to_play, { quality: 'highestaudio' }));
            }
            else{
                dispatcher = connection.play(Ytdl(media_to_play, { quality: 'highestaudio' }));
            }
            MusicMode.GetListDispatcher().set(connection.channel.id, dispatcher);
        }
    }
    return dispatcher;
}

function Say(channel_id, message){

    var params = {
        OutputFormat: "mp3",
        SampleRate: "8000",
        Text: message,
        TextType: "text",
        VoiceId: "Mathieu"
    };

    client.channels.fetch(channel_id).then(function(channel){

        if(channel.type == "text"){
            channel.send(message);
        }
        else if(channel.type == "voice"){
            SynthesizeSpeech.GetSynthesizeSpeech(message, params, SynthesizeSpeech.Speak, {"channel_id" : channel_id, "client" : client});
        }
    });
}

module.exports.Send = function(channel_id, message){

    client.channels.fetch(channel_id).then(function(channel){
        channel.send(message);
    });
}

module.exports.Stop = function(l_voice_channel_id){

  if(l_voice_channel_id == undefined){
    return;
  }

  var l_dispatcher = MusicMode.GetListDispatcher();

  for(let i = 0; i < l_voice_channel_id.length; i++){

    let voice_channel_id = l_voice_channel_id[i];

    if(l_dispatcher.has(voice_channel_id)){
      var dispatcher = l_dispatcher.get(voice_channel_id);
      dispatcher.destroy();

      l_dispatcher.delete(voice_channel_id);
    }
  }
}

function ShowHelp(channel, page_index) {

    var n_command_per_page = 5;
    var n_text_command = commands_def.text_commands.length;

    var h_message = new Discord.MessageEmbed();

    var title;
    if(page_index == 1){
        title = "Descriptif des commandes";
    }
    else{
        title = "Descriptif des commandes (" + page_index + ")";
    }
    h_message.setTitle(title);

    var field_name, field_value;
    for(var i = (page_index-1)*n_command_per_page; i < commands_def.text_commands.length && i < ((page_index-1)*n_command_per_page+n_command_per_page); i++){

        field_name = commands_def.text_commands[i].name;
        field_value = commands_def.text_commands[i].description + "\n" + commands_def.text_commands[i].use;

        h_message.addField(field_name, field_value);
    }

    var n_page = Math.ceil(n_text_command/n_command_per_page);

    if(page_index < n_page){
        h_message.setFooter(("Do !help "+(page_index+1)+" to access the next page"));
    }
    else if(page_index != 1){
        h_message.setFooter(("Do !help "+(page_index-1)+" to access the previous page"));
    }

    channel.send(h_message);


}

function GetChannelId(guild, channel_str){

    if(!isNaN(channel_str)){
        return channel_str;
    }

    var channel_manager = guild.channels;
    var m_channel = channel_manager.cache; //Liste des channels de la guilde
    var l_channel = m_channel.array();

    for(var i = 0; i < l_channel.length; i++){

        if(l_channel[i].name == channel_str){
            return l_channel[i].id;
        }
    }
}

//Seulement au sein de la guilde
function GetUserLoggedVoiceChannel(guild, user){
  let l_guild_channels = guild.channels.cache;

  for(const [channel_id, channel] of l_guild_channels.entries()){

    if(channel.type == "voice"){

      for(const member of channel.members.values()){

        if(member.user.id == user.id){
          let user_channel = channel_id;

          return user_channel;
        }
      }
    }
  }

  return null;
}

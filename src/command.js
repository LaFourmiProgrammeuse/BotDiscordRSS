'use strict';

//Modules
const Discord = require('discord.js');
const Fs = require("fs");
const Stream = require("stream");
const Ytdl = require("ytdl-core");

const SynthesizeSpeech = require("./synthesize_speech.js");
const Index = require("./index.js");
const MusicMode = require("./musicmode.js");

var dispatcher;
var client;

var commands_def;
Fs.readFile("./commands.json", "utf8", (err, data) => {
    if(err) throw err;
    else commands_def = JSON.parse(data);
});




module.exports.TreatCommand = function (command_no_parsed, channel, client_, author) {

    client = client_;

    var n_arg = command_no_parsed.length;
    Log("La commande \"" + command_no_parsed + "\" a été executé par " + author.username);

    var command = ParseCommand(command_no_parsed); //Command parsed

    switch(command[0]) {
        case "help":
            var page_index = parseInt(command[1]); console.log(page_index);

            if(isNaN(page_index)){
                page_index = 1;
            }

            ShowHelp(channel, page_index);
            break;

        case "moveto":
            var channel_id = command[1];

            client.channels.fetch(channel_id).then(function (channel) {
                channel.join();
            });
            break;

        case "broadcast":

            var channel_id = command[1];
            var media_to_play = command[2];

            Broadcast(channel_id, media_to_play);

            break;

        case "shutdown":

            channel.send("Shutdown...");
            process.exit(1);
            break;

        case "say":
            var channel_id = command[1];
            var message = command[2];

            Say(channel_id, message);

            break;

        case "musicmode":

            var voice_channel_id = command[1];
            var text_channel_id = channel.id;

            MusicMode.ToogleMusicMode(text_channel_id, voice_channel_id);

            break;

        case "sy":

            var query = command[1];

            if(!MusicMode.IsMusicMode(channel.id)){
                channel.send("Error: You have not activated the music mode for this channel.");
            }

            MusicMode.Search(query, channel, client);

            break;

        default:
            channel.send("La commande que vous avez tapé n'existe pas");
    }

};

function AutoPlay(client, file_to_play) {

    for (const connection of client.voice.connections.values()) {
        dispatcher = connection.play(file_to_play);

        dispatcher.on("finish", () => {
            AutoPlay(client, file_to_play);
        });
    }
}

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

function Broadcast(channel_id, media_to_play){

    for (const connection of client.voice.connections.values()) {

        if(channel_id == "all" || channel_id == connection.channel.id){
            dispatcher = connection.play(Ytdl(media_to_play, { quality: 'highestaudio' }));

            dispatcher.on("finish", () => {
                AutoPlay(client, media_to_play); //Ne pas oublier de mettre une condition pour lancer l'autoplay à l'avenir
            });
        }
    }
}

function Say(channel_id, message){

    var params = {
        OutputFormat: "mp3",
        SampleRate: "8000",
        Text: message,
        TextType: "text",
        VoiceId: "Mathieu"
    };

    client.channels.fetch(channel_id).then(function (channel) {

        if(channel.type == "text"){
            channel.send(message);
        }
        else if(channel.type == "voice"){
            var text_to_speak = SynthesizeSpeech.GetSynthesizeSpeech(message, params, SynthesizeSpeech.Speak, {"channel_id" : channel_id, "client" : client});
        }
    });
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
        h_message.setFooter(("Do !page "+(page_index+1)+" to access the next page"));
    }
    else if(page_index != 1){
        h_message.setFooter(("Do !page "+(page_index-1)+" to access the previous page"));
    }

    channel.send(h_message);

}

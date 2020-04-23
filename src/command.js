'use strict';

//Modules
const Discord = require('discord.js');
const Fs = require("fs");
const Stream = require("stream");
const Ytdl = require("ytdl-core");

const SynthesizeSpeech = require("./synthesize_speech.js");
const Index = require("./index.js");

var dispatcher;

var commands_def;
Fs.readFile("./commands.json", "utf8", (err, data) => {
    if(err) throw err;
    else commands_def = JSON.parse(data);
});




module.exports.TreatCommand = function (command_no_parsed, channel, client, author) {

    var n_arg = command_no_parsed.length;
    Log("La commande \"" + command_no_parsed + "\" a été executé par " + author.username);

    var command = ParseCommand(command_no_parsed); //Command parsed

    switch(command[0]) {
        case "help":
                ShowHelp(channel);
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

            for (const connection of client.voice.connections.values()) {

                if(channel_id == "all" || channel_id == connection.channel.id){
                    dispatcher = connection.play(Ytdl(media_to_play, { quality: 'highestaudio' }));

                    dispatcher.on("finish", () => {
                        AutoPlay(client, media_to_play); //Ne pas oublier de mettre une condition pour lancer l'autoplay à l'avenir
                    });
                }
            }
            break;

        case "shutdown":

            channel.send("Shutdown...");
            process.exit(1);
            break;

        case "say":
            var channel_id_ = command[1];
            var message = command[2];

            client.channels.fetch(channel_id_).then(function (channel) {

                if(channel.type == "text"){
                    channel.send(message);
                }
                else if(channel.type == "voice"){

                var text_to_speak = SynthesizeSpeech.GetSynthesizeSpeech(message, "", Speak, {"channel_id" : channel_id_, "client" : client});
                }
            });
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

function Speak(data, callback_arg){

    var channel_id = callback_arg["channel_id"];
    var client = callback_arg["client"];

    console.log(data); console.log(data.AudioStream);

    var buffer = data.AudioStream;
    var buffer_uint = new Uint8Array(buffer);

    Fs.writeFile("../text_to_speak.mp3", buffer, (err) => {
        if (err) console.log("Error lors de l'écriture du buffer dans le fichier");
    });

    for (const connection of client.voice.connections.values()) {

        if(connection.channel.id == channel_id) {
            dispatcher = connection.play(Fs.createReadStream('../text_to_speak.mp3'));
        }
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
        if(err) console.log("Erreur lors de l'écriture dans le fichier des logs");
    });
}

function ShowHelp(channel) {

    var h_message = new Discord.MessageEmbed();
    h_message.setTitle("Descriptif des commandes");

    var field_name, field_value;
    for(var c_def of commands_def.text_commands){

        field_name = c_def.name;
        field_value = c_def.description + "\n" + c_def.use;

        h_message.addField(field_name, field_value);
    }

    channel.send(h_message);

}

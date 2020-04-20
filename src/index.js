'use strict';

//Modules
const Discord = require('discord.js');
const Fs = require("fs");
const Vm = require('vm');

const RSS = require("./rss.js");
const Command = require("./command.js");
const SynthesizeSpeech = require("./synthesize_speech.js");

//var a = 0;


// Create an instance of a Discord client
var client = new Discord.Client();
var rss = new RSS();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
    console.log('I am ready!');

    rss.FetchRssLinks();
    client.user.setActivity("un meeting de JLM", {type: "WATCHING"});
});

// Create an event listener for messages
client.on('message', message => {
    if(message.content[0] === "!"){

    var command = message.content.replace("!", "", 1);
    var parsed_command = command.split(" ");

    Command.TreatCommand(parsed_command, message.channel, client);
    }

    //On regarde si le message est le channel qui permet de diffuser dans le channel Général de Team
    else if(message.channel.id == "701115420056354887"){
        client.channels.fetch("697495494011912346").then(function(team_channel){

        team_channel.send(message.content);
    });
    }
});


SynthesizeSpeech.GetSynthesizeSpeech();





// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NjcwMzAzMjUxMjk5ODI3NzI1.XpjDOQ.fqYIH3BfIfoMQrDAotJkF3IKpZw');

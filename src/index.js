'use strict';

//Modules
const Discord = require('discord.js');
const Fs = require("fs");
const Vm = require('vm');

// Create an instance of a Discord client
var client = new Discord.Client();
module.exports.GetDiscordClient = function(){
    return client;
}

const Rss = require("./rss.js");
const Command = require("./command.js");
const Youtube = require("./youtube.js");
const MusicMode = require("./musicmode.js");

client.on('ready', () => {
    console.log('I am ready!');

    //rss.FetchRssLinks();
    client.user.setActivity("un meeting de JLM", {type: "WATCHING"});
});

// Create an event listener for messages
client.on('message', message => {

    //client.user.setStatus("Test");

    if(message.content[0] === "!"){

    let command = message.content.replace("!", "", 1);
    let channel = message.channel;
    let author = message.author;

    Command.TreatCommand(command, channel, client, author);
    }

    //On regarde si le message est le channel qui permet de diffuser dans le channel Général de Team
    else if(message.channel.id == "701115420056354887"){
        client.channels.fetch("697495494011912346").then(function(team_channel){

        team_channel.send(message.content);
    });
    }
});

Rss.FetchRssLinks();
Rss.FetchRssLinks();
Rss.FetchRssLinks();

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NjcwMzAzMjUxMjk5ODI3NzI1.XtpKzA.F2sTw1M7oA8z3HmsuLQhsgLn0_w');

//Token Bot : NjcwMzAzMjUxMjk5ODI3NzI1.Xp24jA.gDm98UXsnQAQimjfdM3V2WoGpKw

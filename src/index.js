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

var discord_token;


async function LoadDiscordToken(){

  return new Promise((resolve, reject) => {

    Fs.readFile("../discord_token.txt", "utf8", (err, data) => {

      if(err){
        console.log("Impossible de charger le token discord");
        reject();
      }
      else{
        discord_token = data.replace(/[\n]/gi, "");
        resolve();
      }
    });
  });
}
async function LoginToDiscord(){
  await LoadDiscordToken();
  console.log(discord_token);
  client.login(discord_token);
}

client.on('ready', () => {
    console.log('I am ready!');


    client.user.setActivity("un meeting de JLM", {type: "WATCHING"});
});

// Create an event listener for messages
client.on('message', message => {

    //client.user.setStatus("Test");

    if(message.content[0] === "!"){

    let command = message.content.replace("!", "", 1);
    let channel = message.channel;
    let author = message.author;

    Command.TreatCommand(command, channel, author);
    }

    //On regarde si le message est le channel qui permet de diffuser dans le channel Général de Team
    else if(message.channel.id == "701115420056354887"){
        client.channels.fetch("697495494011912346").then(function(team_channel){

        team_channel.send(message.content);
    });
    }
});

Rss.FetchRssLinks();

LoginToDiscord();

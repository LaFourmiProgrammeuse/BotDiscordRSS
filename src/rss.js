'use strict';

const Parser = require('rss-parser');
const SQlite = require("sqlite3").verbose();

const Command = require("./command.js");

const db = new SQlite.Database("../rss.sq3");

var l_link_rss_flux = new Array('https://queryfeed.net/tw?q=%40JLMelenchon');
var fetch_interval = 10; //In seconds
var link_flux_index = 0;


module.exports.FetchRssLinks = async function(channel_id){

    var parser = new Parser();

    for(let link of l_link_rss_flux){

        let feed = await parser.parseURL(link);

        feed.items.forEach(item => {
            console.log(item.title + ':' + item.link);
        });
    }
}

module.exports.GetRssLinks = function(){
    return l_link_rss_flux;
}

module.exports.StartRepeatingFetch = function(){
    setInterval(fetch_rss_links, fetch_interval);
}

module.exports.AddRssLink = function(url, owner, channel_id){

    //On vérifie que le lien n'exsite pas déjà dans la bdd pour ce channel
    db.get("SELECT owner FROM feed_links WHERE url=? AND channel_id=?", [url, channel_id], (error, row) => {
        if(error != null){ //An error occured
            console.log(error);
            return;
        }

        if(row != undefined){
            Command.Send(channel_id, ("Error : This url has already been registered by " + row.owner + " for this channel."));
            return;
        }

        db.run("INSERT INTO feed_links (url, owner, channel_id) VALUES (?, ?, ?)", [url, owner, channel_id], (error) => {
            if(error != null){
                console.log(error);
                return;
            }
        });

        Command.Send("The rss link has been successfully added for this channel.")
    });
}

module.exports.RemoveRssLink = function(url, channel_id){

    db.run("DELETE FROM feed_links WHERE url=? AND channel_id=?", [url, channel_id], (error) => {
        if(error != null){
            console.log(error);
            return;
        }
    });

    Command.Send("The rss link has been removed added for this channel.");
}

module.exports.ListRssLinks = function(channel_id){

}

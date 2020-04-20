'use strict';

var Parser = require('rss-parser');

class RSS {
    #l_link_rss = new Array('https://queryfeed.net/tw?q=%40JLMelenchon');
    #fetch_interval = 10; //In seconds


    constructor(){

    }

    async FetchRssLinks(){
        var parser = new Parser();

        for(let link of this.#l_link_rss){

            let feed = await parser.parseURL(link);

            feed.items.forEach(item => {
                console.log(item.title + ':' + item.link);
            });
        }
    }

    GetRssLinks(){
        return this.#l_link_rss;
    }

    StartRepeatingFetch(){
        setInterval(FetchRssLinks, this.#fetch_interval);
    }

}

module.exports = RSS;

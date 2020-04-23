'use strict';

var Parser = require('rss-parser');

class RSS {
    #l_link_rss_flux = new Array('https://queryfeed.net/tw?q=%40JLMelenchon');
    #fetch_interval = 10; //In seconds


    constructor(){

    }

    async FetchRssLinks(){
        var parser = new Parser();

        for(let link of this.#l_link_rss_flux){

            let feed = await parser.parseURL(link);

            feed.items.forEach(item => {
                console.log(item.title + ':' + item.link);
            });
        }
    }

    GetRssLink(){
        return this.#l_link_rss_flux;
    }

    start_repeating_fetch(){
        setInterval(fetch_rss_links, fetch_interval);
    }

}

module.exports = RSS;

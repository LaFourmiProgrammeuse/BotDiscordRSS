const axios = require("axios");
const Qs = require("qs");
const Fs = require("fs");

var youtube_token;
const youtube_api_path = "https://www.googleapis.com/youtube/v3/"

module.exports.Search = async function(params, callback, callback_arg){

    if(youtube_token == undefined){
        await LoadToken();
    }


    var params_serialized = Qs.stringify(params, {arrayFormat: 'brackets'}) + "&key=" + youtube_token;

    url = youtube_api_path + "search?" + params_serialized;
    await axios({
        method: "get",
        url: url
    }).then(function (response) {
        console.log("2");
        callback(response, callback_arg);
    });
}

function LoadToken(){

    return new Promise((resolve, reject) => {

        Fs.readFile("../youtube_token.txt", "utf8", (err, data) => {

            if(err){
                reject(err);
            }
            else{
                youtube_token = data;
                resolve();
            }
        });
    });
}

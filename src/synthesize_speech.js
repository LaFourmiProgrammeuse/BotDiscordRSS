const axios = require("axios");
const Fs = require("fs");

//AWS
process.env.AWS_SDK_LOAD_CONFIG = true;
var Aws = require("aws-sdk");

const Index = require("./index.js");
const Command = require("./command.js");
const MusicMode = require("./musicmode.js");

var polly = new Aws.Polly(/*{region: "us-west-2"}*/);


module.exports.GetSynthesizeSpeech = function (text_to_synthesize, params, callback, callbach_arg){

    let data_to_return;

    polly.synthesizeSpeech(params, function (err, data) {

        if (err) {
            console.log(err, err.stack);
        }
        else{
            console.log(data);
            callback(data, callbach_arg);
        }

    });

}

module.exports.Speak = function (data, callback_arg){

    var channel_id = callback_arg["channel_id"];
    var client = callback_arg["client"];

    console.log(data);

    var buffer = data.AudioStream;
    var buffer_uint = new Uint8Array(buffer);

    Fs.writeFile("../text_to_speak.mp3", buffer, (err) => {
        if (err) throw err;
    });

    for (const connection of client.voice.connections.values()) {

        if(connection.channel.id == channel_id) {

            var dispatcher = connection.play(Fs.createReadStream('../text_to_speak.mp3'));
            MusicMode.GetListDispatcher().set(connection.channel.id, dispatcher);

            dispatcher.on("finish", () => {
              dispatcher.destroy();
              MusicMode.GetListDispatcher().delete(voice_channel_id);
            });
        }
    }
}

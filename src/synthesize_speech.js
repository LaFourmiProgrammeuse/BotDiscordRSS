const axios = require("axios");

//AWS
//process.env.AWS_SDK_LOAD_CONFIG = true;
var Aws = require("aws-sdk");
const Index = require("./index.js");
const Command = require("./command.js");

var polly = new Aws.Polly(/*{region: "us-west-2"}*/);


module.exports.GetSynthesizeSpeech =  function (text_to_synthesize, params, callback, callbach_arg){

    let data_to_return;

    var params = {
        OutputFormat: "mp3",
        SampleRate: "8000",
        Text: text_to_synthesize,
        TextType: "text",
        VoiceId: "Mathieu"
    };

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

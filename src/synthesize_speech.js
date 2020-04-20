const axios = require("axios");

//AWS
process.env.AWS_SDK_LOAD_CONFIG = true;
var Aws = require("aws-sdk");

var polly = new Aws.Polly({region: "us-west-2"});

module.exports.GetSynthesizeSpeech = function (text_to_synthesize, params){

    var params = {
  LexiconNames: [
     "example"
  ],
  OutputFormat: "mp3",
  SampleRate: "8000",
  Text: "All Gaul is divided into three parts",
  TextType: "text",
  VoiceId: "Joanna"
 };

    polly.synthesizeSpeech(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   /*
   data = {
    AudioStream: <Binary String>,
    ContentType: "audio/mpeg",
    RequestCharacters: 37
   }
   */
 });


}

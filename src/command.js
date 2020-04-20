'use strict';

let volume = 1;
let dispatcher;

module.exports.TreatCommand = async function (command, channel, client) {

    let n_arg = command.length;

    switch(command[0]) {
        case "help":
            channel.send("Listes des commandes", {tts: true});
            break;

        case "moveto":
            let channel_id = command[1];

            client.channels.fetch(channel_id).then(function (channel) {
                channel.join();
            });
            break;

        case "broadcast":

            let file_to_play = command[1];

            for (const connection of client.voice.connections.values()) {
                dispatcher = connection.play(file_to_play);

                dispatcher.on("finish", () => {
                    AutoPlay(client, file_to_play); //Ne pas oublier de mettre une condition pour lancer l'autoplay à l'avenir
                });
            }
            break;

        case "shutdown":

            await channel.send("Shutdown...");
            process.exit(1);
            break;

        case "say":
            let channel_id_ = command[1];
            let message = command[2];

            client.channels.fetch(channel_id_).then(function (channel) {
                channel.send(message);
            });
            break;

        default:
            channel.send("La commande que vous avez tapé n'existe pas");
    }

};

function AutoPlay(client, file_to_play) {

    for (const connection of client.voice.connections.values()) {
        dispatcher = connection.play(file_to_play);

        dispatcher.on("finish", () => {
            AutoPlay(client, file_to_play);
        });
    }
}

function HasPermission(){

}

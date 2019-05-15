const Discord = require("discord.js")
const client = new Discord.Client()
const config = require("./config.js")

const fs = require('fs')

if( !fs.existsSync("./recordings") ) fs.mkdirSync("./recordings")
const outputStream = fs.createWriteStream(`./recordings/${Date.now()}.pcm`)
                        
client.on('ready', () => {
    client.channels
        .get(config.channel)
        .join()
        .then(connection => {
            var dispatcher = connection.playFile('./beep.mp3')
            var receiver = connection.createReceiver()
            receiver.on('pcm', (user, buffer) => {
                outputStream.write(buffer)
            })
            
            console.info(`Recording in #${client.channels.get(config.channel).name} ...`)
        })
})

client.login(config.token)

function close (code) {
    client.channels.get(config.channel).leave()
    console.log(`Completed recording`)
    process.exit(0)
}

process.on('SIGINT', close)
process.on('SIGTERM', close)


const fs = require('fs')
const config = require("./config.js")
if( !fs.existsSync(`./${config.folder}`) ) fs.mkdirSync(`./${config.folder}`)

const streams = {}

const Discord = require("discord.js")
const client = new Discord.Client()

client.on('ready', () => {
    console.log("Ready")
})

client.on('message', message => {
    if( !config.master.includes(message.author.id) ) return

    //Usage: record channel-name
    if( message.cleanContent.startsWith('start') ) {
        var [command, ...channel] = message.content.split(/\s+/)
        var voiceChannel = client.channels.find(c => c.name.toLowerCase() === channel.join(" ").toLowerCase().replace("#","") )

        if( voiceChannel ) {
            //Create new stream writer
            streams[voiceChannel.id] = fs.createWriteStream(`./${config.folder}/${voiceChannel.name}-${(new Date()).toLocaleString()}.pcm`)
            //Join channel
            voiceChannel.join().then( connection => {
                //Send sound to initiate connection
                var dispatcher = connection.playFile('./beep.mp3')
                //Create a receiver
                var receiver = connection.createReceiver()
                //Route buffer to out stream
                receiver.on('pcm', (user, buffer) => {
                    streams[voiceChannel.id].write(buffer)
                })
                
                message.reply(`Recording ${voiceChannel} ...`)
            })    
        }    
    }

    //Usage: stop channel-name
    if( message.cleanContent.startsWith('stop') ) {
        var [command, ...channel] = message.content.split(/\s+/)
        var voiceChannel = client.channels.find(c => c.name.toLowerCase() === channel.join(" ").toLowerCase().replace("#","") )

        if( voiceChannel ) {
            //Try leave voice channel
            try { voiceChannel.leave() } catch(e) { console.error(e) }
            //Try close stream
            try { streams[voiceChannel.id].close() } catch(e) { console.error(e) }
            //Delete stream reference
            delete streams[voiceChannel.id]

            message.reply(`Recording on ${voiceChannel} has finished`)
        }    
    }
    
    //Usage: recording
    if( message.cleanContent.startsWith('state') ) {
        var [command, ...channel] = message.content.split(/\s+/)
        message.channel.send(Object.keys(streams).map(s => {
            return [ 
                streams[s].path.split(/\//)[2],
                `Active : ${!streams[s].closed} | Writable : ${streams[s].writable}`,
                `Bytes written : ${streams[s].bytesWritten.toLocaleString()}`
            ].join("\n")
        }).join("\n") || "None")
    }    
})

client.login(config.token)

function close (code) {
    client.channels.get(config.channel).leave()
    console.log(`Completed recording`)
    process.exit(0)
}

process.on('SIGINT', close)
process.on('SIGTERM', close)


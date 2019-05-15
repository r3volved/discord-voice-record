# discord-voice-record

Record a discord voice channel to .pcm


## Required

Opus 1.1

Node8

gcc-4.9

npm install discord.js node-opus


## Usage

### Start recording
`start #channel-name`

### Current recording
`state`

### Stop recording
`stop #channel-name`


## Playback

play -t raw -r 48k -e signed -b 16 -c 2 ./recordings/FILENAME.pcm

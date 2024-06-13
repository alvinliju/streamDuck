import express from "express";
import http from 'http'
import path from 'path'
import {Server as SocketIO} from 'socket.io'
import {spawn} from 'child_process'

const app = express()
const __dirname = path.resolve(); // ensure __dirname is defined
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app)
const io = new SocketIO(server)

const options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/dcfx-m7v2-j248-3185-9207`,
];

const ffmpegProcess = spawn('ffmpeg',options)

ffmpegProcess.stdout.on('data',(data)=>{
    console.log(`ffmpeg stdout:${data}`)
})
ffmpegProcess.on('close',(code)=>{
    console.log(`ffmpeg stdout:${code}`)
})
io.on('connection', (socket) =>{
    console.log('Socket Connected', socket.id)
    socket.on('binarystream',stream=>{
        console.log('binary stream is comming..')
        ffmpegProcess.stdin.write(stream,(error)=>{
            console.log('Err', error)
        })
    })
})


server.listen(3000,()=>console.log("server started"));
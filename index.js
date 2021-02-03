const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const {generate_message , generate_Location_message} = require('./message')
const {getUser,addUser,removeUser,getUserInRoom} = require('./users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const direURL = path.join(__dirname , './public')

app.use(express.static(direURL))

io.on('connection', (socket) => {
    console.log('New socket connection active')
   
    socket.on('join', (options ,callback) => {
         const { error , user } = addUser({id : socket.id , ...options})
         if(error){
             return callback(error)
         }

         socket.join(user.room)
         socket.emit('message', generate_message(user.username , 'Hello Everyone!!'))
         socket.broadcast.to(user.room).emit('message', generate_message(user.username , `Welcome ${user.username}`))
         io.to(user.room).emit('roomData', {
             room : user.room,
             users : getUserInRoom(user.room)
         })
    })

    socket.on('Send', (msg , callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generate_message(user.username , msg))
        callback()
    })
   
    socket.on('disconnect',() => {
        const user = removeUser(socket.id)
        if(user){
           socket.broadcast.to(user.room).emit('message', generate_message(user.username , `${user.username} left the room!!`))
           io.to(user.room).emit('roomData', {
               room : user.room,
               users : getUserInRoom(user.room)
           })
        }
    })
   
    socket.on('send-location', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('Locationsharing', generate_Location_message(user.username , `https://google.com/maps?q=${location.lat},${location.lon}`))
        callback('Location Shared!')
    })
})

server.listen(port, () => console.log('Listening on '+port))
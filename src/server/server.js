
var express = require('express');
var path = require('path');
const {Server} = require('socket.io')

const PORT = process.env.PORT || 3001

const app = express()

let welcomeMessage = 0

app.get("/api",(req,res)=>{
    res.json({message:welcomeMessage})
})


app.use(express.static(path.join(__dirname, '../../build')));


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});


const server = app.listen(PORT, ()=>{
    console.log(`Server listening on ${PORT}`)
})

const ioServer = new Server(server)

let clients = {}

ioServer.on('connection', (client) => {
    console.log(
        `User ${client.id} connected, there are currently ${ioServer.engine.clientsCount} users connected`
    )

    //Add a new client indexed by his id
    clients[client.id] = {
        position: [Math.random()*5, Math.random()*5, Math.random()*5],
        rotation: [Math.random()*5, Math.random()*5, Math.random()*5],
    }

    console.log(client.id)
    console.log('position: ' + clients[client.id].position)

    ioServer.sockets.emit('clicked', clients)

    client.on('clicked right', (id) => {
        console.log('id: '+id)
        //console.log(clients)
        console.log('clients[id]: ' + clients[id])
        console.log(clients[id].position[0])
        let offset = 0.1
        clients[id].position[0]-=offset
        //clients[id].position[1]+=offset
        //clients[id].position[2]+=offset
        
        
        ioServer.sockets.emit('clicked', clients)
    })

    client.on('clicked left', (id) => {
        console.log('id: '+id)
        //console.log(clients)
        console.log('clients[id]: ' + clients[id])
        console.log(clients[id].position[0])
        let offset = 0.1
        clients[id].position[0]+=offset
        //clients[id].position[1]-=offset
        //clients[id].position[2]-=offset
        
        
        ioServer.sockets.emit('clicked', clients)
    })

    client.on('clicked down', (id) => {
        console.log('id: '+id)
        //console.log(clients)
        console.log('clients[id]: ' + clients[id])
        console.log(clients[id].position[0])
        let offset = 0.1
        //clients[id].position[0]+=offset
        clients[id].position[1]-=offset
        //clients[id].position[2]-=offset
        
        
        ioServer.sockets.emit('clicked', clients)
    })

    client.on('clicked up', (id) => {
        console.log('id: '+id)
        //console.log(clients)
        console.log('clients[id]: ' + clients[id])
        console.log(clients[id].position[0])
        let offset = 0.1
        //clients[id].position[0]+=offset
        clients[id].position[1]+=offset
        //clients[id].position[2]-=offset
        
        
        ioServer.sockets.emit('clicked', clients)
    })

  

    client.on('move', ({ id, rotation, position }) => {
        clients[id].position = position
        clients[id].rotation = rotation

        ioServer.sockets.emit('move', clients)
    })

    client.on('disconnect', () => {
        console.log(
            `User ${client.id} disconnected, there are currently ${ioServer.engine.clientsCount} users connected`
        )

        //Delete this client from the object
        delete clients[client.id]

        ioServer.sockets.emit('clicked', clients)
    })

})
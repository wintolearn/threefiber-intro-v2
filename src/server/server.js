
var express = require('express');
var path = require('path');
const {Server} = require('socket.io')

const PORT = process.env.PORT || 3001

const app = express()

let welcomeMessage = 0

let runfromServer = true;

app.get("/api",(req,res)=>{
    res.json({message:welcomeMessage})
})

if(runfromServer){

app.use(express.static(path.join(__dirname, '../../build')));


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});
}



const server = app.listen(PORT, ()=>{
    console.log(`Server listening on ${PORT}`)
})

const ioServer = new Server(server)

let clients = {}

let tempIdArray = []

ioServer.on('connection', (client) => {
    console.log(
        `User ${client.id} connected, there are currently ${ioServer.engine.clientsCount} users connected`
    )
    console.log('clientid is: '+typeof(client.id))
    

    //Add a new client indexed by his id
    clients[client.id] = {
        position: [Math.random()*5, 0, Math.random()*5],
        rotation: [0, 0, 0],
    }

    console.log(client.id)
    console.log('position: ' + clients[client.id].position)

    ioServer.sockets.emit('clicked', clients)

    client.on('clicked', (id,direction) => {
        console.log('clicked')
        console.log(id)
        console.log(direction)
        let offset = 0.1

        if(direction == 'add'){
            //generate random string
            for(let clientId in clients){
                client = clients[clientId]
                console.log(clientId)
                console.log('initialize add - this is a client')
            }

            
            const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            const charactersLength = characters.length;
            length = 20
            for ( let i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            tempIdArray.push(result)
            console.log(tempIdArray)
            let tempID = result
            console.log('tempID: '+tempIdArray[tempIdArray.length-1])
            clients[tempIdArray[tempIdArray.length-1]] = {
                //position: [clients[id].position[0], clients[id].position[1]+5, clients[id].position[2]],
                position: [Math.random()*5, 0, Math.random()*5],
                rotation: [0, 0, 0],
            }

            console.log(clients[client.tempID])

            for(let clientId in clients){
                client = clients[clientId]
                console.log('this is a client')
            }
            ioServer.sockets.emit('clicked', clients)
        }
        else if(direction == 'right'){
            
            console.log('right clicked')
            var x = 0
            var moveInterval = setInterval(()=>{
                clients[id].position[0]-=offset
                ioServer.sockets.emit('clicked', clients)
                x++
                if(x>10){
                    clearInterval(moveInterval)
                }
            },40
            )
            
        }
        else if(direction == 'left'){
            var x = 0
            var moveInterval = setInterval(()=>{
                clients[id].position[0]+=offset
                ioServer.sockets.emit('clicked', clients)
                x++
                if(x>10){
                    clearInterval(moveInterval)
                }
            },40
            )
        }
        else if(direction == 'forward'){
            var x = 0
            var moveInterval = setInterval(()=>{
                clients[id].position[2]+=offset
                ioServer.sockets.emit('clicked', clients)
                x++
                if(x>10){
                    clearInterval(moveInterval)
                }
            },40
            )
        }
        else if(direction == 'back'){
            var x = 0
            var moveInterval = setInterval(()=>{
                clients[id].position[2]-=offset
                ioServer.sockets.emit('clicked', clients)
                x++
                if(x>10){
                    clearInterval(moveInterval)
                }
            },40
            )
        }

        //ioServer.sockets.emit('clicked', clients)
    })

    client.on('disconnect', () => {
        console.log(
            `User ${client.id} disconnected, there are currently ${ioServer.engine.clientsCount} users connected`
        )

        //Delete this client from the object
        //delete clients[client.id]

        //ioServer.sockets.emit('clicked', clients)
    })

})
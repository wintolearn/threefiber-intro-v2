
var express = require('express');
var path = require('path');
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3001

const app = express()

let welcomeMessage = 0

let runfromServer = true;
let checked = false;
let mouseup = false;
let mousedown = false;

app.get("/api", (req, res) => {
    res.json({ message: welcomeMessage })
})

if (runfromServer) {

    app.use(express.static(path.join(__dirname, '../../build')));


    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../build', 'index.html'));
    });
}



const server = app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})

const ioServer = new Server(server)

let clients = {}

let tempIdArray = []

function addBlock(id) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    let offset = 0.1
    const charactersLength = characters.length;
    length = 20
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    tempIdArray.push(result)
    console.log(tempIdArray)
    let tempID = result
    console.log('tempID: ' + tempIdArray[tempIdArray.length - 1])
    clients[tempIdArray[tempIdArray.length - 1]] = {
        //position: [clients[id].position[0], clients[id].position[1]+5, clients[id].position[2]],
        position: [Math.floor(Math.random() * 5), 0, Math.floor(Math.random() * 5)],
        rotation: [0, 0, 0],
        type: "Dynamic"
    }
}

function getRandomId(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    let offset = 0.1
    const charactersLength = characters.length;
    length = 20
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result
}

function addVertBlocks(height,x,y,z) {
    
    for (let i = 0;i<height;i++){
        result = getRandomId()
        tempIdArray.push(result)
        let tempID = result
        clients[tempIdArray[tempIdArray.length - 1]] = {
            position: [x,z+1.01*i,y],
            rotation: [0, 0, 0],
            type: "Static"
        }
    }
}

ioServer.on('connection', (client) => {
    console.log(
        `User ${client.id} connected, there are currently ${ioServer.engine.clientsCount} users connected`
    )
    console.log('clientid is: ' + typeof (client.id))

    console.log('adding a client from server')

    //Add a new client indexed by his id
    clients[client.id] = {
        position: [Math.floor(Math.random() * 5), 0.01, Math.floor(Math.random() * 5)],
        type: "Dynamic",
        scale:[0.5,0.5,0.5]
        //position: [0, 0, 0],

        //rotation: [0, 0, 0],

    }

    console.log(client.id)
    console.log('position: ' + clients[client.id].position)

    ioServer.sockets.emit('clicked', clients)

    client.on('mouseup', (id) => {
        mouseup = true
        mousedown = false
        console.log('mouseup: ' + mouseup)
        console.log('mousedown is false')
        console.log(id)
    })

    client.on('mousedown', (id) => {
        if (checked) {
            mousedown = true
            console.log('mousedown: ' + mousedown)
            console.log(id)
            var oldX = clients[id].position[0]
            var currentX = 0
            var dist = 0
            var distInt = 0
            let offset = 0.1
            //now start an interval and keep checking if mousedown is true
            var graphInterval = setInterval(() => {
                console.log('graphing')
                
                
                //now add this many blocks vertically two blocks from the player
                    var i = 1
                    var moveInterval = setInterval(() => {
                    console.log('moved right')
                    clients[id].position[0] -= offset
                    
                    ioServer.sockets.emit('clicked', clients)
                    i++
                        if (i >= 10) {
                            console.log('deleting move interval')
                            clearInterval(moveInterval)
                        
                        }
                    },100)
                //ioServer.sockets.emit('clicked', clients)
                if (mousedown == false) {
                    console.log('clearning graphInterval')
                    clearInterval(graphInterval)
                }
                currentX = clients[id].position[0]
                dist = Math.abs(currentX - oldX)
                distInt = Math.round(dist)
                let x = currentX
                let z = clients[id].position[1]
                let y = clients[id].position[2]+4
                addVertBlocks(distInt,x,y,z)
                ioServer.sockets.emit('clicked', clients)
                
            }, 1000)//build every second
        }


    })

    client.on('clicked', (id, direction) => {
        console.log('clicked')
        console.log(id)
        console.log(direction)
        let offset = 0.1

        if (direction == 'add') {
            //generate random string

            addBlock(id)

            for (let clientId in clients) {
                client = clients[clientId]
                console.log(clientId)
                console.log('initialize add - this is a client')
            }

            console.log(clients[client.tempID])

            for (let clientId in clients) {
                client = clients[clientId]
                console.log('this is a client')
            }
            ioServer.sockets.emit('clicked', clients)
        }

        else if (direction == 'right') {

            console.log('right clicked')
            if(!checked){
            var x = 1
                var moveInterval = setInterval(() => {
                    console.log('moved right')
                    clients[id].position[0] -= offset
                    ioServer.sockets.emit('clicked', clients)
                    if (x >= 10) {
                        clearInterval(moveInterval)
                    }
                    x++
                    //if turbo checked use 20 instead of 40
                }, 40
                )
            }

        }
        else if (direction == 'left') {
            var x = 1
            var moveInterval = setInterval(() => {
                clients[id].position[0] += offset
                ioServer.sockets.emit('clicked', clients)
                if (x >= 10) {
                    clearInterval(moveInterval)
                }
                x++
            }, 40
            )
        }
        else if (direction == 'forward') {
            var x = 1
            var moveInterval = setInterval(() => {
                clients[id].position[2] += offset
                ioServer.sockets.emit('clicked', clients)

                if (x >= 10) {
                    clearInterval(moveInterval)
                }
                x++
            }, 40
            )
        }
        else if (direction == 'back') {
            var x = 1
            var moveInterval = setInterval(() => {
                clients[id].position[2] -= offset
                ioServer.sockets.emit('clicked', clients)

                if (x >= 10) {
                    clearInterval(moveInterval)
                }
                x++
            }, 40
            )
        }
        else if (direction == 'checked') {
            checked = !checked
            console.log(checked)

        }

        //ioServer.sockets.emit('clicked', clients)
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
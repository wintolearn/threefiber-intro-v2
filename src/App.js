import React, { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {OrbitControls, MapControls, Stars, Stats, Text, Html} from "@react-three/drei"
import { MeshNormalMaterial, BoxBufferGeometry } from 'three'
import { io } from 'socket.io-client'

import {Physics, useBox, useCylinder, usePlane} from "@react-three/cannon"
//about 120 lines of code

import './App.css'


function Box(props) {
    //const [ref,api] = useBox(()=>({mass: 1, position:[0,3,0]}))
    const [ref,api] = useBox(()=>({ mass:1,args: [3.4, 1, 3.5]}))
    //useBox(() => ({ type: "Kinematic", args: [3.4, 1, 3.5]
    return (
      <mesh onClick={()=>{
        api.velocity.set(0,10,0)
      }} ref={ref} >
        <boxGeometry attach="geometry" args={[1, 1, 1]}/>
        <meshPhysicalMaterial attach="material" color="hotpink"/>
      </mesh>
    )
  }

  function Plane(props) {
    const [ref] = usePlane(()=>({rotation: [-Math.PI/2,0,0], position:[0,-3,0]}))
    return (
      <mesh rotation ={[-Math.PI,0,0]} position={[0,-3,0]}>
        <boxBufferGeometry attach="geometry" args={[10,0.1,10]}/>
        <meshLambertMaterial attach="material" color="white"/>
      </mesh>
    )
  }


//functional component
const ControlsWrapper = ({ socket }) => {//takes socket as a prop
    //react components automatically re-render whenever there is a change to their state or props
    const controlsRef = useRef()//refs can be used to trigger things like focus on a textbox
    //refs give access to the rendered instance of the element in the dom
    const [updateCallback, setUpdateCallback] = useState(null)
    //a way to manage state in function components
    //updateCallback is the variable for the current state 
    //setUpdateCallback is the function which updates the state
    //null is used for the initial value

    // Register the update event and clean up
    useEffect(() => {//gets called in lifecycle methods: mount, unmount, didUpdate
    //Data fetching, setting up a subscription, and manually changing the 
    //DOM in React components are all examples of side effects.
    //gets called after a change in state
        const onControlsChange = (val) => {
            const { position, rotation } = val.target.object
            //this destructures val.target.object into two variables
            const { id } = socket
            //this destructures the socket object and it looks like
            //the unique id is the first piece of data stored in that object

            const posArray = []
            const rotArray = []
            //make two empty arrays

            position.toArray(posArray)
            rotation.toArray(rotArray)
            //this converts position and rotation to arrays
            //assuming they were objects previously
            
            //send a message to the server that the client has moved
            //eitther the rotation or position has changed
            socket.emit('move', {
                id,
                rotation: rotArray,
                position: posArray,
            })
        }

        if (controlsRef.current) {//check if an instance of this element exists / has been rendered
            //if so, call setupdatecallback
            setUpdateCallback(
                controlsRef.current.addEventListener('change', onControlsChange)
                //this callback is 
            )
        }

        // Dispose
        return () => {
            if (updateCallback && controlsRef.current)
                controlsRef.current.removeEventListener(
                    'change',
                    onControlsChange
                )
        }
    }, [controlsRef, socket])

    return <MapControls ref={controlsRef} />
}

const ButtonWrapper = ({ socket }) => {//takes socket as a prop
  //react components automatically re-render whenever there is a change to their state or props
  const buttonRef = useRef()//refs can be used to trigger things like focus on a textbox
  //refs give access to the rendered instance of the element in the dom
  const [updateCallback, setUpdateCallback] = useState(null)

  // Register the update event and clean up
  useEffect(() => {//gets called in lifecycle methods: mount, unmount, didUpdate
  //Data fetching, setting up a subscription, and manually changing the 
  //DOM in React components are all examples of side effects.
  //gets called after a change in state
      const onButtonChange = (e) => {

          const { id } = socket

          socket.emit('clicked', {
              id
          })
      }

      if (buttonRef.current) {//check if an instance of this element exists / has been rendered
          //if so, call setupdatecallback
          setUpdateCallback(
              buttonRef.current.addEventListener('onclick', onButtonChange)
              //this callback is 
          )
      }

      // Dispose
      return () => {
          if (updateCallback && buttonRef.current)
          buttonRef.current.removeEventListener(
                  'onclick',
                  onButtonChange
              )
      }
  }, [buttonRef, socket])

  const { id } = socket

  const clickFunction = (id) =>{
    socket.emit('clicked', {
      id
  })
  

  }//end of button wrapper

  return  <Html ref={buttonRef}
    as='div' // Wrapping element (default: 'div')
  >

    <button onClick={clickFunction(id)}

    >move</button>

  </Html> 
}

const MoveButton = ({socketClient,id, direction, top, right}) =>{
    return(
        <Html as='div'>
        <button  style={{
            width:80,
            height:30,
            color:'red',
            position: 'absolute',
            top:top,
            right: right
        }} onClick={()=>{
          socketClient.emit('clicked', id, direction
        )}}
        >{direction}</button>
        </Html> 
    )
}

const UserWrapper = ({ position, rotation, id }) => {
    //const [ref,api] = useBox(()=>({ mass:1,args: [1, 1, 1]}))
    return (
       
        <mesh //ref={ref}
          
            position={position}
            rotation={rotation}
            geometry={new BoxBufferGeometry()}
            material={new MeshNormalMaterial()}
        >
            {/* Optionally show the ID above the user's mesh */}
            <Text
                position={[0, 1.0, 0]}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {id}
            </Text>
            {/*
            <boxGeometry attach="geometry" args={[1, 1, 1]}/>
            <meshPhysicalMaterial attach="material" color="blue"/>
            */}
        </mesh>
      
    )
}

function App() {
    const [socketClient, setSocketClient] = useState(null)
    const [clients, setClients] = useState({})
    const [first, setFirst] = useState('');
    
    const handleSubmit = event => {
        // 👇️ prevent page refresh
        event.preventDefault();
    
        console.log('form submitted ✅');
        alert('form submitted')
      };

    if(socketClient){
    var { id } = socketClient
    }

    useEffect(() => {
        // On mount initialize the socket connection
        setSocketClient(io())
        console.log('setsocketclient called')

        // Dispose gracefuly
        return () => {//since we are using an empty array this return function
            //only gets called on dismount
            if (socketClient) socketClient.disconnect()
            console.log('socket client disconnectd')
        }
    }, [])//empty array means this runs only on the first render

    //triggered whenever there is a change in state
    //including new message received on socketclient
    useEffect(() => {
        if (socketClient) {//if the socket client exists
            //then respond to a move message from the server
            //update all the clients with new information
            socketClient.on('clicked', (clients) => {
              console.log('clicked message received in app')
              console.log('clients: ' + {clients})
                setClients(clients)//when a move message is received
                //from the server, it receives all the clients
                //the next line updates the app state to: clients
            })
        }
    }, [socketClient])//only call this function when the socketClient updates

    //controls changed in comtrol wrapper->emit move message->new move message received
    //->fire the effect above to update clients object
    //->render everything below using the updated clients object
    return (
        socketClient && (//removing socketClient here has no effect
            <Canvas camera={{ position: [0, 1, -5], near: 0.1, far: 1000 }}>
              
                <MapControls/>
                <Html 
                as='div' // Wrapping element (default: 'div')
                >

                <form onSubmit={handleSubmit}
                    style={{
                        color:'red',
                        position: 'absolute',
                        top:-160,
                        right:140}}
                    >
                    <label>
                        Enter your answer:                  
                    </label>
                    <input
                        type="text"
                        answer="first"
                        value={first}
                        onChange={event => setFirst(event.target.value)}
                    />
                    <button type="submit">Submit</button>
                    </form>
                </Html>

                <MoveButton
                    socketClient = {socketClient}
                    id={id}
                    direction={'add'}
                    top={+100}
                    right={-30+300}
                />

                <MoveButton
                    socketClient = {socketClient}
                    id={id}
                    direction={'forward'}
                    top={-50}
                    right={-35+300}
                />

                <MoveButton
                    socketClient = {socketClient}
                    id={id}
                    direction={'back'}
                    top={50}
                    right={-30+300}
                />

                <MoveButton
                    socketClient = {socketClient}
                    id={id}
                    direction={'left'}
                    top={0}
                    right={10+300}
                />

                <MoveButton
                    socketClient = {socketClient}
                    id={id}
                    direction={'right'}
                    top={0}
                    right={-80+300}
                />

                {/*below render the ControlsWrapper component and pass it socketClient as a prop */}
               
                <gridHelper rotation={[0, 0, 0]} />
                <Stars/>
                    <ambientLight intensity = {0.5}/>
                    <spotLight position={[100,15,10]} angle={0.3}/>
 
                <Physics>
                
                {/* Filter myself from the client list and create user boxes with IDs */}
                {console.log('app rendering')}
                {Object.keys(clients)//return an array whose elements are strings corresponding to the 
                //properties found in clients
                //position: [0, 0, 0],
                //rotation: [0, 0, 0],
                    //.filter((clientKey) => clientKey !== socketClient.id)
                    //filter creates a new array with elements that pass a test
                    //the id is the index or key in the key value pair
                    //the value is an object with position and rotation arrays
                    .map((client) => {//iterate over an array and modify its 
                        //elements using a callback function
                        console.log(clients[client])
                        const { position, rotation } = clients[client]
                        return (
                            <UserWrapper
                           
                                key={client}//using keys improves effciency
                                //react doesn't have to iterate over all child elements
                                //when one of them changes -- it knows by the key which one changed
                                id={client}//not sure why this is not
                                //client.id
                                //position={[position[0]+0.1,position[1]+0.1,position[2]+0.1]}
                                position={position}
                                rotation={rotation}
                            />
                        )
                    })}
                    
                
                        <Box/>
                        <Plane/>
                </Physics>

            </Canvas>
        )
    )
}

export default App

import React, { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {OrbitControls, MapControls, Stars, Stats, Text, Html} from "@react-three/drei"
import { MeshNormalMaterial, BoxBufferGeometry } from 'three'
import { io } from 'socket.io-client'
import { MoveButton } from './components/moveButton'
import {CustomCamera} from './components/customCamera'

import {Physics, useBox, useCylinder, usePlane} from "@react-three/cannon"
//about 120 lines of code

import './App.css'

function Box(props) {
    //const [ref,api] = useBox(()=>({mass: 1, position:[0,3,0]}))
    const [ref,api] = useBox(()=>({ mass:1,args: [3.4, 1, 3.5],...props}))
    //useBox(() => ({ type: "Kinematic", args: [3.4, 1, 3.5]
    return (
      <mesh onClick={()=>{
        //api.velocity.set(0,4,0)
      }} ref={ref} >
        <boxGeometry attach="geometry" args={[1, 1, 1]}/>
        <meshPhysicalMaterial attach="material" color="hotpink"/>
      </mesh>
    )
  }

  function Plane(props) {
    const [ref] = usePlane(()=>({rotation: [-Math.PI/2,0,0], position:[0,-0.6,0]}))
    return (
      <mesh rotation ={[-Math.PI,0,0]} position={[0,-0.6,0]}>
        <boxBufferGeometry attach="geometry" args={[10,0.1,10]}/>
        <meshLambertMaterial attach="material" color="white"/>
      </mesh>
    )
  }


const UserWrapper = ({ position, rotation, id, setId, setBlockId }) => {
    //const [ref,api] = useBox(()=>({ mass:1,args: [1, 1, 1],position:position,type: "Static"}))
    
    const [ref,api] = useBox(()=>({ mass:500,args: [0.8, 0.8, 0.8],position:position}))
    
    
    useEffect(()=>{
        let x,y,z
        [x,y,z]=position
        console.log(x)
        console.log(y)
        console.log(z)
        api.position.set(x,y,z)
    })
    
    

    return (
       
        <mesh ref={ref}
            onClick={()=>{
                setBlockId(id)
                setId(id)
                console.log('mesh id: '+id)
                if(position[1]<0.2){
                    api.velocity.set(-1.2,9,0)
                }
                
                //alert(id)
            }} 

            scale={[1,1,1]}
            
            position={position}
            rotation={rotation}
            
            //geometry={new BoxBufferGeometry()}
            //material={new MeshNormalMaterial()}
        >
            <boxGeometry attach="geometry" args={[0.8, 0.8, 0.8]}/>
            <meshPhongMaterial color="#ff0000" opacity={0.6} transparent />
        {/*<meshPhysicalMaterial attach="material" color="hotpink"/>*/}
            {/*<boxGeometry />
            <meshPhongMaterial color="#ff0000" opacity={0.5} transparent />*/}
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
    const [id, setId] = useState(null)
    const [blockId, setBlockId] = useState(null)

    let initialized = false;
    
    useEffect(()=>{
        if(socketClient && !blockId){
            var {id} = socketClient
            console.log('9. id is set to socketClient from effect')
            console.log(id)
            setId(id)
            
        }

    })


    const handleSubmit = event => {
        // 👇️ prevent page refresh
        event.preventDefault();
    
        console.log('form submitted ✅');
        //alert('form submitted')
      };

      const handleCheck = event => {
        // 👇️ prevent page refresh
        //event.preventDefault();

        socketClient.emit('clicked', id, 'checked')
    
        console.log('check submitted ✅');
        //alert('form submitted')
      };

    

    useEffect(() => {
        // On mount initialize the socket connection
        if(!initialized){
            setSocketClient(io())
            console.log('setsocketclient(io) called'+socketClient)
            initialized = true
        }
 

        // Dispose gracefuly
        return () => {//since we are using an empty array this return function
            //only gets called on dismount
            if (socketClient) {
                socketClient.disconnect()
                console.log('3. socket client disconnectd')
            }
            
        }
    }, [])//empty array means this runs only on the first render

    //triggered whenever there is a change in state
    //including new message received on socketclient
    useEffect(() => {
        if (socketClient) {//if the socket client exists
            //then respond to a move message from the server
            //update all the clients with new information
            var {tempid} = socketClient
            console.log('tempid: '+tempid)
            setId(tempid)
            console.log('9. id is set to socketClient')
            console.log(id)
            console.log('10. id: ' + id)

            socketClient.on('clicked', (clients) => {
              console.log('4. clicked message received in app')
              console.log('5. clients: ' + JSON.stringify(clients))
              console.log('6. socket client: '+socketClient)
              //console.log('clients: ' + {clients})
                setClients(clients)//when a move message is received
                //from the server, it receives all the clients
                //the next line updates the app state to: clients
                
   
            })

        }
    }, [socketClient])//only call this function when the socketClient updates

    //controls changed in comtrol wrapper->emit move message->new move message received
    //->fire the effect above to update clients object
    //->render everything below using the updated clients object
    /*<Canvas camera={{ position: [-1, 8, -5], near: 0.1, far: 1000 }}>*/
    return (
         (//removing socketClient here has no effect
            
         <Canvas camera={{ position: [-1, 8, -5], near: 0.1, far: 1000 }}>
                {/*<CustomCamera fov={33} rotation={[0.8,Math.PI*1.0,0]} position={[0.5, 10.4, -12]} near= {0.2} far= {1000}/>*/}

              
                {/*<MapControls/>*/}
                <Html 
                as='div' // Wrapping element (default: 'div')
                >

                <form onSubmit={handleSubmit}
                    style={{
                        color:'red',
                        position: 'absolute',
                        top:-130,
                        right:245
                    
                    }}
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
                    <button type="submit"
                    style={{
                        color:'red',
                    }}
                    
                    >Submit</button>
                    </form>
                </Html>

                <Html 
                as='div' // Wrapping element (default: 'div')
                >

                <form onClick={handleCheck}
                    style={{
                        color:'red',
                        position: 'absolute',
                        top:50,
                        right:190
                    }}
                    >
                    <label>
                        Start Graphing:                  
                    </label>
                    <input
                        type="checkbox"
                        
                        onChange={event => handleCheck}
                    />
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


                <Text
                        position={[0,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        0
                    </Text>
                    <Text
                        position={[1,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -1
                    </Text>
                    <Text
                        position={[-1,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        1
                    </Text>
                    <Text
                        position={[-2,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        2
                    </Text>
                    <Text
                        position={[-3,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        3
                    </Text>
                    <Text
                        position={[-4,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        4
                    </Text>
                    <Text
                        position={[-5,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        5
                    </Text>
                    <Text
                        position={[2,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -2
                    </Text>
                    <Text
                        position={[3,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -3
                    </Text>
                    <Text
                        position={[4,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -4
                    </Text>
                    <Text
                        position={[5,0,0]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -5
                    </Text>
                    <Text
                        position={[0,0,1]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        1
                    </Text>
                    <Text
                        position={[0,0,2]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        2
                    </Text>
                    <Text
                        position={[0,0,3]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        3
                    </Text>
                    <Text
                        position={[0,0,4]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        4
                    </Text>
                    <Text
                        position={[0,0,5]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        5
                    </Text>
                    <Text
                        position={[0,0,-1]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -1
                    </Text>
                    <Text
                        position={[0,0,-2]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -2
                    </Text>
                    <Text
                        position={[0,0,-3]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -3
                    </Text>
                    <Text
                        position={[0,0,-4]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -4
                    </Text>
                    <Text
                        position={[0,0,-5]}
                        scale={[8, 8, 8]}
                        rotation = {[Math.PI/2,Math.PI,0]}
                        color="red" // default
                        anchorX="center" // default
                        anchorY="middle" // default
                    >
                        -5
                    </Text>

                {/*below render the ControlsWrapper component and pass it socketClient as a prop */}
               {/*for some reason grid is a weird scale
                <gridHelper args={[20,20]} rotation={[0, 0, 0]} scale={[0.97,1,0.97]} position={[0,0,-0.4]} />
                */}
                 <gridHelper/>
               
                <Stars/>
                    <ambientLight intensity = {0.5}/>
                    <spotLight position={[100,15,10]} angle={0.3}/>
                
                <Physics
                //gravity={[0, -100, 0]} 
                  //   defaultContactMaterial={
                    //   {
                         //friction: 0.5, 
                         //restitution: 1, 
                         //contactEquationStiffness: 6000,
                         //contactEquationRelaxation: 0.000001
                        //}}
                        >
                
                {/* Filter myself from the client list and create user boxes with IDs */}
                {console.log('3. app rendering')}
                {console.log('7. stringify: ' + JSON.stringify(clients))}
                {console.log('8. id: '+id)}
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
                        //console.log(clients[client])
                        
                        const { position, rotation } = clients[client]
                        return (
                            <UserWrapper
                           
                                key={client}//using keys improves effciency
                                //react doesn't have to iterate over all child elements
                                //when one of them changes -- it knows by the key which one changed
                                id={client}//not sure why this is not
                                setBlockId={setBlockId}
                                setId={setId}
                                //client.id
                                //position={[position[0]+0.1,position[1]+0.1,position[2]+0.1]}
                                
                                position={position}
                                rotation={rotation}
                            />
                        )
                    })}
                    
                
                       
                        <Plane/>
                
                </Physics>

            </Canvas>
        )
    )
}

export default App

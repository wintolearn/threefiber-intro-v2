
import {OrbitControls, MapControls, Stars, Stats, Text, Html} from "@react-three/drei"

export const MoveButton = ({socketClient,id, direction, top, right}) =>{
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
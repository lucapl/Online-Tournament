import React, {useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';

export default function Tournament({serverUrl}){
    const [tour,setTour] = useState({});
    const { id } = useParams();

    useEffect(()=>{
        fetch(`${serverUrl}tournaments`,{
            Body: {
                "id": [ id ]
            }
        }).then((response)=>response.json())
        .then((data)=>{
            setTour(data[0]);
        });
    },[])

    return(<div>
        <h1>Tournament name: {tour.name}</h1>
        <h2>Organizer: {tour.organizer}</h2>
    </div>)
}
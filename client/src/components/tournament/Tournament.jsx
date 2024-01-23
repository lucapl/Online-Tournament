import React, {useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import "../../styles.css";
import LocationPickerMap from '../LocationPicker';
import UserProfile from '../../closures/UserProfile';

export default function Tournament({serverUrl}){
    const [tour,setTour] = useState({});
    const [isOwner, setIsOwner] = useState(false);
    const { id } = useParams();

    const navigate = useNavigate();
    // fetch(`${serverUrl}tournaments`,{   
    //     Body: {
    //         "id": [ id ]
    //     }
    // }).then((response)=>response.json())
    // .then((data)=>{
    //     setTour(data[0]);
    //     //setLocation(tour.location);
    // });
    useEffect(()=>{
        var status = 0;
        fetch(`${serverUrl}tournament/${id}`,{   
        }).then((response)=>{
            status = response.status
            return response.json()})
        .then((data)=>{
            if (status >=400){
                return navigate(`/response/${status}/${data.message}`);
            }
            setTour(data);
        });
        
    },[])
    
    useEffect(()=>{
        const {login} = UserProfile.get();
        if (tour && tour.organizer === login){
            setIsOwner(true);
        }
    },[tour])

    const joinTournament = ()=>{
        navigate(`/tournament/join/${id}`);
    }

    return(<div>
        {isOwner && <button onClick={()=>{
            navigate(`/tournament/edit/${tour._id}`);
        }}>Edit</button>}
        <h1>Tournament name: {tour.name}</h1>
        <h2>Organizer: {tour.organizer}</h2>
        <div>
            <div>Location:</div>
            <LocationPickerMap clickable={false} defaultLocation={tour.location}/>
        </div>
        <button onClick={joinTournament}>Join Tournament</button>
        <div>Our sponsors:</div>
        <div class="row">
            {tour.sponsorLogos && tour.sponsorLogos.map(sL => <img height="128px" width="auto" src={sL} alt="sponsor-logo"/>)}
        </div>
        
    </div>)
}
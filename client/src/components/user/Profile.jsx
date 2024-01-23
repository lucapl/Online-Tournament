import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import serverConfig from "../../serverConfig.json";
import "../../styles.css";

import TournCard from "../tournament/TournCard";

export default function Profile(){
    const [profile,setProfile] = useState({});
    const [tournaments,setTournaments] = useState({
        "participates":[],
        "organizes":[]
    });
    const {email} = useParams();

    const navigate = useNavigate();

    useEffect(()=>{
        var status = 0;
        fetch(serverConfig.serverUrl+"user/"+email)
            .then((response) => {
                status = response.status
                return response.json()})
            .then((data) => {
                if(status>=400){
                    return navigate(`/response/${status}/${data.message}`);
                }
                setProfile(data);
            });
        
    },[email]);

    useEffect(()=>{
        var status = 0;
        fetch(serverConfig.serverUrl+"user/"+email+"/tournaments")
            .then((response) => {
                status = response.status
                return response.json()})
            .then((data) => {
                if(status>=400){
                    return navigate(`/response/${status}/${data.message}`);
                }
                setTournaments(data);
            });
    },[profile])

    return(<div class="column fill tournaments">
        <h1>Profile:</h1>
        <h2>{profile.firstName}</h2>
        <h2>{profile.lastName}</h2>
        <h3>Email: {profile.email}</h3>
        <div class="row fill">
            <div class="column col-right">
                <div>Organizes:</div>
                {tournaments.organizes.map(t => <TournCard tournamentObject={t} key={t.id}  />)}
            </div>
            <div class="column col-left">
                <div>Participates in:</div>
                {tournaments.participates.map(t => <TournCard tournamentObject={t} key={t.id}  />)}
            </div>
        </div>
    </div>
    )
}
import React, {useState,useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {useForm,Controller} from "react-hook-form";

import "../../styles.css";
import "./tournament.css";
import LocationPickerMap from '../LocationPicker';
import UserProfile from '../../closures/UserProfile';
import TableInput from './TableInput';

function inverseTransformGames(games) {
    const scores = {};

    for (const game of games) {
        const opponent = game.opponent;//.replace(/\./g, '_');
        const player = game.player;//.replace(/\./g, '_');
        
            if(!scores[player]){
                scores[player] = {};
            }
        scores[player][opponent] = game.score;
    }
    return scores;
}

function updateScores(tournament,scores){
    
    if(!tournament.participants){
        return tournament;
    }


    for (let i = 0; i < tournament.participants.length;i++){
        const p1 = tournament.participants[i];
        if (!scores[p1.email]){
            continue;
        }
        for (const p2 of tournament.participants){
            if(!(scores[p1.email][p2.email] !== undefined && scores[p2.email] && scores[p2.email][p1.email] !== undefined)){
                continue;
            }
            tournament.participants[i].score += scores[p1.email][p2.email];
        }
    }
    return tournament;
}


export default function Tournament({serverUrl}){
    const [tour,setTour] = useState({});
    const [scores, setScores] = useState({});

    const [isOwner, setIsOwner] = useState(false);
    const [expired, setExpired] = useState(false);
    const [started, setStarted] = useState(false);
    const { id } = useParams();
    
    const {login,sessionToken} = UserProfile.get();

    const date = new Date();

    const { 
        control,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();


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
        fetch(`${serverUrl}tournament/${id}/ladder`,{   
        }).then((response)=>{
            status = response.status
            return response.json()})
        .then((data)=>{
            if (status >=400){
                return navigate(`/response/${status}/${data.message}`);
            }
            setTour(data);
            setExpired(new Date(data.applicationDeadline)< new Date());
            setStarted(new Date(data.time) < new Date());

            fetch(`${serverUrl}tournament/${id}/games`,{   
            }).then((response)=>{
                status = response.status
                return response.json()})
            .then((data)=>{
                if (status >=400){
                    return navigate(`/response/${status}/${data.message}`);
                }
                if(data){
                    setScores(inverseTransformGames(data));
                }
            });
        });

    },[])

    useEffect(()=>{
        const newTour = tour;
        setTour(updateScores(newTour,scores));
    },[scores])
    
    useEffect(()=>{
        const {login} = UserProfile.get();
        if (tour && tour.organizer === login){
            setIsOwner(true);
        }
    },[tour])

    const joinTournament = ()=>{
        const {login} = UserProfile.get()

        if(login){
            return navigate(`/tournament/join/${id}`);
        }
        navigate("/login");
    }

    const onSubmit = (data) => {
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': sessionToken,
            },
            body: JSON.stringify(data)
        };
        var status = null;
        fetch(serverUrl+`tournament/${id}/scores`,requestOptions)
            .then((response) => {
                status = response.status
                return response.json()})
            .then((data) => {
                return navigate(`/response/${status}/${data.message}`)
        });
    }

    return(<div class="column max-height">
        {isOwner && <button onClick={()=>{
            navigate(`/tournament/edit/${tour._id}`);
        }}>Edit</button>}
        <h1>Tournament name: {tour.name}</h1>
        <h2>Organizer: <Link to={`/user/${tour.organizer}`}>{tour.organizer}</Link></h2>
        <div>Happening: {tour.time}</div>
        <div>
            <div>Location:</div>
            <LocationPickerMap clickable={false} defaultLocation={tour.location}/>
        </div>
        <div>Application deadline: {tour.applicationDeadline}</div>
        <div class="row fill"><div>Participants {tour.participants && tour.participants.length}/{tour.maxParticipants}</div> {!expired && <button onClick={joinTournament}>Join Tournament</button>}</div>
        {started && <div class="pad-2">Round robin cross table:
        <table class="pad-2">
            <thead>
                <tr>
                    <th>Participant</th>
                    <th>Score</th>
                    <th>ELO</th>
                    {tour.participants.map(p=><th>{p.email.slice(0,4)}</th>)}
                </tr>
            </thead>
            <tbody>
            {/* {tour.participants.map(p1=><tr>
                <td class="tour"><Link to={`/user/${p1.email}`}>{p1.email}</Link></td><td class="tour">{p1.score}</td><td class="tour">{p1.ranking}</td>
                {tour.participants.map(p2=>
                    (p1.email === p2.email && <td class="tour own">*</td> ) ||
                    (p1.email !== login && <td class={`uneditable tour`}>0</td>) ||
                    (p1.email === login && <TableInput></TableInput>)
                )}
                </tr>)} */}
                {tour.participants.map((p1) => (
                <tr key={p1.email}>
                <td className="tour">
                    <Link to={`/user/${p1.email}`}>{p1.email}</Link>
                </td>
                <td className="tour">{p1.score}</td>
                <td className="tour">{p1.ranking}</td>

                {/* Render cells based on conditions */}
                {tour.participants.map((p2) => (
                <React.Fragment key={`${p1.email}-${p2.email}`}>
                    {p1.email === p2.email ? (
                    <td className="tour own">*</td>
                    ) : p1.email !== login ? (
                    <td className="uneditable tour">{scores[p1.email] && scores[p1.email][p2.email]}</td>
                    ) : scores[p1.email] && scores[p1.email][p2.email] !== undefined ? (
                        <td className="tour">{scores[p1.email] && scores[p1.email][p2.email]}</td>
                    ) : (
                    <td className="tour">
                        {/* Include the input field for editable cells */}
                        <Controller
                        name={`scores.${p2.email.replace(/\./g, '_')}`}
                        control={control}
                        render={({ field }) => (
                            <input
                            min="0"
                            max="1"
                            step="0,5"
                            type="number"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            {...field}
                            />
                        )}
                        />
                    </td>
                    )}
                </React.Fragment>
                ))}
                </tr>
            ))}
            </tbody>
            <button type="submit" onClick={handleSubmit(onSubmit)}>
                Submit
            </button>
        </table></div>}
        <div>Our sponsors:</div>
        <div class="row">
            {tour.sponsorLogos && tour.sponsorLogos.map(sL => <img height="128px" width="auto" src={sL} alt="sponsor-logo"/>)}
        </div>
        
    </div>)
}
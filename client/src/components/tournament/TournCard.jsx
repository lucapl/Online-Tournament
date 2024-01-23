import React from "react";
import "../../styles.css";
import { Link } from 'react-router-dom';

export default function TournCard({tournamentObject}) {
    return(
        <div class="column border-low padding">
            <Link to={`/tournament/${tournamentObject._id}`}><h1>{tournamentObject.name}</h1></Link>
            <h2>{tournamentObject.organizer}</h2>
            <div>Participants: {tournamentObject.participants.length}/{tournamentObject.maxParticipants}</div>
            <div>Happening: {tournamentObject.time}</div>
        </div>
    )
}
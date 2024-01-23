import React,{ useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';

export default function RegisterConfirm({serverUrl}){
    const [confirm, setConfirm] = useState("");
    const { token } = useParams();

    useEffect(()=>{
        fetch(`${serverUrl}confirm/${token}`)
            .then((response) => response.text())
            .then((text)=>{
                console.log(text);
                setConfirm(text);
            });
    },[confirm])

    return(<div>
        <h1>{confirm}</h1>
    </div>)
}
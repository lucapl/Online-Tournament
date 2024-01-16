import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles.css'

export default function Response(){
    const { status, message } = useParams();

    return (
        <div class="column">
            <h1>{status}</h1>
            <div>{message}</div>
        </div>
    );
};
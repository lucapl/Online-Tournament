import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';

import UserProfile from '../../closures/UserProfile';
import serverConfig from '../../serverConfig.json';

import './JoinTournament.css';

export default function JoinTournament(){
    const { handleSubmit,formState: { errors },register } = useForm();
    const { id } = useParams();

    const navigate = useNavigate();
    const serverUrl = serverConfig.serverUrl;

    const onSubmit = (data) => {
        return joinTournament(data);
    };

    const joinTournament = (data)=>{
        const {login,sessionToken} = UserProfile.get();
        data.email = login;
        console.log(data);
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': sessionToken
            },
            body: JSON.stringify({
                'participant':data,
                'id':id
            })
        };
        var status = null;
        fetch(serverUrl+"tournament/join",requestOptions)
            .then((response) => {
            status = response.status
            return response.json()})
            .then((data) => {
            return navigate(`/response/${status}/${data.message}`)
            });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <tr>
                <td>License Number</td>
                <td>    
                    <input class={errors.licenseNumber && "error"} type="text" {...register("licenseNumber",{required:true})}/>
                    {errors.licenseNumber && <div class="error">This field is required</div>}
                </td>
            </tr>  
    
            <tr>
                <td>Ranking</td>
                <td>
                    <input class={errors.ranking && "error"} type="number" {...register("ranking",{required:true})}/>
                    {errors.ranking && <div class="error">This field is required</div>}
                </td>
            </tr>
    
            <div>
                <button type="submit">Submit</button>
            </div>
      </form>
    );
  };
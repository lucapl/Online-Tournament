import React, { useEffect, useState } from "react";
import {useForm, Controller} from "react-hook-form";
import {useParams,useNavigate} from "react-router-dom";

import LocationPickerMap from "../LocationPicker";
import UserProfile from "../../closures/UserProfile";
import serverConfig from "../../serverConfig.json";

const mode = "Create";

export default function TourCreator(){
    const serverUrl = serverConfig.serverUrl;
    const [tournamentObject,setTour] = useState(undefined);
    const { id } = useParams();

    const navigate = useNavigate();

    const { 
        register, 
        handleSubmit,
        watch,
        formState: { errors },
        control,
        setValue
    } = useForm();

    const onSubmit = function(data){
        const {login, sessionToken} = UserProfile.get();
        data.organizer = login;
        if (id){
            data.id = id;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 
                'Authorization': sessionToken,
                'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        var status = 0;
        fetch(`${serverUrl}tournaments/create`,requestOptions)
            .then((response)=>{
                status = response.status
                return response.json()})
            .then((data)=>{
                return navigate(`/response/${status}/${data.message}`);
            })
        return ()=>{};
    }

    useEffect(()=>{
        const {login, sessionToken} = UserProfile.get();
        if(!id){
            return ()=>{};
        }
        var status = 0;
        fetch(`${serverUrl}tournament/${id}`,{   
        }).then((response)=>{
            status = response.status
            return response.json()})
        .then((data)=>{
            if (status >=400){
                return navigate(`/response/${status}/${data.message}`);
            }
            if (login !== data.organizer){
                return navigate(`/response/Error/You can't edit this tournament`);
            }
            setTour(data);
        });
    },[])

    useEffect(()=>{
        if(!tournamentObject){
            return ()=>{};
        }
        setValue("name",tournamentObject.name);
        setValue("time",new Date(tournamentObject.time));
        setValue("applicationDeadline", new Date(tournamentObject.applicationDeadline));
        setValue("location",tournamentObject.location);
        setValue("maxParticipants",tournamentObject.maxParticipants);
        setValue("sponsorLogos",tournamentObject.sponsorLogos)
    },[tournamentObject])

    //const {_id,organizer,name,discipline,time,applicationDeadline,location,maxParticipants,sponsorLogos} = tournamentObject;
    return(
        <div class = "column">
            <form onSubmit={handleSubmit(onSubmit)}>
                <table>
                    <tbody>
                        <tr>
                            <td>Name:</td>
                            <td>
                                <input class={errors.name && "error"} {...register("name",{required:true})}/>
                                {errors.name && <div class="error">This field is required</div>}
                            </td>
                        </tr>
                        {/* <tr>
                            <td>Discipline:</td>
                            <td><input type class={errors.email && "error"} {...register("discipline",{
                                required:true,
                                maxLength:254,
                                // email regex courtesy of https://emailregex.com/
                                pattern:/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/})}/>
                                {errors.email && <div class="error">This is not a valid email address</div>}    
                            </td>
                        </tr> */}
                        <tr>
                            <td>Time:</td>
                            <td><input type="date" class={errors.time && "error"} {...register("time",{
                                required:true,
                                valueAsDate: true,
                                validate: (val) =>{
                                    const date = new Date(val);
                                    return date >= new Date() && watch("applicationDeadline") <= date;
                                }
                            })}/>
                            {errors.time && <div class="error">This field is invalid</div>}
                            </td>
                        </tr>
                        <tr>
                            <td>Application deadline:</td>
                            <td><input type="date" class={errors.applicationDeadline && "error"} {...register("applicationDeadline",{
                                required:true,
                                valueAsDate: true,
                                validate: (val) =>{
                                    const date = new Date(val);
                                    return date >= new Date() && date <= watch("time");
                                }
                            })}/>
                            {errors.applicationDeadline && <div class="error">This field is invalid</div>}
                            </td>
                        </tr>
                        <tr>
                            <td>Max Participants:</td>
                            <td><input type="number" step="1" min="2" class={errors.maxParticipants && "error"} {...register("maxParticipants",{
                                required:true,
                                min:2
                            })}/>
                            </td>
                            {errors.maxParticipants && <div class="error">This field is invalid</div>}
                        </tr>
                        <tr>
                            <td>Location:</td>
                            <td>
                            <Controller
                                name="location"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                <LocationPickerMap clickable={true} onLocationSelect={onChange} selectedLocation={value} defaultLocation={[0,0]}/>
                                )}
                            />
                            </td>
                            {/* <td>Location:</td>
                            <tr>
                            <td>Longitude:</td>
                            <td><input type="number" step="0.00001" min="-180" max="180" class={errors.lon && "error"} {...register("lon",{
                                required:true,
                                min:-180,
                                max:180
                            })}/>
                            {errors.lon && <div class="error">This field is invalid</div>}
                            </td>
                            <td>Latitude:</td>
                            <td><input type="number" step="0.00001" min="-90" max="90" class={errors.lon && "error"} {...register("lat",{
                                required:true,
                                min:-90,
                                max:90
                            })}/>
                            {errors.lat && <div class="error">This field is invalid</div>}
                            </td>
                            </tr> */}
                        </tr>
                        <tr>
                            <td>Sponsor logos:</td>
                            <Controller
                                name="sponsorLogos"
                                control={control}
                                defaultValue={[]}
                                render={({ field }) => (
                                    <div>
                                        {field.value.map((item, index) => (
                                        <div key={index}>
                                            <input
                                            {...field}
                                            value={item}
                                            onChange={(e) => {
                                                const newArray = [...field.value];
                                                newArray[index] = e.target.value;
                                                setValue('sponsorLogos', newArray);
                                            }}
                                            />
                                            <button
                                            type="button"
                                            onClick={() => {
                                                const newArray = [...field.value];
                                                newArray.splice(index, 1);
                                                setValue('sponsorLogos', newArray);
                                            }}
                                            >-</button>
                                        </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setValue('sponsorLogos', [...field.value, ''])}
                                        >+</button>
                                    </div>
                                )}
                            />
                        </tr>
                    </tbody>
                </table>
                <input type="submit" value={mode}/>
            </form>
    </div>)
}
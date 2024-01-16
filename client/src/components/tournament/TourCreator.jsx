import React from "react";
import {useForm} from "react-hook-form";

export default function TourCreator({tournamentObject,userLogin}){
    const { 
        register, 
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();

    const onSubmit = function(data){
        console.log(data);
        return null;
    }
    const mode = "Create"

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
                    </tbody>
                </table>
                <input type="submit" value={mode}/>
            </form>
    </div>)
}
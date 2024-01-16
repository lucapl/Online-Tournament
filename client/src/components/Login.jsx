import React, { useState } from "react";
import {useForm} from "react-hook-form";
import { Link } from 'react-router-dom';
import '../styles.css';
import './Login.css';


export default function Login({onSubmit, registerMode}){
    const { 
        register, 
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();
    //const onSubmit = (data) => console.log(JSON.stringify(data));

    console.log(watch("fname"));
    const mode = registerMode ? "Register" : "Login";

    return(
        <div class = "column">
            <form onSubmit={handleSubmit(onSubmit)}>
                <table>
                    <tbody>
                        {registerMode && <>
                        <tr>
                            <td>Name:</td>
                            <td>
                                <input class={errors.fname && "error"} {...register("fname",{required:true})}/>
                                {errors.fname && <div class="error">This field is required</div>}
                            </td>
                            
                        </tr>
                        <tr>
                            <td>Last name:</td>
                            <td>
                                <input class={errors.lname && "error"} {...register("lname",{required:true})} />
                                {errors.lname && <div class="error">This field is required</div>}
                            </td>
                        </tr>
                        </>}
                        <tr>
                            <td>Email:</td>
                            <td><input class={errors.email && "error"} {...register("email",{
                                required:true,
                                maxLength:254,
                                // email regex courtesy of https://emailregex.com/
                                pattern:/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/})}/>
                                {errors.email && <div class="error">This is not a valid email address</div>}    
                            </td>
                        </tr>
                        <tr>
                            <td>Password:</td>
                            <td><input class={errors.password && "error"} type="password"{...register("password",{required:true,minLength:8,maxLength:100})}/>
                            {errors.password && <div class="error">This field is required</div>}
                            </td>
                        </tr>
                        
                        {registerMode && 
                        <tr>
                            <td>Confirm Password:</td>
                            <td><input class={errors.password_confirm && "error"} type="password"{...register("password_confirm",{
                                validate: (val) => {
                                    if (watch('password') != val) {
                                        return "Your passwords do no match";
                                    }
                                }})}/>
                                {errors.password_confirm && <div class="error">Does not match the password</div>}
                            </td>
                        </tr>}
                    </tbody>
                </table>
                <input type="submit" value={mode}/>
            </form>
            {registerMode && <Link to="/login">I already have an account</Link>}
            {!registerMode && <Link to="/register">I don't have an account</Link>}
            {!registerMode && <Link to="/login/forgot">Forgot my password</Link>}
        </div>
    );
}


/* <tr>
<td>Last name:</td>
<td><input type="text" id="lname"/></td>
</tr>
<tr>
<td>Email:</td>
<td><input type="text" id="email"/></td>
</tr>
<tr>
<td>Password:</td>
<td><input type="text" id="password"/></td>
</tr>
<tr>
<td>Confirm Password:</td>
<td><input type="text" id="pass-confirm"/></td>
</tr> */

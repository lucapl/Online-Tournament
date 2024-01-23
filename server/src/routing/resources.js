const express = require('express');
const resourceRouter = express.Router();
const { request } = require('http');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const fs = require('fs');

const { User } = require("../db/schemas/User");
const { Tournament } = require("../db/schemas/Tournament");
const { default: mongoose } = require('mongoose');

resourceRouter.use(express.json());

const secrets = JSON.parse(fs.readFileSync("./secrets.json"));

resourceRouter.get('/tournaments', async (req, res)=>{
    const date = new Date().toString();
    try{
        var id = req.body.id;
        const t = Tournament.find({ time: { $gte: date} }).sort({time: 1});
        if (id){
            id = id.filter((i) => mongoose.isValidObjectId(i));
            t.find({_id: {$in: id}});
        }

        res.send(await t.exec());
    }catch(error){
        console.error('Get tournaments error:', error);
        res.status(500).send('Internal server error');
    }
})

resourceRouter.get('/tournament/:id', async(req,res)=>{
    const { id } = req.params;
    try{
        if (!mongoose.isValidObjectId(id)){
            return res.status(400).send({"message": "Invalid id"});
        }
        const t = Tournament.findById(id);
        if (!t){
            return res.status(409).send({"message": "Tournament not found"});
        }

        res.send(await t.exec());
    }catch(error){
        console.error('Get tournament error:', error);
        res.status(500).send({"message":'Internal server error'});
    }
})

resourceRouter.get('/users', async (req, res)=>{
    try{
        var id = req.body.id;
        const t = Tournament.find({ time: { $gte: date} }).sort({time: 1});
        if (id){
            id = id.filter((i) => mongoose.isValidObjectId(i));
            t.find({_id: {$in: id}});
        }

        res.send(await t.select({firstName,lastName,email}).exec());
    }catch(error){
        console.error('Get tournament error:', error);
        res.status(500).send('Internal server error');
    }
})

resourceRouter.get('/user/:email', async(req,res)=>{
    const { email } = req.params;
    try{
        const existingUser = await User.findOne({ email });
        if (!existingUser){
            return res.status(409).send({"message": "User not found"});
        }
        res.send({
            "email":existingUser.email,
            "firstName":existingUser.firstName,
            "lastName":existingUser.lastName,
        });
    }catch(error){
        console.error('Get tournament error:', error);
        res.status(500).send({"message":'Internal server error'});
    }
})

resourceRouter.get('/user/:email/tournaments', async (req,res)=>{
    const { email } = req.params;
    const date = new Date().toString();
    try{
        const u = User.findOne({email:email});
        if (!u){
            return res.status(409).send({"message": "User not found"});
        }

        const participatesIn = await Tournament.find({
            time: { $gte: date},
            "participants.email": {$eq: email }
        }).sort({time: 1});
        const organizes = await Tournament.find({
            time: { $gte: date},
            organizer: email
        }).sort({time: 1});

        res.send({
            "participates":participatesIn,
            "organizes":organizes
        });
    }catch(error){
        console.error('Get tournament error:', error);
        res.status(500).send({"message":'Internal server error'});
    }
})

resourceRouter.post('/tournaments/create', async (req,res)=>{
    
    try{
        const {id, name, time, applicationDeadline, location, maxParticipants, sponsorLogos} = req.body;

        const header = req.headers;

        const {authorization} = header;

        const decoded = jwt.decode(authorization, secrets.jwt_key);
        if (!decoded){
            return res.status(409).send({message:"Invalid credentials"});
        }

        if(id){
            await Tournament.findOneAndUpdate({_id:id},{name,time,applicationDeadline,location,maxParticipants,sponsorLogos});
            return res.status(200).send({message:"Tournament edited"});
        }

        const tournament = new Tournament({
            name,
            organizer: decoded.email,
            time,
            applicationDeadline,
            location,
            maxParticipants,
            sponsorLogos
        });

        await tournament.save();

        return res.status(200).send({message:"Tournament created"});

    }catch(error){
        console.log(error);
        return res.status(500).send({message:'Internal server error'});
    }
})

resourceRouter.post('/tournament/join',async (req,res)=>{
    try{
        const {participant,id} = req.body;

        const header = req.headers;

        const {authorization} = header;

        const decoded = jwt.decode(authorization, secrets.jwt_key);
        if (!decoded){
            return res.status(409).send({message:"Invalid credentials"});
        }
        const email = decoded.email;
        if (email !== participant.email){
            return res.status(403).send({message:"Forbidden"});
        }

        const result = await Tournament.findOneAndUpdate(
            {
                _id:id,
                $expr: {
                    $and: [
                        { $lt: [{ $size: '$participants' }, '$maxParticipants'] }
                    ]
                },
                "participants.email": {$not: { $eq: email } }
            },
            { $addToSet : { participants: participant } },
            );

        if (!result){
            return res.status(400).send({message: "Could not join the tournament"});
        }
        return res.status(200).send({message: "Joined successfully"});
    }catch(error){
        console.log("Tournament join error"+error);
        return res.status(500).send({message:"Internal server error"})
    }
})

module.exports = resourceRouter;
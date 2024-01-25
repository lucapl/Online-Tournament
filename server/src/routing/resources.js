const express = require('express');
const resourceRouter = express.Router();
const { request } = require('http');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const fs = require('fs');

const { User } = require("../db/schemas/User");
const { Games } = require("../db/schemas/Games");
const { Tournament } = require("../db/schemas/Tournament");
const { default: mongoose } = require('mongoose');

var sem = require('semaphore')(1);

resourceRouter.use(express.json());

const secrets = JSON.parse(fs.readFileSync("./secrets.json"));

resourceRouter.get('/tournaments', async (req, res)=>{
    const date = new Date();
    try{
        var id = req.body.id;
        const t = Tournament.find({ 
            $expr:{
                $or:[
                    { $gte: ['$time',date]}
                ]
            }
        }).sort({time: 1});
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
    const date = new Date();
    try{
        const u = User.findOne({email:email});
        if (!u){
            return res.status(409).send({"message": "User not found"});
        }

        const participatesIn = await Tournament.find({
            // time: { $gte: date},
            "participants.email": {$eq: email }
        }).sort({time: 1});
        const organizes = await Tournament.find({
            // time: { $gte: date},
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
    const date = new Date();
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
                $expr:{
                    $and:[
                        {$lt: [{ $size: '$participants' }, '$maxParticipants']}
                    ]
                },
                "participants.email": {$not: { $eq: email } },
                applicationDeadline: {$gte: date},
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

// function createRound(round,n){
//     let opponentArray = Array(n).fill(-1);
//     for (let i = 0; i < n; i++){
//         let offset = round + 1;
//         opponentArray[i] = i + offset;
//         if (opponentArray[i] >= n){
//             opponentArray[i] -= n;
//         }
//     }
//     return opponentArray;
// }

resourceRouter.get("/tournament/:id/ladder",async(req,res)=>{
    const { id } = req.params;
    try{
        const t = await Tournament.findById(id);
        if (!t){
            return res.status(400).send({message:"Tournament not found"});
        }
        t.participants.sort((a,b)=>{
            if(a.score>b.score){
                return -1;
            }else if (a.score<b.score){
                return 1;
            }
            if(a.ranking>b.ranking){
                return -1;
            }
            return 1;
        })
        
        res.send(t);
    }catch(error){
        console.log("Tournament ladder error");
        return res.status(500).send({message:"Internal server error"});
    }
})

resourceRouter.get("/test",async(req,res)=>{
    res.status(200).send({bread: createRound(3,4)});
})

function transformGames(scores,email){
    
    let games = []
    for (const key in scores) {
        if (scores.hasOwnProperty(key)) {
            const opponent = key;
            const score = scores[key];
    
            // Create an object with the transformed data
            const transformedItem = {
            player: email.replace(/_/g, '.'),
            opponent: opponent.replace(/_/g, '.'),
            score: score, // Convert to integer if it's a valid number
            };
            
            if (!isNaN(transformedItem.score)){
                // Add the transformed item to the array
                games.push(transformedItem);
            }
        }
    }

    return games
}

async function dealWithConflicts(id,gamesToAdd){
    // Check for conflicts and handle accordingly
    const updatedGames = [];
    const game = await Games.findOne({
        tournament: id
        // $or: [
        //     { $and: [{ "games.player": newGame.player }, { "games.opponent": newGame.opponent }] },
        //     { $and: [{ "games.player": flippedGame.player }, { "games.opponent": flippedGame.opponent }] }
        // ]
    }).lean().exec();
    const games = game.games;
    console.log("found game: "+game);
    for (let i =0; i < gamesToAdd.length;i++) {
        const newGame = gamesToAdd.at(i);
        console.log("Game to add: "+newGame);
        // Create a flipped version of the game
        const flippedGame = {
            player: newGame.opponent,
            opponent: newGame.player,
            score: 1-newGame.score,
        };

        console.log("Games:"+games+" Type: "+typeof games);
        const conflictingGames = games.filter((g)=>{
            return (g.player === flippedGame.player && g.opponent === flippedGame.opponent && g.score !==flippedGame.score);
        });
        console.log("Conflicting games: "+conflictingGames);
        if (conflictingGames && conflictingGames.length > 0) {
            for (const conflict of conflictingGames){
                console.log("Conflict detected: "+conflict);
                await Games.updateOne(
                    { tournament: id },
                    { $pull: { games: conflict } }
                ).exec();
            }
            continue;
        }
        updatedGames.push(newGame);
    }
    console.log("updatedGames"+updatedGames);
    return updatedGames;
}

resourceRouter.post("/tournament/:id/scores",async(req,res)=>{
    sem.take(async()=>{
        try{
            const {id} = req.params;
            const mid = new mongoose.Types.ObjectId(id);
            const {scores} = req.body;
    
            const header = req.headers;
    
            const {authorization} = header;
    
            const decoded = jwt.decode(authorization, secrets.jwt_key);
            if (!decoded){
                return res.status(409).send({message:"Invalid credentials"});
            }
            const email = decoded.email;
    
            const t = await Tournament.findOne({
                _id:mid,
                "participants.email": { $eq: email }
            });
            if (!t){
                return res.status(400).send({message:"Tournament not found"});
            }
    
            const transGames = transformGames(scores, email);
    
            const game = await Games.findOne({
                tournament:mid
            }).exec();
    
            if (!game){
                await new Games({
                    tournament:mid,
                    games:transGames
                }).save()
                return res.status(200).send({message: "Score added"});
            }
    
            console.log(transGames);
            const updatedGames = await dealWithConflicts(mid,transGames);
    
    
            await Games.updateOne(
                { tournament: mid },
                { $push: {games: { $each: updatedGames } }}
            );
    
            res.status(200).send({message: "Score added"});
        }catch(error){
            console.log("Adding scores error "+error);
            res.status(500).send({message: "Internal server error"});
        }finally{
            sem.leave(1);
        }
    })
})

resourceRouter.get("/tournament/:id/games",async(req,res)=>{
    sem.take(async()=>{
        try{
            const {id} = req.params;
            const mid = new mongoose.Types.ObjectId(id);
            const g = await Games.findOne({
                tournament:mid
            }).exec();

            if(!g){
                return res.status(200).send([]);
            }

            return res.status(200).send(g.games);
        }catch(error){
            console.log("Getting score error "+error)
            return res.status(500).send({message: "Internal server error"});
        }finally{
            sem.leave(1);
        }
    });
})

module.exports = resourceRouter;
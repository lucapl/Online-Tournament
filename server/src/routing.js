const express = require('express');
const router = express.Router();
const { request } = require('http');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const fs = require('fs');

const { User } = require("./db/schemas/User");
const { Tournament } = require("./db/schemas/Tournament");
const { default: mongoose } = require('mongoose');

router.use(express.json());

const secrets = JSON.parse(fs.readFileSync("./secrets.json"));
// fs.readFile("./secrets.json", "utf8", (error, data) => {
//     if (error) {
//         console.log(error);
//         return;
//     }
//     console.log(data);
//     secrets = JSON.parse(data);
// });

const transporter = nodemailer.createTransport(secrets.transporter);

const clientUrl = "http://localhost:3000/"

router.post('/register', async (req, res) => {
    const { fname, lname, email, password, password_confirm } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const confirmationToken = jwt.sign({ email }, secrets.jwt_key, { expiresIn: '24h' });

    const user = new User({
        firstName: fname,
        lastName: lname,
        email,
        password: hashedPassword,
        confirmationToken,
    });

    try{

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        await user.save();

        const fullUrl = req.protocol + '://' + req.get('host')
        const confirmationLink = `${clientUrl}confirm/${confirmationToken}`;
        const mailOptions = {
            from: secrets.outmail,
            to: email,
            subject: 'Confirm your registration',
            text: `Click the following link to confirm your registration: ${confirmationLink}`,
        };

        console.log(`Confirmation link generated ${confirmationLink}`);
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error sending confirmation email:', error);
        //         res.status(500).json({ message: 'Error sending confirmation email' });
        //     } else {
        //         console.log('Confirmation email sent:', info.response);
        //         res.json({ message: 'User registered. Check your email for confirmation.' });
        //     }
        // });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
});

router.post('/login/forgot', async (req, res) => {
    const { email } = req.body;

    const confirmationToken = jwt.sign({ email }, secrets.jwt_key, { expiresIn: '24h' });

    try{

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(409).json({ message: 'No user with that email' });
        }

        const fullUrl = req.protocol + '://' + req.get('host')
        const confirmationLink = `${clientUrl}login/restart/${confirmationToken}`;
        const mailOptions = {
            from: secrets.outmail,
            to: email,
            subject: 'Confirm password reset',
            text: `Click the following link to reset your password: ${confirmationLink}`,
        };

        console.log(`Confirmation link generated ${confirmationLink}`);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password restart email:', error);
                return res.status(500).json({ message: 'Error sending password restart email' });
            } else {
                console.log('Password restart mail sent:', info.response);
                return res.json({ message: 'Password restart email sent.' });
            }
        });
    } catch (error) {
        console.error('Password forgot error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
});

router.post('/login/restart', async (req, res) => {
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try{

        const header = req.headers;

        const {authorization} = header;

        const decoded = jwt.decode(authorization, secrets.jwt_key);

        if (!decoded){
            return res.status(409).send("Invalid credentials");
        }

        const email = decoded.email;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(409).json({ message: 'No user with that email' });
        }

        await User.updateOne({ email }, { password: hashedPassword });
        console.log(`New password set ${email}`);

    } catch (error) {
        console.error('Password restart error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    //const user = User.findById({email:email});

    //const hashedPassword = await bcrypt.hash(password, 10);

    const errormsg = 'Invalid email or password';
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: errormsg });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: errormsg });
        }

        const token = jwt.sign({ email }, secrets.jwt_key, { expiresIn: '1h' });

        res.redirect(`/login/success?email=${email}&token=${token}`);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/login/success', (req, res) => {
    const { email, token } = req.query;

    res.json({ email, token });
});

router.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

    console.log(`Confirmation request received: ${token}`);

    try {
        const decoded = jwt.verify(token, secrets.jwt_key);
        const email = decoded.email;

        await User.updateOne({ email }, { confirmed: true });

        res.send('Your account is now confirmed. You can now log in.');
    } catch (error) {
        console.error('Error confirming account:', error);
        res.status(400).send('Invalid or expired confirmation link.');
    }
});

router.get('/tournaments', async (req, res)=>{
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

router.get('/tournament/:id', async(req,res)=>{
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

router.get('/users', async (req, res)=>{
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

router.get('/validate', async (req,res)=>{
    const token = req.body.token;
    const email = req.body.email;
    try{
        const decoded = jwt.verify(token, secrets.jwt_key);
    }catch(error){
        console.error('Login validation error',error);
        res.status(500).send('Internal server error');
    }
})

router.post('/tournaments/create', async (req,res)=>{
    
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

router.post('/tournament/join',async (req,res)=>{
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

module.exports = router ;
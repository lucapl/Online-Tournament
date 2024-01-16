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
        const confirmationLink = `${fullUrl}/confirm/${confirmationToken}`;
        const mailOptions = {
            from: secrets.outmail,
            to: email,
            subject: 'Confirm your registration',
            text: `Click the following link to confirm your registration: ${confirmationLink}`,
        };

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


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = User.findById({email:email});

    const hashedPassword = await bcrypt.hash(password, 10);

    const errormsg = 'Invalid email or password';
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: errormsg });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: errormsg });
        }

        const token = jwt.sign({ email }, secrets.jwt_key, { expiresIn: '1h' });

        res.redirect(`/login/success?email=${email}&token=${token}`);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/login/success', (req, res) => {
    const { email, token } = req.query;

    res.json({ email, token });
});

router.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

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
        console.error('Get tournament error:', error);
        res.status(500).send('Internal server error');
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


module.exports = router ;
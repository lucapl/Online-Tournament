const express = require('express');
const router = express.Router();
const { request } = require('http');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const fs = require('fs');

const { User } = require("./db/schemas/User");

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
    await user.save();

    const fullUrl = req.protocol + '://' + req.get('host')
    const confirmationLink = `${fullUrl}/confirm/${confirmationToken}`;
    console.log(confirmationLink);
    const mailOptions = {
        from: secrets.outmail,
        to: email,
        subject: 'Confirm your registration',
        text: `Click the following link to confirm your registration: ${confirmationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending confirmation email:', error);
            res.status(500).json({ error: 'Error sending confirmation email' });
        } else {
            console.log('Confirmation email sent:', info.response);
            res.json({ message: 'User registered. Check your email for confirmation.' });
        }
    });
});

router.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, secrets.jwt_key);
        const email = decoded.email;

        await User.updateOne({ email }, { confirmed: true });

        res.send('Your account is now confirmed. You can log in.');
    } catch (error) {
        console.error('Error confirming account:', error);
        res.status(400).send('Invalid or expired confirmation link.');
    }
});

module.exports = router ;
//registerNotificationToken.js

const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();
const firebaseServer = require('../firebase/firebase_service');


const jsonParser = bodyparser.json();
const httpParser = bodyparser.urlencoded({extended: false});

router.post('/registerPushToken', jsonParser, async(req,res) => {
    const userId = String(req.body.userId);
    const token = String(req.body.token);
    await firebaseServer.saveToken(userId, token);
    res.status(200).send('success');
});

module.exports = router;




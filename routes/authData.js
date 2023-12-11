//---AuthData.js---//

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
//Chave principal para assinar os tokens JWT.
const jwt_mainKey = require('../config').jwt_key;
const user = require('../models/user');

router.get('/userData', async (req, res) => {
    const authToken = req.headers.authorization?.split(' ')[1];
    if(!authToken)
    {
        return res.status(401).json({error: "Não autorizado"});
    }

    try{
        const decodedToken = jwt.verify(authToken, jwt_mainKey);
        const userId = decodedToken.user.id;
        const userData = await user.findById(userId);
        res.json({success: true, user: userData});
    }
    catch (err)
    {
        res.status(401).json({error: "AuthToken Inválido"});
    }
});

module.exports = router;
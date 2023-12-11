//updateUserConsumption.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');


//Chave principal para assinar os tokens JWT.
const jwt_mainKey = require('../config').jwt_key;

router.post('/updateConsumption', async (req, res) => {
    try {
        //Recebimento dos dados da requisição no aplicativo
        const token = req.header('Authorization').replace('Bearer ', '');
        const { newConsumption } = req.body;

        console.log(newConsumption);

        if (!token || !newConsumption) {
            return res.status(400).json({ message: 'Houve um erro no envio das informações, não esqueça de preencher o consumo' });
        }

        console.log("MAIN KEY: ", jwt_mainKey);
        console.log(token);
        const decodedToken = jwt.verify(token, jwt_mainKey);
        console.log("TOKEN DECODIFICADO: ", decodedToken);

        const user = await User.findById(decodedToken.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        //Atualização do consumo padrão
        user.standard_consumption = newConsumption;

        await user.save();

        return res.status(200).json({ success: true, message: "Consumo atualizado com sucesso" });
    }
    catch (err) {
        console.error("Erro: ", err);
        return res.status(500).json({ message: "Houve um erro no servidor" });
    }
});

router.post('/getConsumption', async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(400).json({ message: 'Token não fornecido.' });
        }

        const decodedToken = jwt.verify(token, jwt_mainKey);

        const user = await User.findById(decodedToken.user.id);

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }

        if (user.standard_consumption.consumption && user.standard_consumption.type && user.standard_consumption.period) {
            const StandardConsumptionData = {
                consumption: user.standard_consumption.consumption,
                type: user.standard_consumption.type,
                period: user.standard_consumption.period
            }
            console.log("Consumo a ser enviado: ", StandardConsumptionData)
            return res.status(200).json({success: true, standard_consumption: StandardConsumptionData });
        }
        else{
            console.log("Não há consumo padrão definido ainda");
            return res.status(200).json({success: true, standard_consumption: null})
        }
    }
    catch (err) {
        console.error("Erro ao obter dados de consumo: ", err);
        return res.status(500).json({ message: "Houve um problema no servidor" });
    }
})

module.exports = router;

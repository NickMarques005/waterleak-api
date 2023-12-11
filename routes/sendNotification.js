//sendNotification.js

const express = require('express');
const router = express.Router();
const firebaseServer = require('../firebase/firebase_service');
const { Expo } = require('expo-server-sdk');

const expo = new Expo;

router.post('/notify', async (req, res) => {
    const {user_id} = req.body;

    if(!user_id)
    {
        return res.status(400).json({success: false, message: "Id do usuário não fornecido"});
    }

    const { token } = await firebaseServer.getToken(user_id);
    
    const newNotification = {
        title: "Cuidado com seu consumo!",
        body: "Fique de olho em seu consumo. Atingir suas metas de consumo é um passo importante para um controle eficaz. ",
        badge: 1
    }

    expo.sendPushNotificationsAsync([
        {
            to: token,
            ...newNotification,
        }
    ]);
    res.status(200).send('success');
});

router.post('/notifyConsumptionPerMinuteExceeded', async (req,res) => {
    try{
        const {user_id} = req.body;

        console.log("USER ID: ", user_id);

        if(!user_id)
        {
            return res.status(400).json({error: "Id do usuário não fornecido"});
        }

        const { token } = await firebaseServer.getToken(user_id);

        const newNotification = {
            title: "Alerta de consumo por minuto excedido",
            body: "Seu consumo por minuto está muito elevado. Fique atento!",
            badge: 1,
        }

        expo.sendPushNotificationsAsync([
            {
                to: token,
                ...newNotification,
            }
        ])

        res.status(200).json({message: 'Notificação enviada com sucesso!'});
    }
    catch (err)
    {
        console.error("Houve um erro: ", err);
        res.status(500).json({ error: 'Erro no servidor ao enviar notificação em /notifyConsumptionPerMinuteExceeded' });
    }
})


module.exports = router;
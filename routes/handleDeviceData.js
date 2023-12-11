//---handleDeviceData.js---//

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const FlowData = require('../models/flow_data');
const jwt = require('jsonwebtoken');
const { jwt_key } = require('../config');

router.post('/getDevices' , async (req, res) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');

        if(!token)
        {
            return res.status(400).json({message: "Token não fornecido"});
        }
        
        const decodedToken = jwt.verify(token, jwt_key);
        console.log("user ID: ", decodedToken);

        const userDevices = await FlowData.find({user_id: decodedToken.user.id},
            {
                sensor_id: 1,
                sensor_name: 1,
                user_network: 1,
                _id: 0
            });

        if(userDevices.length === 0)
        {
            return res.status(404).json({message: "Nenhum dispositivo encontrado"});
        }

        const formattedDevices = userDevices.map((device) => {
            return {
                id: device.sensor_id,
                name: device.sensor_name,
                network: device.user_network.network_name
            };
        })

        console.log("Dispositivos a serem enviados: ", formattedDevices);

        return res.status(200).json({success: true, user_devices: formattedDevices});
    }
    catch(err){
        console.error("Houve um erro ao resgatar os dados dos dispositivos: ", err);
        return res.status(500).json({ message: "Houve um erro ao resgatar os dados dos dispositivos"})
    }
});

router.post('/updateDevice', (req, res) => {

});

module.exports = router;
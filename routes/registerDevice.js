//---registerDevice.js---//

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const FlowData = require('../models/flow_data');
const jwt = require('jsonwebtoken');

//Chave principal para assinar os tokens JWT.
const jwt_mainKey = require('../config').jwt_key;

router.post('/registerDevice', async (req, res) => {
    try {
        //Recebimento dos dados da requisição no aplicativo
        const token = req.header('Authorization').replace('Bearer ', '');
        const { newDevice } = req.body;

        console.log("REGISTER DEVICE: ", newDevice);
        console.log("TOKEN: ", token);
        if(!token || !newDevice)
        {
            return res.status(400).json({ message: "Houve um erro no envio dos dados do Dispositivo"});
        }

        //Decodificação do token:
        const decodedToken = jwt.verify(token, jwt_mainKey);
        console.log("TOKEN DECODIFICADO: ", decodedToken);

        const user = await User.findById(decodedToken.user.id);

        //Verifica se o usuário está registrado no banco de dados
        if(!user){
            return res.status(404).json({message: "Usuário não encontrado"});
        }

        const userId = decodedToken.user.id;

        //Verificação se existe o documento do usuário registrado na coleção de metas
        const registered_device = await FlowData.findOne({sensor_id: newDevice.sensor_id});

        console.log("ID: ", newDevice.sensor_id);

        if(!registered_device)
        {
            console.log("Dispositivo não encontrado: ", newDevice.sensor_id);
            return res.status(404).json({message: "Dispositivo não encontrado"});
        }

        if(registered_device.user_id !== ""){
            console.log("DISPOSITIVO JÁ POSSUI USUARIO REGISTRADO!");
            return res.status(400).json({ message: "Dispositivo já possui um usuário registrado"});
        }

        const newDevice_data = {
            sensor_name: newDevice.sensor_name,
            user_id: userId,
            user_network: {
                network_name: registered_device.user_network.network_name,
                network_connected: false
            },
            date_creation: new Date(Date.now() - 3*60*60*1000),
        }

        Object.assign(registered_device, newDevice_data);

        await registered_device.save();

        console.log('Dispositivo registrado com sucesso');
        return res.status(200).json({ success: true, message: "Dispositivo registrado com sucesso"});

    }
    catch(err){
        console.error('Erro ao registrar dispositivo: ', err);
        return res.status(500).json({message: "Erro ao registrar dispositivo no banco de dados"});
    }
})

router.post('/unregisterDevice', (req, res) => {

});

module.exports = router;
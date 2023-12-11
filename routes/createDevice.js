//---createDevice.js---//

const express = require('express');
const router = express.Router();
const FlowData = require('../models/flow_data');

router.post('/createDevice', async (req,res) => {
    
    const { sensor_id, user_id} = req.body;

    console.log({ sensor_id, user_id});
    
    try{

        if(!sensor_id)
        {
            console.log("Está faltando dados!");
            return res.status(400).json("Faltam dados a serem enviados");
        }

        const device_data = {
            sensor_id,
            user_id,
        }

        const saveDevice = new FlowData(device_data);
        
        await saveDevice.save();

        console.log("Dados do dispositivo recebidos e salvos no banco de dados!");
        return res.status(200).json({message: "Dados recebidos e salvos com sucesso!"});
    }
    catch(err)
    {
        console.error('Erro ao criar dispositivo: ', err);
        return res.status(500).json({message: "Erro ao salvar os dados no banco de dados"});
    }
});

module.exports = router;
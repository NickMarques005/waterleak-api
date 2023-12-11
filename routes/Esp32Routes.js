//---Esp32Routes.js---//

const express = require('express');
const router = express.Router();
const FlowData = require('../models/flow_data');
const SensorData = require('../models/sensor_data');

//Rota para receber dados de vazão do ESP32
router.post('/saveFlowData', async (req, res) => {

    const { sensor_id , sensor_value } = req.body; //Dados enviados pelo ESP32

    const sensorData = {
        sensor_id: sensor_id,
        sensor_value: sensor_value
    }

    console.log("Dados recebidos do ESP-32: ", sensorData );

    try{
        const device = await FlowData.findOne({sensor_id: sensorData.sensor_id});

        if(!device)
        {
            return res.status(404).json({success: false, message: "Dispositivo não encontrado"});
        }

        if(!device.user_id)
        {
            return res.status(400).json({success: false, message: 'Usuário não registrado!'});
        }

        console.log("HAS USER: ", device.user_id);

        const newData = new SensorData({
            sensor_id: device.sensor_id,
            sensor_value: sensor_value,
            consumed_date: Date.now() - 3*60*60*1000
        });

        await newData.save();

        console.log("Dados de vazão recebidos e salvos no banco de dados!");
        return res.status(200).json({message: "Dados recebidos e salvos com sucesso!"});
    }
    catch(error)
    {
        console.error("Erro ao salvar os dados de vazão: ", error);
        return res.status(500).json({message: "Erro ao salvar os dados no banco de dados"});
    }
});

router.post('/sendNetworkData', async (req, res) => {
    const {sensor_id} = req.body;

    console.log("NETWORK: ", sensor_id);
    
    try {
        const device = await FlowData.findOne({sensor_id: sensor_id})
    
        if(!device)
        {   
            
            return res.status(404).json({ success: false, message: "Dispositivo não encontrado"});
        }
        
        if(!device.user_network.network_name || !device.user_network.network_password)
        {
            return res.status(400).json({ success: false, message: "Sem rede registrada"});
        }

        console.log('DEVICE: ', device);

        const network_data = {
            network_ssid: device.user_network.network_name,
            network_password: device.user_network.network_password
        }

        return res.status(200).json({success: true, network: network_data});
    }
    catch (err)
    {
        console.error("Erro ao enviar os dados de rede: ", error);
        return res.status(500).json({message: "Erro ao enviar os dados de rede ao dispositivo"});
    }
});

module.exports = router;
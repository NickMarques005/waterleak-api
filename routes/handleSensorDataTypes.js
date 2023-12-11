//---handleSensorDataTypes.js---//

const express = require('express');
const router = express.Router();
const FlowData = require('../models/flow_data');
const jwt = require('jsonwebtoken');
const { jwt_key } = require('../config');
const { filterSensorDataByPeriod } = require('../functions/sensorDataUtils');

//Rota para retorno do valor atual de consumo em relação ao período específico

router.post('/handleDynamicSensorValue', async (req, res) => {
    try{
        //Recebimento dos dados da requisição no aplicativo
        const token = req.header('Authorization').replace('Bearer ', '');
        const {period_data} = req.body;

        console.log("TOKEN: ", token);
        console.log('PERIOD DATA: ', period_data);

        if(!token)
        {
            res.status(404).json({success: false, message: "Houve um erro token não fornecido"});
        }

        if(!period_data || !period_data.period_value || !period_data.start_date)
        {
            return res.status(400).json({success: false, message: "Dados de período não fornecidos"});
        }

        const decodedToken = jwt.verify(token, jwt_key);
        console.log("user ID: ", decodedToken);
        const userDevices = await FlowData.find({user_id: decodedToken.user.id});

        if(userDevices.length == 0){
            res.status(404).json({success: false, message: 'Nenhum dispositivo encontrado'});
        }

        const totalCurrentConsumption = await filterSensorDataByPeriod(userDevices, period_data.start_date, Number(period_data.period_value));

        console.log("TOTAL: ", totalCurrentConsumption);
        return res.status(200).json({success: true, current_consumption: totalCurrentConsumption});

    }
    catch (err){
        //Caso de algum erro envie ao console para depuração
        console.error("Erro: ", err);
        return res.status(500).json({ message: "Houve um erro no servidor ao retornar valores da meta especifica" });
    }

});

module.exports = router;
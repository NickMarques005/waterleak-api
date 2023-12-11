//----sensorDailyRoutes.js----//

const express = require('express');
const router = express.Router();

const sensorData = require('../models/sensor_data');

const formatSensorData = (sensorData) => {
    let diary_data = Array.from({ length: 24 }, (_, i) => ({ hour: i + 1, consumption: 0 }));

    sensorData.sort((a, b) => a.consumed_date - b.consumed_date);

    sensorData.forEach((dataPoint) => {
        const consumedDate = new Date(dataPoint.consumed_date);
        const hour = consumedDate.getUTCHours() + 1;

        const formattedValue = dataPoint.sensor_value

        diary_data[hour - 1].consumption += formattedValue;
    });

    diary_data.forEach((item) => {
        item.consumption = (item.consumption).toFixed(2);
        item.consumption = parseFloat(item.consumption);
    });

    return diary_data;
}


router.post('/sensor_daily_data', async (req, res) => {
    try {
        const { sensor_id } = req.body;

        console.log(sensor_id);

        if (!sensor_id) {
            return res.send(400).json({ success: false, error: 'Sensor id vazio' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diary_consumption = await sensorData.find({
            sensor_id: sensor_id,
            consumed_date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            }
        }, { _id: 0, sensor_value: 1, consumed_date: 1 });

        if (!diary_consumption) {
            return res.send(200).json({ success: true, data_diary_device_consumption: diary_consumption });
        }


        const formattedConsumptionData = formatSensorData(diary_consumption);


        return res.status(200).json({ success: true, data: formattedConsumptionData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Houve um erro no servidor' });
    }
});

module.exports = router;
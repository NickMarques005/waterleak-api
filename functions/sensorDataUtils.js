const SensorData = require('../models/sensor_data');

const filterSensorDataByPeriod = async (sensors, start_date, period_value) => {
    try {
        //Cálculo de data de término com base no período
        const endDate = new Date(start_date);

        const startDate = new Date(start_date);

        console.log("START DATE PERIOD: ", startDate);
        endDate.setDate(endDate.getDate() + period_value);
        console.log("END DATE PERIOD: ", endDate);

        let sensorDataForPeriod = [];



        //Consulta SensorData para encontrar valores de consumo dos dispositivos registrados ao usuário
        for(const sensor of sensors)
        {
            console.log("SENSOR CURRENT: ", sensor);
            const sensorData = await SensorData.find({
                sensor_id: sensor.sensor_id,
                consumed_date: {$gte: startDate, $lte: endDate}
            });

            const totalConsumption = sensorData.reduce((total, data) => {
                return total + data.sensor_value;
            }, 0);

            sensorDataForPeriod.push({
                total_current_consumption: totalConsumption
            })
        }

        const totalConsumptionData = sensorDataForPeriod.reduce((total, sensor) => {
            return total + sensor.total_current_consumption;
        }, 0);

        return totalConsumptionData;
    }
    catch (err)
    {
        throw err;
    }
}

module.exports = {
    filterSensorDataByPeriod,
};
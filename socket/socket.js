const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { jwt_key } = require('../config');
const User = require('../models/user');
const Device = require('../models/flow_data');
const SensorData = require('../models/sensor_data');
const axios = require('axios');

const handleDailyValue = async (devices) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 3);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    endOfDay.setHours(endOfDay.getHours() - 3);

    console.log(startOfDay);
    console.log(endOfDay);

    const sensorDataForDay = [];

    for (const device of devices) {
        console.log("CURRENT DEVICE: ", device);
        const sensorData = await SensorData.find({
            sensor_id: device.sensor_id,
            consumed_date: { $gte: startOfDay, $lte: endOfDay }
        })

        const totalConsumption = sensorData.reduce((total, data) => {
            console.log("VALOR: ", data.sensor_value);
            console.log("TOTAL ATUAL -> ", total);
            return total + data.sensor_value;
        }, 0);

        console.log(`TOTAL DIÁRIO ${device.sensor_name}: `, totalConsumption);

        sensorDataForDay.push({
            total_daily_consumption: totalConsumption
        })
    };

    return sensorDataForDay;
}

const handleMonthlyValue = async (devices) => {
    const startOfMonth = new Date();
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setDate(1);
    startOfMonth.setHours(startOfMonth.getHours() - 3);

    const endOfMonth = new Date();
    endOfMonth.setHours(23, 59, 59, 999);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(endOfMonth.getHours() - 3);

    console.log("END OF MONTH: ", endOfMonth);

    const sensorDataForMonth = [];

    for (const device of devices) {
        const sensorData = await SensorData.find({
            sensor_id: device.sensor_id,
            consumed_date: { $gte: startOfMonth, $lte: endOfMonth }
        })

        const totalConsumption = sensorData.reduce((total, data) => {
            return total + data.sensor_value;
        }, 0);

        console.log(`TOTAL MENSAL ${device.sensor_name}: `, totalConsumption);

        sensorDataForMonth.push({
            total_monthly_consumption: totalConsumption
        });
    };

    return sensorDataForMonth;
}

//Change Stream para Valores do sensor:

const changeStream = SensorData.watch();

const RealTimeConsumption = (io) => {
    console.log("Listener RealTimeConsumption active!");
    let timer = null;
    changeStream.on('change', async (change) => {

        const updatedConsumedData = change;
        console.log(updatedConsumedData);
        if (change.operationType === 'insert' && change.ns.coll == "sensor_data") {

            const newSensorDocument = change.fullDocument;

            if (!newSensorDocument) {
                console.log("Nenhum documento do sensor encontrado");
                return;
            }

            const newSensorValue = newSensorDocument.sensor_value;

            if (!newSensorValue) {
                console.log("Valor não encontrado!");
                return;
            }

            let currentSensorValue = 0;

            console.log(`Novo valor do sensor: ${newSensorValue}`);

            const sensorId = newSensorDocument.sensor_id;

            if (!sensorId) {
                console.log("Houve um erro: Id de sensor não encontrado");
                return;
            }

            const userDevice = await Device.findOne({ sensor_id: sensorId }, {
                user_id: 1,
                _id: 0,
            })

            if (!userDevice) {
                console.log("Usuário não encontrado!");
                return;
            }

            console.log("Usuário Id RealTime: ", userDevice.user_id);

            const devices = await Device.find({ user_id: userDevice.user_id });

            if (devices.length === 0) {
                console.log("Não foi encontrado dispositivos...");
                return;
            }

            currentSensorValue = newSensorValue;

            const sensorValueLitersPerMinute = currentSensorValue * 12;

            const totalDailyConsumption = await handleDailyValue(devices);
            console.log("DAILY DATA SENSOR TOTAL: ", totalDailyConsumption);
            const totalMonthlyConsumption = await handleMonthlyValue(devices);
            console.log("MONTHLY DATA SENSOR TOTAL: ", totalMonthlyConsumption);

            console.log("CURRENT SENSOR VALUE PER 5 SECONDS: ", currentSensorValue);
            console.log("CURRENT SENSOR VALUE PER MINUTE: ", sensorValueLitersPerMinute);

            if (sensorValueLitersPerMinute > 0.9) {
                const timerToSendNotification = true;

                    //Requisição notificação: 
                    const userId = "0000001";
                    axios.post('http://192.168.1.164:1000/api/notifyConsumptionPerMinuteExceeded', { user_id: userId })
                        .then((response) => {
                            console.log("Notificação enviada com sucesso: ", response.data);
                        })
                        .catch((err) => {
                            console.error("Erro ao enviar notificação: ", err);
                        });
            }

            if (currentSensorValue !== 0) {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(() => {
                    currentSensorValue = 0;
                    console.log("CURRENT SENSOR VALUE ZERO!");
                    io.to(userDevice.user_id).emit('sensor_data', {
                        consumption_current: currentSensorValue,
                    });
                }, 5500);
            }

            const all_totalConsumption = {
                consumption_day: totalDailyConsumption,
                consumption_month: totalMonthlyConsumption,
                consumption_current: sensorValueLitersPerMinute
            }

            console.log("ALL CONSUMPTIONS CHANGE SENSOR_DATA: ", all_totalConsumption);

            io.to(userDevice.user_id).emit('sensor_data', all_totalConsumption);

        }
    });
}


const configureSocket = (server) => {
    const io = new Server(server);

    //Listener para monitoramento do consumo em tempo real:
    RealTimeConsumption(io);

    io.on('connection', (socket) => {
        console.log("Usuário conectado!", socket.id);

        socket.on('join_room', (data) => {
            const { token } = data;
            console.log("TOKEN USER: ", token);

            if (!token) {
                return;
            }

            const user_id = jwt.verify(token, jwt_key);
            console.log("user ID: ", user_id.user.id);

            socket.join(user_id.user.id);
        });

        socket.on('sensor_data', async (data) => {
            const { token } = data;

            console.log("Sensor_data!");
            console.log("TOKEN USER: ", token);

            if (!token) {
                return;
            }

            const user_id = jwt.verify(token, jwt_key);
            console.log("user ID: ", user_id.user.id);

            const userDevices = await Device.find({ user_id: user_id.user.id });
            if (userDevices.length === 0) {
                console.log("Não foi encontrado dispositivos...");
                return;
            }

            let currentConsumption = 0;

            const totalDailyConsumption = await handleDailyValue(userDevices);
            console.log("DAILY DATA SENSOR TOTAL: ", totalDailyConsumption);
            const totalMonthlyConsumption = await handleMonthlyValue(userDevices);
            console.log("MONTHLY DATA SENSOR TOTAL: ", totalMonthlyConsumption);

            const all_totalConsumption = {
                consumption_day: totalDailyConsumption,
                consumption_month: totalMonthlyConsumption,
                consumption_current: currentConsumption
            }

            io.to(user_id.user.id).emit('sensor_data', all_totalConsumption);
        });

        socket.on('disconnect', () => {
            console.log("Usuário desconectado!", socket.id);
        });
    });

    return io;
}

module.exports = { configureSocket };

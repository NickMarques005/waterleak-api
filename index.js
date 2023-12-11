//index.js

const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const bodyparser = require('body-parser');
const dotenv = require('dotenv').config();
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require('./socket/socket');

const PORT = process.env.PORT || 1000;

const database = require('./database');
const firebaseServer = require('./firebase/firebase_service');
const Esp32Routes = require('./routes/Esp32Routes');
//Acionando funcionalidades do banco de dados:
database();

app.use(express.json());

//Servidor Socket:

//Configuração do socket:
socket.configureSocket(server);

//Rotas de Criação de Dispositivos:

app.use('/api', require('./routes/createDevice'));

//Rotas para ESP32:
app.use('/api', Esp32Routes);

//Rotas para Frontend:

//-> CRIAÇÃO DE USUÁRIO E AUTENTICAÇÃO:

app.use('/api', require('./routes/createUser'));

app.use('/api', require('./routes/authData'));

//-> NOTIFICAÇÕES:

app.use('/api', require('./routes/registerNotificationToken'));

app.use('/api', require('./routes/sendNotification'));

//-> CONFIGURAÇÃO DE CONSUMO:

app.use('/api', require('./routes/updateUserConsumption'));

//-> METAS:

app.use('/api', require('./routes/handleGoalCreation'));

app.use('/api', require('./routes/handleSensorDataTypes'));

//-> DISPOSITIVOS:

app.use('/api', require('./routes/registerDevice'));

app.use('/api', require('./routes/handleDeviceData'));

app.use('/api', require('./routes/sensorDailyRoutes'));

//Teste método GET ao servidor
app.get("/", (req,res) => {
    res.send("Water Leak Server!");
});

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
});

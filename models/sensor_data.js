//---sensor_data.js---//

const mongoose = require('mongoose');
const time_zone = require('moment-timezone');

const { Schema } = mongoose;

const sensorDataSchema = new Schema ({
    sensor_id: {
        type: String,
        required: true
    },
    sensor_value: {
        type: Number,
        required: true
    },
    consumed_date: {
        type: Date,
        default: Date.now() - 3*60*60*1000
    }
});

sensorDataSchema.pre('save', function (next) {
    this.consumed_date = time_zone.utc(this.consumed_date).tz('America/Sao_Paulo');
    next();
});

const SensorData = mongoose.model('sensordata', sensorDataSchema, 'sensor_data');

module.exports = SensorData;
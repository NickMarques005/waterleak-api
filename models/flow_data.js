//---flow_data.js---//

const mongoose = require('mongoose');
const time_zone = require('moment-timezone');

const { Schema } = mongoose;

const flowDataSchema = new Schema({
    sensor_id: {
        type: String,
        required: true
    },
    sensor_name: {
        type: String,
        default: ''
    },
    user_id: {
        type: String,
        default: ''
    },
    user_network: {
        network_name: {
            type: String,
            default: ''
        },
        network_connected: {
            type: Boolean,
            default: false
        }
    },
    date_creation: {
        type: Date,
        default: Date.now() - 3*60*60*1000
    }
});

flowDataSchema.pre('save', function (next) {
    this.date_creation = time_zone.utc(this.date_creation).tz('America/Sao_Paulo');
    next();
});

const FlowData = mongoose.model('flowdata', flowDataSchema, 'flow_data');

module.exports = FlowData;
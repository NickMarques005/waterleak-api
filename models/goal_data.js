//---goal_data.js---//

const mongoose = require('mongoose');

const { Schema } = mongoose;

const goalDataSchema = new Schema ({
    goals: {
        type: Array,
        default: [],
    },
    userID: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('goaldata', goalDataSchema, 'user_goals_data');
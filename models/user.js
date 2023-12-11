//---user.js---//

const mongoose = require('mongoose');

const { Schema } = mongoose;

//Schema User for Registration:
const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    telefone:{
        type:Number,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    standard_consumption: {
        type: Object,
        required: false,
        default: 0
    }
});

module.exports = mongoose.model('user', userSchema, 'forms_data');
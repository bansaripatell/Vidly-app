const mongoose = require('mongoose');
const Joi = require('joi');
const jwt= require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 320
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({ _id : this._id , isAdmin: this.isAdmin }, config.get('jwtPrivateKey')); 
    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().min(3).max(320).required().email(),
        password: Joi.string().min(8).max(255).required(),
    });
    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
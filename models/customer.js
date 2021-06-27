const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20,
    },
    isGold: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 14
    },
});

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer){
    const schema = Joi.object({
        name: Joi.string().min(5).required(),
        phone: Joi.string().min(10).required(),
        isGold: Joi.boolean(),
    });
    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
const auth = require('../middleware/auth');
const { Customer, validate } = require('../models/customer');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const customers = await Customer
        .find()
        .sort({ name: 1});

    console.log(customers);
    res.send(customers);
});

router.get('/:id',async (req, res) => {

    const customer = await Customer.findById(req.params.id);

    if(!customer) return res.status(404).send('The genre with given Id was not found.');

    res.send(customer);
});

router.post('/',auth, async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let customer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    });

    try{
        customer = await customer.save();
        console.log(customer);
    }catch(ex){
        for (let field in ex.errors){
            console.log(ex.errors[field].message);
        }
    }
    res.send(customer);
});

router.put('/:id', async (req, res) => {

    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        $set: {
            name: req.body.name,
        }   
    },{ new : true,});

    if(!customer) return res.status(404).send('The genre with given Id was not found.');

    res.send(customer);

});

router.delete('/:id',async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if(!customer) return res.status(404).send('The genre with given Id was not found.');

    res.send(customer);
});

module.exports = router;
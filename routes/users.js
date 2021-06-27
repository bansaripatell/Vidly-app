const auth = require('../middleware/auth');
const bcrypt  = require('bcrypt');
const _ = require('lodash');
const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.send(user);
})

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['name', 'email', 'password' ]));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password , salt);

    try{
        user = await user.save();
        console.log(user);

    }catch(ex){
        
        for (let field in ex.errors){
            console.log(ex.errors[field].message);
        }
    }

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, [ '_id', 'name', 'email' ]));
});

module.exports = router;
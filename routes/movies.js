const auth = require('../middleware/auth');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const mongoose = require('mongoose');
const validateObjectId = require('../middleware/validateObjectId')
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie
        .find()
        .sort({ name: 1});

    console.log(movies);
    res.send(movies);
});

router.get('/:id',validateObjectId, async (req, res) => {

    const movie = await Movie.findById(req.params.id);

    if(!movie) return res.status(404).send('The movie with given Id was not found.');

    res.send(movie);
});

router.post('/',auth, async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(400).send('Invalid genre.');

    let movie = new Movie({
        title: req.body.title,
        genre:{
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        
    });

    try{
        movie = await movie.save();
        console.log(movie);
    }catch(ex){
        for (let field in ex.errors){
            console.log(ex.errors[field].message);
        }
    }
    res.send(movie);
});

router.put('/:id', async (req, res) => {

    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const movie = await Movie.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            genre:{
                _id: genre._id,
                name: genre.name
            },
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate,
        }   
    },{ new : true });

    if(!movie) return res.status(404).send('The movie with given Id was not found.');

    res.send(movie);

});

router.delete('/:id',async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);

    if(!movie) return res.status(404).send('The movie with given Id was not found.');

    res.send(movie);
});

module.exports = router;
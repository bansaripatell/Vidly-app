const request = require('supertest');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const mongoose = require('mongoose');

describe('/api/movies',() => {
    let server;
    let movie;
    let genreId;

    beforeEach(async () => { 
        server = require('../../index');

        genreId = mongoose.Types.ObjectId();

        movie = new Movie({

            title: 'movie1',
            genre: {
                _id: genreId,
                name: 'genre1',
            },
            numberInStock: 5,
            dailyRentalRate: 2

        });

        await movie.save();
    })

    afterEach(async () => {

        await server.close();
        await Movie.remove({});

    });

    describe('GET /',() => {
        it('should return all movies',async () => {

            await Movie.remove({});
            await Movie.collection.insertMany([
                { title: 'movie1', genreId: mongoose.Types.ObjectId(), numberIStock: 5, dailyRentalRate: 2 },
                { title: 'movie2', genreId: mongoose.Types.ObjectId(), numberIStock: 4, dailyRentalRate: 10 },
            ]);

            const res = await request(server).get('/api/movies');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {
        it('Should return a movie if valid id is passed', async () => {

            const res = await request(server).get('/api/movies/' + movie._id);

            expect(res.status).toBe(200);
            
        });

        it('Should return 404 if invalid id is passed',async () => {
            
            const c = 1;

            const res = await request(server).get('/api/movies/' + c);

            expect(res.status).toBe(404);
        });

        it('Should return 404 if no movie with the given id exists', async () => {

            const id = mongoose.Types.ObjectId();

            const res = await request(server).get('/api/movies/' + id );

            expect(res.status).toBe(404);
        });

    });
});
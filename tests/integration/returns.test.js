const request = require('supertest');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');
const mongoose = require('mongoose');
const moment = require('moment');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let token; 
    let movie;

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    } 

    beforeEach( async () => {
        server = require('../../index');

        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        movie = new Movie({
            _id: movieId,
            title: 'movie1',
            dailyRentalRate: 2,
            genre: { name: 'genre1' },
            numberInStock: 5
        });

        await movie.save();
        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'customer1',
                phone: '1234567890'
            },
            movie: {
                _id: movieId,
                title: 'movie1',
                dailyRentalRate: 2
            }
        });

        await rental.save();
        token = new User().generateAuthToken();

    })

    afterEach(async () => {

        await server.close();
        await Rental.remove({});
        await Movie.remove({});

    });

    it('Should return 401 if user is not logged in.', async () => {
        
        token = '' ;
        
        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('Should return 400 if customerId is not provided.', async() =>{

        customerId = null;

        const res = await exec();

        expect(res.status).toBe(400);

    });
    
    it('Should return 400 if movieId is not provided.', async() =>{

        movieId = null;

        const res = await exec();

        expect(res.status).toBe(400);

    });
    
    it('Should return 404 if no rental found for given customerId/movieId.', async() =>{

        await Rental.remove({});

        const res = await exec();

        expect(res.status).toBe(404);

    });

    it('Should return 400 if return is already processed.', async() =>{

        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);

    });
    
    it('Should return 200 if we have a valid request', async() =>{

        const res = await exec();

        expect(res.status).toBe(200);

    });

    it('Should set the returnDate if input is valid', async() =>{

        await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned; 

        expect(diff).toBeLessThan(10*1000);

    });
    
    it('Should calculate the rental fees if input is valid', async() =>{

        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        await exec();

        const rentalInDb = await Rental.findById(rental._id);

        const rentalFee = moment().diff(rental.dateOut, 'days') * rental.movie.dailyRentalRate;

        expect(rentalInDb.rentalFee).toBe(rentalFee);

    });
    
    it('Should increase the stock in the movie if input is valid', async() =>{

        await exec();

        const movieInDb = await Movie.findById(movieId);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock+1);

    });
    
    it('Should return rental if input is valid', async() =>{

        const res = await exec();

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('customer');
        expect(res.body).toHaveProperty('movie');
        expect(res.body).toHaveProperty('dateOut');
        expect(res.body).toHaveProperty('dateReturned');
        expect(res.body).toHaveProperty('rentalFee');

    });
});
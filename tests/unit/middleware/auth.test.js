const auth = require('../../../middleware/auth');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');

describe('auth middleware', () => {
    it('Should populate req.user with the payload of a valid JWT',() => {
        
        const payload = { 
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true
        };
        const user = new User(payload);
        const token = user.generateAuthToken();
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {};
        const next = jest.fn();

        auth(req, res, next);

        expect(req.user).toMatchObject(payload);
    });
});
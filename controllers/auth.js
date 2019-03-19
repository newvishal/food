const bycrpt = require('bcryptjs');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');

const secretKey = fs.readFileSync('./config/key.txt');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const address = req.body.address;
    const password = req.body.password;
    
    bycrpt.hash(password, 12)
        .then(hashedPsw => {
            const user = new User({
                email,
                password: hashedPsw,
                name,
                address,
                phone

            });

            return user.save();
        })
        .then(result => {
            res.status(201)
                .json({message: 'User created!'});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;

            return bycrpt.compare(password, loadedUser.password);
        }).then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong Password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                secretKey,
                {expiresIn: '1h'}
            );

            res.status(200).json({token: token, userId: loadedUser._id.toString()})
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

};

exports.getDetailById = (req, res, next) => {
    const adminId = req.params.id;
    User.findById(adminId)
        .then(admindetail => {
                if(!admindetail){
                    const error = new Error('Could not find details.');
                    error.statusCode = 404;
                    throw error;
                }
                res.status(200).json({message: 'detail fetched.', admindetail})
        }).catch(err => {
                if(!err.statusCode){
                    err.statusCode = 500;
                }
                next(err);
        })

}

// exports.test = (req, res, next) => {
//     console.log('test');
// }

exports.updateAdminDetail = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, Enter data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    const adminId = req.params.id;

    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const address = req.body.address;

    User.findById(adminId)
        .then(user => {
            if(!user){
                const error = new Error('Could not find detail');
                error.statusCode = 404;
                throw error;
            }

            user.email = email;
            user.name = name;
            user.phone = phone;
            user.address = address;
            return user.save();
        })
        .then(result => {
            res.status(200).json({message: 'Detail Updated', user: result});
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}

const express = require('express');
const {body} = require('express-validator/check');
const fs = require('fs');
const authController = require('../controllers/auth');

const User = require('../models/user');
const isAuth = require('../middleware/is-auth');
const crypto = require('crypto');   // for file upload
const path = require('path');   // for file upload
const router = express.Router();

var multer  = require('multer');  // for file upload
var storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
});   // for file upload

var upload = multer({ storage: storage }); //for file upload


router.put(
    '/signup',
    [
        body('email').withMessage('Please enter a valid email')
            .custom((value, {req}) => {
                return User.findOne({email: value}).then(user => {
                    if (user) {
                        return Promise.reject('Email adress already exists!');
                    }
                })
            }),
            body('password').trim().isLength({min: 5}),
            body('phone').trim().isLength({max: 10}),
            body('name').trim().not().isEmpty(),
            body('address').trim(),
    ],
    authController.signup);

router.post('/login' , authController.login);
router.get('/:id',isAuth , authController.getDetailById);
router.put('/:id',isAuth , authController.updateAdminDetail);
// router.post('/upload',authController.test)
router.put('/upload/:id', upload.single('file'), function(req, res, next) {
  if (req.file) {
    const adminId = req.params.id;
    console.log(adminId);
    var filename = req.file.filename;
    var image = filename;
    User.findById(adminId)
        .then(user => {
              if(!user){
                const error = new Error('Could not find issue.');
                error.statusCode = 404;
                throw error;
              }
              user.path = image;
              return user.save();
        })
        .then(result => {
            res.status(200).json({message: 'Profile Updated!', user: result});
        })
        .catch(err => {
              if(!err.statusCode){
                  err.statusCode = 500;
              }
              next(err);
        })
  }
});
module.exports = router;



const jwt = require('jsonwebtoken');
const fs = require('fs');

// const secretKey = fs.readFileSync('./config/key.txt');
const secretKey = "IloveJS";
module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  //   console.log('to =>'+ token);
  //   console.log(jwt.verify(token,secretKey ));
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, secretKey);
    //   console.log(decodedToken.userId);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
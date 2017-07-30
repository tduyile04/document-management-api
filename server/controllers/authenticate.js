import jwt from 'jsonwebtoken';

class Authentication {
  static authenticate(req, res, next) {
    const token = req.body.token || req.params.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, 'zabuzatovadase', (error, decoded) => {
        if (error) {
          return res.status(500).json({ message: 'Failed to authenticate token' });
        } else {
          req.decoded = decoded;
          next();
        }
      })
    } else {
      res.status(403).send({
        success: false,
        message: 'No token provided'
      });
    }
  }
}

export default Authentication;
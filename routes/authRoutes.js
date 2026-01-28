const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();


router.post('/signup', authController.validateSignup, authController.signup);
router.post('/login', authController.validateLogin, authController.login);


router.get('/protected', authController.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'You have access to this protected route',
    user: req.user,
  });
});

module.exports = router;

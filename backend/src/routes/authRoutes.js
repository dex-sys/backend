const express = require('express');
const {sign_in, sign_up, forgot_password, reset_password} = require('../controllers/authController');

const router = express.Router();

router.post('/sign-up', sign_up);
router.post('/sign-in', sign_in);
router.post('/forgot-password', forgot_password);
router.post('/reset-password/:token', reset_password);
//router.get('/reset-password/:token', reset_password); //Esto deberá de estar implementado en el frontend

module.exports = router;

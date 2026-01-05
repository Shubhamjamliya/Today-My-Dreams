const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const ctrl = require('../controllers/vendorAuthController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', vendorAuth, ctrl.me);
router.patch('/accept', vendorAuth, ctrl.accept);

module.exports = router;

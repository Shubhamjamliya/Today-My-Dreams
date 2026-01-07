const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/vendorAuthController');

router.post('/register', upload.fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]), ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', vendorAuth, ctrl.me);
router.patch('/accept', vendorAuth, ctrl.accept);
router.post('/forgot-password', ctrl.forgotPassword);
router.put('/reset-password/:token', ctrl.resetPassword);

module.exports = router;

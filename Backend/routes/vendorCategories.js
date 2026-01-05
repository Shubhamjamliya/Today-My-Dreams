const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const ctrl = require('../controllers/vendorCategoryController');

router.get('/', vendorAuth, ctrl.list);

module.exports = router;


const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const ctrl = require('../controllers/vendorOrderController');

router.get('/stats', vendorAuth, ctrl.stats);
router.get('/', vendorAuth, ctrl.list);
router.get('/:id', vendorAuth, ctrl.detail);
router.patch('/:id/status', vendorAuth, ctrl.updateStatus);

module.exports = router;


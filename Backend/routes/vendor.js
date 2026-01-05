const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/vendorController');

router.get('/', authenticateToken, isAdmin, ctrl.list);
router.patch('/:id/approve', authenticateToken, isAdmin, ctrl.approve);
router.patch('/:id/block', authenticateToken, isAdmin, ctrl.block);
router.patch('/:id/unblock', authenticateToken, isAdmin, ctrl.unblock);
router.patch('/:id/assign', authenticateToken, isAdmin, ctrl.assign);

module.exports = router;

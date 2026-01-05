const express = require('express');
const router = express.Router();
const { isAdmin, authenticateToken } = require('../middleware/auth');
const adminSettingsController = require('../controllers/adminSettingsController');

// Get contact numbers (public allowed to fetch for frontend display)
router.get('/contacts', adminSettingsController.getContactNumbers);

// Update contact numbers (admin only)
router.put('/contacts', authenticateToken, isAdmin, adminSettingsController.updateContactNumber);

module.exports = router;

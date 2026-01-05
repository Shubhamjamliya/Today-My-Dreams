const ServiceContact = require('../models/serviceContact');

// Get contact numbers
exports.getContactNumbers = async (req, res) => {
  try {
    const contacts = await ServiceContact.find();

    // Convert to easier format
    const result = {
      service: '',
      shop: ''
    };

    contacts.forEach(c => {
      if (c.type === 'service') result.service = c.phoneNumber;
      if (c.type === 'shop') result.shop = c.phoneNumber;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact numbers', error: error.message });
  }
};

// Update contact number
exports.updateContactNumber = async (req, res) => {
  try {
    const { type, phoneNumber } = req.body;

    if (!['service', 'shop'].includes(type)) {
      return res.status(400).json({ message: 'Invalid contact type' });
    }

    const contact = await ServiceContact.findOneAndUpdate(
      { type },
      { type, phoneNumber, updatedAt: Date.now() },
      { new: true, upsert: true } // Create if doesn't exist
    );

    res.json({ message: 'Contact updated successfully', contact });
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact number', error: error.message });
  }
};

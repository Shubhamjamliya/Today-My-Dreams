const Settings = require('../models/Settings');

// Check if Settings model is available
if (!Settings) {
  console.error('Settings model not found');
}

// Get all settings
const getAllSettings = async (req, res) => {
  try {
    console.log('Fetching all settings...');
    const settings = await Settings.find().sort({ key: 1 });
    console.log('Settings found:', settings.length);
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
  }
};

// Get a specific setting by key
const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });

    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    res.status(200).json({ success: true, setting });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch setting', error: error.message });
  }
};

// Create or update a setting
const upsertSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    console.log('Upserting setting:', { key, value, description });

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key and value are required' });
    }

    // Convert value to number for numeric settings
    let processedValue = value;
    if (key === 'cod_upfront_amount') {
      // Allow 0 as a valid value
      processedValue = value === '' || value === null || value === undefined ? 39 : Number(value);
    }

    // Use findOneAndUpdate with upsert to create or update
    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        value: processedValue,
        description: description || '',
        updatedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    console.log('Setting saved:', setting);

    res.status(200).json({
      success: true,
      message: 'Setting saved successfully',
      setting
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    res.status(500).json({ success: false, message: 'Failed to save setting', error: error.message });
  }
};

// Delete a setting
const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOneAndDelete({ key });

    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully',
      setting
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ success: false, message: 'Failed to delete setting', error: error.message });
  }
};

// Get public settings (no auth required)
const getPublicSettings = async (req, res) => {
  try {
    const publicKeys = [
      'cod_upfront_amount',
      'default_service_fee',
      'company_email',
      'company_phone',
      'company_phone_2',
      'company_whatsapp',
      'company_address',
      'social_facebook',
      'social_instagram',
      'social_twitter',
      'social_youtube'
    ];

    const settings = await Settings.find({ key: { $in: publicKeys } });

    // Convert to object for easier frontend usage: { key: value }
    const settingsObject = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Ensure defaults for missing keys
    if (settingsObject.cod_upfront_amount === undefined) settingsObject.cod_upfront_amount = 39;

    res.status(200).json({
      success: true,
      settings: settingsObject
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// Initialize default settings
const initializeDefaultSettings = async () => {
  try {
    const defaultSettings = [
      {
        key: 'cod_upfront_amount',
        value: 39,
        description: 'Upfront payment amount for Cash on Delivery orders (in rupees)'
      },
      {
        key: 'default_service_fee',
        value: 0,
        description: 'Default service fee for pin codes not in any specific range (in rupees)'
      },
      {
        key: 'company_email',
        value: 'support@todaymydream.com',
        description: 'Main contact email address'
      },
      {
        key: 'company_phone',
        value: '+91 77398 73442',
        description: 'Main contact phone number'
      },
      {
        key: 'company_phone_2',
        value: '',
        description: 'Secondary contact phone number (optional)'
      },
      {
        key: 'company_address',
        value: 'Prayagraj , Uttar Pradesh ,India',
        description: 'Company physical address'
      },
      {
        key: 'company_whatsapp',
        value: '+91 77398 73442',
        description: 'WhatsApp contact number'
      }
    ];

    for (const setting of defaultSettings) {
      const existingSetting = await Settings.findOne({ key: setting.key });
      if (!existingSetting) {
        await Settings.create(setting);
        console.log(`Default setting created: ${setting.key}`);
      }
    }
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
};

// Get COD upfront amount (public endpoint)
const getCodUpfrontAmount = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'cod_upfront_amount' });
    let amount = 39; // Default to 39 if not found

    if (setting) {
      // Ensure the value is a number and allow 0 as valid
      amount = (setting.value === '' || setting.value === null || setting.value === undefined) ? 39 : Number(setting.value);
    }

    res.status(200).json({
      success: true,
      amount: amount
    });
  } catch (error) {
    console.error('Error fetching COD upfront amount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch COD upfront amount',
      amount: 39 // Fallback to default
    });
  }
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
  initializeDefaultSettings,
  getCodUpfrontAmount,
  getPublicSettings
}; 
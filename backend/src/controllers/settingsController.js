const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default welcome box settings
const DEFAULT_SETTINGS = {
  welcomeTitle: 'Welcome to Aturuang',
  welcomeEmoji: '📅',
  welcomeSubtitle: 'Meeting Room Booking System',
  welcomeDescription: 'Book meeting rooms easily with our modern booking system. Select a room, choose your time, and get approval from your admin.',
};

/**
 * Get system settings
 * GET /api/settings
 */
async function getSettings(req, res) {
  try {
    // Fetch all settings from database
    const settings = await prisma.systemSetting.findMany();
    
    // Convert to object
    const settingsObj = settings.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {});
    
    // Merge with defaults
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settingsObj };
    
    return res.json({
      success: true,
      data: mergedSettings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
    });
  }
}

/**
 * Update system settings (superadmin only)
 * PUT /api/settings
 */
async function updateSettings(req, res) {
  try {
    const user = req.user;
    const { welcomeTitle, welcomeEmoji, welcomeSubtitle, welcomeDescription } = req.body;
    
    // Only superadmin can update settings
    if (user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Superadmin access required',
      });
    }
    
    // Validate required fields
    if (!welcomeTitle || !welcomeSubtitle) {
      return res.status(400).json({
        success: false,
        message: 'Title and subtitle are required',
      });
    }
    
    // Update or create settings
    const settingsToUpdate = [
      { key: 'welcomeTitle', value: welcomeTitle },
      { key: 'welcomeEmoji', value: welcomeEmoji || '📅' },
      { key: 'welcomeSubtitle', value: welcomeSubtitle },
      { key: 'welcomeDescription', value: welcomeDescription || '' },
    ];
    
    for (const setting of settingsToUpdate) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { 
          value: JSON.stringify(setting.value),
          updatedBy: user.userId,
        },
        create: {
          key: setting.key,
          value: JSON.stringify(setting.value),
          description: `Welcome box ${setting.key}`,
          updatedBy: user.userId,
        },
      });
    }
    
    return res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        welcomeTitle,
        welcomeEmoji: welcomeEmoji || '📅',
        welcomeSubtitle,
        welcomeDescription: welcomeDescription || '',
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};

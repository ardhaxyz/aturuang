const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Parse CSV content into array of objects
 * @param {string} csvContent - Raw CSV content
 * @returns {Array} Array of objects
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  
  // Handle empty file or file with only headers
  if (lines.length < 2) {
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    results.push(obj);
  }
  
  return results;
}

/**
 * Check if setup is needed
 * GET /api/setup/status
 */
async function checkSetupStatus(req, res) {
  try {
    const userCount = await prisma.user.count();
    
    return res.json({
      success: true,
      data: {
        needsSetup: userCount === 0,
        message: userCount === 0 
          ? 'System needs initial setup. Create a superadmin account.'
          : 'System is already set up.',
      },
    });
  } catch (error) {
    console.error('Check setup status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check setup status',
    });
  }
}

/**
 * Create initial superadmin
 * POST /api/setup
 * Body: { username, password }
 */
async function createSuperadmin(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if any users exist
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Setup has already been completed. Cannot create another superadmin via setup.',
      });
    }

    // Check if username is taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create superadmin
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: 'superadmin',
        isActive: true,
        // No organizationId for superadmin
      },
    });

    console.log('✅ Superadmin created:', user.username);

    return res.status(201).json({
      success: true,
      message: 'Superadmin created successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Create superadmin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create superadmin',
    });
  }
}

/**
 * Import organizations from CSV
 * POST /api/setup/import/organizations
 * Body: multipart/form-data with 'file' field
 */
async function importOrganizations(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    const organizations = parseCSV(csvContent);
    
    const results = {
      success: true,
      imported: 0,
      errors: [],
    };

    for (const orgData of organizations) {
      try {
        // Validate required fields
        if (!orgData.name) {
          results.errors.push(`Row skipped: Missing organization name`);
          continue;
        }

        // Check if organization already exists
        const existingOrg = await prisma.organization.findFirst({
          where: { name: orgData.name },
        });

        if (existingOrg) {
          results.errors.push(`Organization "${orgData.name}" already exists`);
          continue;
        }

        // Create organization
        await prisma.organization.create({
          data: {
            name: orgData.name,
            description: orgData.description || '',
            isActive: true,
          },
        });

        results.imported++;
        console.log(`✅ Organization imported: ${orgData.name}`);
      } catch (error) {
        results.errors.push(`Failed to import "${orgData.name}": ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // If no data rows in CSV, treat as success (nothing to import)
    const hasData = organizations.length > 0;
    
    return res.json({
      success: hasData ? results.imported > 0 : true,
      message: hasData 
        ? `Imported ${results.imported} organizations` 
        : 'No data found in CSV file (only headers)',
      data: results,
    });
  } catch (error) {
    console.error('Import organizations error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to import organizations',
      errors: [error.message],
    });
  }
}

/**
 * Import users from CSV
 * POST /api/setup/import/users
 * Body: multipart/form-data with 'file' field
 */
async function importUsers(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    const users = parseCSV(csvContent);
    
    const results = {
      success: true,
      imported: 0,
      errors: [],
    };

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.username || !userData.password) {
          results.errors.push(`Row skipped: Missing username or password`);
          continue;
        }

        // Validate role
        const validRoles = ['superadmin', 'org_admin', 'user'];
        if (userData.role && !validRoles.includes(userData.role)) {
          results.errors.push(`Invalid role "${userData.role}" for user "${userData.username}"`);
          continue;
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
          where: { username: userData.username },
        });

        if (existingUser) {
          results.errors.push(`User "${userData.username}" already exists`);
          continue;
        }

        // Find organization if specified
        let organizationId = null;
        if (userData.organizationName) {
          const organization = await prisma.organization.findFirst({
            where: { name: userData.organizationName },
          });

          if (!organization) {
            results.errors.push(`Organization "${userData.organizationName}" not found for user "${userData.username}"`);
            continue;
          }

          organizationId = organization.id;
        }

        // Validate superadmin doesn't need organization
        if (userData.role === 'superadmin' && organizationId) {
          results.errors.push(`Superadmin "${userData.username}" should not have an organization`);
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // Create user
        await prisma.user.create({
          data: {
            username: userData.username,
            email: userData.email || null,
            passwordHash,
            role: userData.role || 'user',
            isActive: true,
            organizationId,
          },
        });

        results.imported++;
        console.log(`✅ User imported: ${userData.username}`);
      } catch (error) {
        results.errors.push(`Failed to import "${userData.username}": ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // If no data rows in CSV, treat as success (nothing to import)
    const hasData = users.length > 0;
    
    return res.json({
      success: hasData ? results.imported > 0 : true,
      message: hasData 
        ? `Imported ${results.imported} users` 
        : 'No data found in CSV file (only headers)',
      data: results,
    });
  } catch (error) {
    console.error('Import users error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to import users',
      errors: [error.message],
    });
  }
}

module.exports = {
  checkSetupStatus,
  createSuperadmin,
  importOrganizations,
  importUsers,
};

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * User Controller
 * Manages users with organization-based access
 */

/**
 * Get all users
 * GET /api/users
 */
async function getAllUsers(req, res) {
  try {
    const user = req.user;
    let where = {};

    // Filter by organization
    if (user.role === 'org_admin') {
      where.organizationId = user.organizationId;
    }
    // Superadmin sees all users

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
}

/**
 * Get user by ID
 * GET /api/users/:id
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check access permissions
    if (user.role === 'org_admin') {
      if (targetUser.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    return res.json({
      success: true,
      data: { user: targetUser },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
}

/**
 * Create new user
 * POST /api/users
 */
async function createUser(req, res) {
  try {
    const user = req.user;
    const { username, password, email, role, organizationId } = req.body;

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

    // Check permissions based on role
    let targetOrgId = organizationId;
    let targetRole = role || 'user';

    if (user.role === 'org_admin') {
      // Org admin can only create users in their organization
      targetOrgId = user.organizationId;
      // Org admin can only create regular users, not other admins
      if (targetRole !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Can only create regular users',
        });
      }
    }

    // Superadmin validations
    if (user.role === 'superadmin') {
      // If creating org_admin, must have organization
      if (targetRole === 'org_admin' && !targetOrgId) {
        return res.status(400).json({
          success: false,
          message: 'Organization is required for org_admin',
        });
      }
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

    // Check if email is taken (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken',
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email,
        role: targetRole,
        organizationId: targetOrgId,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: newUser },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
}

/**
 * Update user
 * PUT /api/users/:id
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const { username, email, role, isActive, organizationId } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check permissions
    if (user.role === 'org_admin') {
      // Can only update users in their organization
      if (existingUser.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only update users in your organization',
        });
      }
      // Cannot update role or organization
      if (role || organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Cannot change user role or organization',
        });
      }
    }

    // Check if new username is taken
    if (username && username !== existingUser.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username },
      });

      if (usernameTaken) {
        return res.status(409).json({
          success: false,
          message: 'Username is already taken',
        });
      }
    }

    // Check if new email is taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        role: user.role === 'superadmin' ? role : undefined,
        isActive,
        organizationId: user.role === 'superadmin' ? organizationId : undefined,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
}

/**
 * Delete user (soft delete via isActive)
 * DELETE /api/users/:id
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Cannot delete yourself
    if (id === user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    // Check permissions
    if (user.role === 'org_admin') {
      if (existingUser.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only delete users in your organization',
        });
      }
      // Cannot delete other admins
      if (existingUser.role === 'org_admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete other administrators',
        });
      }
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
}

/**
 * Reset user password
 * POST /api/users/:id/reset-password
 */
async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check permissions
    if (user.role === 'org_admin') {
      if (existingUser.organizationId !== user.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Can only reset passwords for users in your organization',
        });
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
};

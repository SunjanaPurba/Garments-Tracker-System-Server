const User = require('../models/User');

const syncUser = async (req, res) => {
  try {
    console.log('🔄 syncUser called with data:', {
      email: req.body.email,
      receivedRole: req.body.role,
      receivedStatus: req.body.status
    });

    const { email, name, photoURL, role, status } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find existing user
    const existingUser = await User.findOne({ email });
    
    // Determine final role (Priority: Request role > Existing role > Default 'buyer')
    let finalRole = 'buyer';
    if (role && ['admin', 'manager', 'buyer'].includes(role)) {
      finalRole = role;
    } else if (existingUser?.role) {
      finalRole = existingUser.role;
    }

    // Determine final status
    let finalStatus = 'pending';
    if (status && ['pending', 'approved', 'suspended'].includes(status)) {
      finalStatus = status;
    } else if (existingUser?.status) {
      finalStatus = existingUser.status;
    }

    // Auto-approve admin/manager emails
    const specialEmails = ['admin@garmentpro.com', 'manager@garmentpro.com'];
    if (specialEmails.includes(email.toLowerCase())) {
      finalStatus = 'approved';
      console.log('⭐ Auto-approving special email');
    }
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name: name || existingUser?.name || email.split('@')[0],
          photoURL: photoURL || existingUser?.photoURL || '',
          role: finalRole,
          status: finalStatus,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log('✅ User synced successfully:', {
      email: user.email,
      role: user.role,
      status: user.status
    });

    res.status(200).json(user);
  } catch (err) {
    console.error('❌ syncUser error:', err);
    res.status(500).json({ 
      message: 'Server error while syncing user',
      error: err.message 
    });
  }
};

// 🔐 PROTECTED: Get current user
const getMe = async (req, res) => {
  try {
    // req.user শুধু verifyToken থেকে আসা basic info
    // Database থেকে fresh data আনুন
    const freshUser = await User.findById(req.user._id).select('-__v');
    
    if (!freshUser) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    console.log('👤 getMe returning:', {
      email: freshUser.email,
      role: freshUser.role,
      status: freshUser.status
    });

    res.status(200).json(freshUser);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔐 ADMIN: Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔐 ADMIN: Update user role/status
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔐 ADMIN: Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
      ],
    }).select('name email role status photoURL');

    res.status(200).json(users);
  } catch (err) {
    console.error('searchUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  syncUser,
  getMe,
  getAllUsers,
  updateUserRole,
  searchUsers
};
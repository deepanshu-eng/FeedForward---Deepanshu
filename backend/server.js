const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ====================== SCHEMAS ======================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foodName: String,
  category: String,
  quantity: Number,
  unit: String,
  expiryTime: Date,
  pickupAddress: String,
  city: String,
  pickupTime: Date,
  contactNumber: String,
  confirmed: Boolean,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isClaimed: { type: Boolean, default: false },     // ← NEW
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  adminReason: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});
const DonationRequest = mongoose.model('DonationRequest', donationSchema);

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'DonationRequest' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminReason: String,
  createdAt: { type: Date, default: Date.now }
});
const ClaimRequest = mongoose.model('ClaimRequest', claimSchema);

// ====================== MIDDLEWARES ======================
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access only' });
  next();
};

// ====================== SEED ADMIN (run once) ======================
app.get('/api/seed', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@foodshare.com',
        passwordHash: hashed,
        role: 'admin'
      });
      return res.json({ msg: '✅ Admin created → Email: admin@foodshare.com | Password: admin123' });
    }
    res.json({ msg: 'Admin already exists' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ====================== AUTH ROUTES ======================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hashed });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ====================== DONATION ROUTES ======================
app.post('/api/donations', authMiddleware, async (req, res) => {
  try {
    const donation = await DonationRequest.create({ 
      ...req.body, 
      userId: req.user.id,
      isClaimed: false 
    });
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.get('/api/donations', async (req, res) => {
  try {
    const { status, isClaimed } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    // Strong filter for available food
    if (isClaimed === 'false') {
      query.$or = [
        { isClaimed: false },
        { isClaimed: { $exists: false } }
      ];
    } else if (isClaimed === 'true') {
      query.isClaimed = true;
    }

    const donations = await DonationRequest.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Keep your existing /api/donations/my route (for UserDashboard)

// ====================== CLAIM ROUTES ======================

app.post('/api/claims', authMiddleware, async (req, res) => {
  try {
    const { donationId } = req.body;

    const existingClaim = await ClaimRequest.findOne({
      userId: req.user.id,
      donationId,
      status: 'pending'
    });

    if (existingClaim) {
      return res.status(400).json({ msg: 'You already have a pending request for this food item.' });
    }

    const claim = await ClaimRequest.create({
      userId: req.user.id,
      donationId,
      status: 'pending'
    });

    res.json({ success: true, claim });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

// NEW: Get user's own donations (for UserDashboard)
app.get('/api/donations/my', authMiddleware, async (req, res) => {
  try {
    const donations = await DonationRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ====================== ADMIN ROUTES ======================
app.get('/api/admin/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingDonations = await DonationRequest.find({ status: 'pending' })
      .populate('userId', 'name email');
    const pendingClaims = await ClaimRequest.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('donationId');
    res.json({ pendingDonations, pendingClaims });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.patch('/api/admin/donations/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const donation = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date() },
      { new: true }
    );
    res.json(donation);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.patch('/api/admin/donations/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const donation = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', adminReason: reason },
      { new: true }
    );
    res.json(donation);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.patch('/api/admin/claims/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const claim = await ClaimRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (claim && claim.donationId) {
      // 🔥 Mark the food as taken so no one else can see/request it
      await DonationRequest.findByIdAndUpdate(
        claim.donationId,
        { isClaimed: true, claimedBy: claim.userId }
      );
    }

    res.json(claim);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.patch('/api/admin/claims/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log("REJECT BODY:", req.body); // 🔍 ADD THIS

    const updateData = {
      status: 'rejected'
    };

    if (req.body.reason) {
      updateData.adminReason = req.body.reason;
    }

    const claim = await ClaimRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({ msg: 'Claim not found' });
    }

    res.json(claim);

  } catch (err) {
    console.error("REJECT ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({ msg: err.message });
  }
});

app.get('/api/claims/my', authMiddleware, async (req, res) => {
  try {
    const claims = await ClaimRequest.find({ userId: req.user.id })
      .select('donationId status');

    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});


// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
import express from 'express';
import {
  loginAdmin,
  renderDashboard,
  renderUsers,
  renderServices,
  renderEarnings,
  approveHelper,
  rejectHelper, 
  addService,
  removeService, getMessagesJSON
} from '../controllers/adminController.js';
import Helper from '../models/Helper.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/login/admin');
}

// GET: Render signup page
router.get("/signup/admin", (req, res) => {
  res.render("signup-admin", { error: null, name: "", email: "" });
});

// POST: Handle signup
router.post("/signup/admin", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      return res.render("signup-admin", { error: "All fields are required.", name, email });
    }

    if (password !== confirmPassword) {
      return res.render("signup-admin", { error: "Passwords do not match.", name, email });
    }

    // Check for existing admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.render("signup-admin", { error: "Admin already exists.", name, email });
    }

    // Create admin (no password hashing)
    const newAdmin = new Admin({
      name,
      email,
      password, // directly saved (plain text)
    });

    await newAdmin.save();

    // Redirect to login
    res.redirect("/login/admin");
  } catch (err) {
    console.error(err);
    res.render("signup-admin", { error: "Something went wrong. Please try again.", name: "", email: "" });
  }
});


router.get('/login/admin', (req, res) => {
  res.render('login-admin', { error: null, email: null });
});

router.post('/login/admin', loginAdmin);

// routes/admin.js (or wherever your routes are defined)
router.get('/api/admin/messages', isAdmin, getMessagesJSON);

router.get('/admin/dashboard', isAdmin, renderDashboard);

// router.get('/admin/users', isAdmin, renderUsers);
router.get('/admin/users', async (req, res) => {
  try {
      const helpers = await Helper.find(); // Fetch all helpers
      res.render('adminDashboard', { 
          title: 'User Management', 
          content: 'partials/user-management',
          helpers 
      });
  } catch (error) {
      console.error('Error fetching helpers:', error);
      res.status(500).send('Error fetching helpers');
  }
});

// Approve user
router.patch('/admin/users/approve', async (req, res) => {
  try {
      const { helperId } = req.body;
      const helper = await Helper.findByIdAndUpdate(helperId, { approved: true }, { new: true });
      if (helper) {
          res.json({ message: 'User approved successfully' });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ message: 'Failed to approve user' });
  }
});

// Reject user
router.patch('/admin/users/reject', async (req, res) => {
  try {
      const { helperId } = req.body;
      const helper = await Helper.findByIdAndUpdate(helperId, { approved: false }, { new: true });
      if (helper) {
          res.json({ message: 'User rejected successfully' });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ message: 'Failed to reject user' });
  }
});


router.get('/admin/services', isAdmin, renderServices);
router.post('/admin/services/add', isAdmin, addService);
router.delete('/admin/services/:serviceName', isAdmin, removeService);

router.get('/admin/earnings', isAdmin, renderEarnings);

router.post('/admin/users/approve/:id', isAdmin, approveHelper);
router.post('/admin/users/reject/:id', isAdmin, rejectHelper);

export default router;

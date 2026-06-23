import express from "express";  
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import dbPromise from "./data/database.js";
import session from "express-session";
import multer from "multer";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: false,
  saveUninitialized: true
}));

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Store files in 'uploads' folder
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

//Static files 
app.use('/styles', express.static(path.join(__dirname, 'styles'), { 
  setHeaders: (res, filePath) => { 
    if (filePath.endsWith('.css')) { 
      res.setHeader('Content-Type', 'text/css'); 
    }
  }
}));

app.use('/javascript', express.static(path.join(__dirname, 'javascript'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use('/pics', express.static(path.join(__dirname, 'pics')));

// Landing page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/landing.html");
});

// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + "/pages/signup.html");
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + "/pages/login.html");
});

// Signup page for helpers
app.get('/signup/helper', (req, res) => {
  res.render('signup-helper', { error: null, name: null, email: null, mobilenumber: null, aadharnumber: null, gender: null });
});

// Signup validation for helpers
app.post('/signup/helper', async (req, res) => {
  const { name, gender, mobilenumber, aadharnumber, email, password, confirmPassword } = req.body;

  // 1. Check password match first
  if (password !== confirmPassword) {
    return res.render('signup-helper', { 
      error: "Passwords do not match!", 
      name, email, mobilenumber, aadharnumber, gender 
    });
  }

  // 2. Password length check
  if (password.length < 6) {
    return res.render('signup-helper', { 
      error: "Password must be at least 6 characters long!", 
      name, email, mobilenumber, aadharnumber, gender 
    });
  }

  //3. Name should only contain alphabets and spaces
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.render('signup-helper', { 
      error: "Name should contain only alphabets!", 
      name, email, mobilenumber, aadharnumber, gender 
    });
  }

  try {
    const db = await dbPromise;

    // 4. Check for duplicate email, Aadhaar, or phone in both helpers and seekers

    if (!/^\d{10}$/.test(mobilenumber)) {
      return res.render('signup-helper', { 
        error: "Mobile number must be exactly 10 digits!", 
        name, email, mobilenumber, aadharnumber, gender 
      });
    }
    
    if (!/^\d{12}$/.test(aadharnumber)) {
      return res.render('signup-helper', { 
        error: "Aadhaar number must be exactly 12 digits!", 
        name, email, mobilenumber, aadharnumber, gender 
      });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.render('signup-helper', { 
        error: "Invalid email format!", 
        name, email, mobilenumber, aadharnumber, gender 
      });
    }    

    const existingEmail = await db.get(`
      SELECT email FROM helpers WHERE email = ? 
      UNION 
      SELECT email FROM seekers WHERE email = ?`, 
      [email, email]
    );

    const existingMobile = await db.get(`
      SELECT mobilenumber FROM helpers WHERE mobilenumber = ? 
      UNION 
      SELECT mobilenumber FROM seekers WHERE mobilenumber = ?`, 
      [mobilenumber, mobilenumber]
    );

        // Aadhaar check only in helpers table
    const existingAadhar = await db.get(`
      SELECT aadharnumber FROM helpers WHERE aadharnumber = ?`, 
      [aadharnumber]
    );


    // Show relevant error
    if (existingEmail) {
      return res.render('signup-helper', { 
        error: "Email already exists!", 
        name, email, mobilenumber, aadharnumber, gender 
      });
    }

    if (existingMobile) {
      return res.render('signup-helper', { 
        error: "Mobile number already registered!", 
        name, email, mobilenumber, aadharnumber, gender 
      });
    }

    if (existingAadhar) {
      return res.render('signup-helper', { 
        error: "Aadhaar number already registered!", 
        name, email, mobilenumber, aadharnumber, gender 
      });
    }

    // Insert into helpers table
    await db.run(
      `INSERT INTO helpers (name, email, password, mobilenumber, aadharnumber, gender, services, availability, approved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, mobilenumber, aadharnumber, gender, null, null, 0]
    );

    console.log('Helper registered successfully ✅');
    res.redirect('/login/helper'); // Redirect to login

  } catch (error) {
    console.error("Helper Signup Error:", error);

    // Show internal error message on signup page instead of generic redirect
    return res.render('signup-helper', { 
      error: "Please fill all fields!", 
      name, email, mobilenumber, aadharnumber, gender 
    });
  }
});

// Login page for helpers
app.get('/login/helper', (req, res) => {
  res.render('login-helper', { error: null, email: null });
});

// Login validation for helpers
app.post('/login/helper', async (req, res) => {
  const { email, password } = req.body;

  // Basic field validation
  if (!email || !password) {
    return res.render('login-helper', { 
      error: "Please fill in all fields", 
      email 
    });
  }

  try {
    const db = await dbPromise;

    // Check if helper exists and password matches
    const helper = await db.get('SELECT * FROM helpers WHERE email = ? AND password = ?', [email, password]);
    if (!helper) {
      return res.render('login-helper', { 
        error: "Invalid email or password!", 
        email 
      });
    }

    // ✅ Store user info in session after successful login
    req.session.user = {
      id: helper.id,
      name: helper.name,
      email: helper.email,
      mobilenumber: helper.mobilenumber,
      aadharnumber: helper.aadharnumber,
      gender: helper.gender,
      services: helper.services ? helper.services.split(',') : [],
      availability: helper.availability,
      role: "helper"
    };

    console.log('Helper logged in successfully ✅');
    res.redirect('/helper/profile'); // Redirect to helper dashboard

  } catch (error) {
    console.error("Helper Login Error:", error);

    // Render login page with a friendly error message
    return res.render('login-helper', { 
      error: "Something went wrong. Please try again!", 
      email 
    });
  }
});

// Signup page for seekers
app.get('/signup/seeker', (req, res) => {
  res.render('signup-seeker', { error: null, name: null, email: null, mobilenumber: null, address: null });
});

//Signup validation for seekers
app.post('/signup/seeker', async (req, res) => {
  const { name, email, password, confirm_password, mobilenumber, address } = req.body;

  // Password check
  if (password !== confirm_password) {
    return res.render('signup-seeker', { error: "Passwords do not match!", name, email, mobilenumber, address });
  }

  // Password length check
  if (password.length < 6) {
    return res.render('signup-seeker', { error: "Password must be at least 6 characters long!", name, email, mobilenumber, address });
  }

  // Name validation - only alphabets and spaces allowed
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.render('signup-seeker', { error: "Name should contain only alphabets!", name, email, mobilenumber, address });
  }

  // Mobile number check - must be 10 digits
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobilenumber)) {
    return res.render('signup-seeker', { error: "Mobile number must be 10 digits!", name, email, mobilenumber, address });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('signup-seeker', { error: "Invalid email format!", name, email, mobilenumber, address });
  }

  try {
    const db = await dbPromise;

    // Check duplicate email
    const existingEmail = await db.get(`
      SELECT email FROM helpers WHERE email = ? 
      UNION 
      SELECT email FROM seekers WHERE email = ?`, 
      [email, email]
    );

    if (existingEmail) {
      return res.render('signup-seeker', { error: "Email already exists!", name, email, mobilenumber, address });
    }

    // Check duplicate mobile number
    const existingMobile = await db.get(`
      SELECT mobilenumber FROM helpers WHERE mobilenumber = ? 
      UNION 
      SELECT mobilenumber FROM seekers WHERE mobilenumber = ?`, 
      [mobilenumber, mobilenumber]
    );

    if (existingMobile) {
      return res.render('signup-seeker', { error: "Mobile number already registered!", name, email, mobilenumber, address });
    }

    // Insert into seekers table
    await db.run(
      `INSERT INTO seekers (name, email, password, mobilenumber, address) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, mobilenumber, address]
    );

    console.log('Seeker registered successfully ✅');
    res.redirect('/login/seeker'); // Redirect to login page

  } catch (error) {
    console.error("Seeker Signup Error:", error);

    // Show generic error message on signup page
    return res.render('signup-seeker', { error: "Something went wrong! Please try again.", name, email, mobilenumber, address });
  }
});

// Login page for seekers
app.get('/login/seeker', (req, res) => {
  res.render('login-seeker', { error: null, email: null });
});

// Login validation for seekers
app.post('/login/seeker', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login-seeker', { error: "Please fill in all fields", email });
  }

  try {
    const db = await dbPromise;

    // Check if seeker exists and password matches
    const seeker = await db.get('SELECT * FROM seekers WHERE email = ? AND password = ?', [email, password]);
    if (!seeker) {
      return res.render('login-seeker', { error: "Invalid email or password!", email });
    }

    // ✅ Store user info in session after successful login
    req.session.user = {
      id: seeker.id,
      name: seeker.name,
      email: seeker.email,
      mobilenumber: seeker.mobilenumber,
      address: seeker.address,
      role: "seeker"
    };

    console.log('Seeker logged in successfully ✅');
    res.redirect('/home'); // Redirect to seeker home page

  } catch (error) {
    console.error("Seeker Login Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

//HELPER DASHBOARD

// Profile page for helpers
app.get('/helper/profile', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login/helper');
  }

  try {
    const db = await dbPromise;

    // Get latest user data from the database
    const user = await db.get('SELECT * FROM helpers WHERE id = ?', [req.session.user.id]);

    if (!user) {
      req.session.destroy(); // Destroy session if user doesn't exist
      return res.render('login-helper', { error: "Session expired. Please log in again." });
    }

    // Ensure services are converted back to an array
    user.services = user.services ? user.services.split(', ') : [];

    // Render the profile page with user data
    res.render('helperDashboard', { 
      title: 'Profile Management',
      content: 'partials/profile',
      userData: user // Pass session data to the EJS file
    });

  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// POST for updating helper profile
app.post('/helper/profile', upload.single('certifications'), async (req, res) => {
  if (!req.session.user) {
      return res.redirect('/login/helper');
  }

  console.log("Received Profile Update Request:", req.body);

  const { name, mobilenumber, availability, services } = req.body;
  const certifications = req.file ? req.file.filename : req.session.user.certifications;

  let formattedServices = services;
  if (Array.isArray(services)) {
      formattedServices = services.join(', ');
  }

  try {
      const db = await dbPromise;

      // Ensure user exists before updating
      const userExists = await db.get('SELECT id FROM helpers WHERE id = ?', [req.session.user.id]);
      if (!userExists) {
          console.log("User not found in DB.");
          return res.status(404).json({ message: "User not found" });
      }

      // Update database with certifications file path
      await db.run(
          'UPDATE helpers SET name = ?, mobilenumber = ?, availability = ?, services = ?, certifications = ? WHERE id = ?',
          [name, mobilenumber, availability, formattedServices, certifications, req.session.user.id]
      );

      // Update session data
      req.session.user = { 
          ...req.session.user, 
          name, 
          mobilenumber, 
          availability, 
          services: formattedServices,
          certifications
      };

      console.log("Updated session:", req.session.user);
      res.json({ message: "Profile updated successfully!", certifications });

  } catch (error) {
      console.error("Profile Update Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get Service Requests Assigned to the Logged-in Helper
app.get('/helper/requests', async (req, res) => {
  if (!req.session.user) {
      return res.redirect('/login/helper');
  }

  try {
      const db = await dbPromise;
      const helperId = req.session.user.id;
      console.log(helperId)

      // Fetch only the requests assigned to this helper
      const requests = await db.all(
          'SELECT * FROM service_requests WHERE helper_id = ?',
          [helperId]
      );

      res.render('helperDashboard', {
          title: 'Service Requests',
          content: 'partials/requests',
          userData: req.session.user,
          requests // Send requests data to the EJS file
      });

  } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).send("Internal Server Error");
  }
});

//POST after request updation
app.post('/helper/requests/update', async (req, res) => {
  if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { requestId, status } = req.body;

  try {
      const db = await dbPromise;

      // Update status in the database
      await db.run(
          'UPDATE service_requests SET status = ? WHERE id = ? AND helper_id = ?',
          [status, requestId, req.session.user.id]
      );

      res.json({ success: true });

  } catch (error) {
      console.error("Error updating request status:", error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

//Schedule page
app.get('/helper/schedule', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const db = await dbPromise;

  try {
    const requests = await db.all(`
      SELECT date, time 
      FROM service_requests 
      WHERE helper_id = ? AND status = 'Accepted'
    `, [req.session.user.id]);

    // Combine date and time into ISO datetime strings
    const blockedDates = requests.map(req => {
      const dateTimeStr = `${req.date} ${req.time}`;
      const isoDate = new Date(dateTimeStr).toISOString();
      return isoDate;
    });

    res.render('helperDashboard', { 
      title: 'Schedule', 
      content: 'partials/schedule',
      userData: req.session.user,
      blockedDates
    });

  } catch (error) {
    console.error('Error fetching schedule data:', error);
    res.render('helperDashboard', { 
      title: 'Schedule', 
      content: 'partials/schedule',
      userData: req.session.user,
      blockedDates: []
    });
  }
});

//Earnings page
app.get('/helper/earnings', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('helperDashboard', { 
    title: 'Earnings', 
    content: 'partials/earnings',
    userData: req.session.user
  });
});

//Feedback 
app.get('/helper/feedback', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('helperDashboard', { 
    title: 'Feedback', 
    content: 'partials/feedback',
    userData: req.session.user
  });
});

//SEEKER DASHBOARD

//Home page
app.get('/home', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'seeker') {
    return res.redirect('/login/seeker');
  }
  
  res.render('home', { user: req.session.user });
});

// About page
app.get('/about', (req, res) => {
  res.sendFile(__dirname + "/pages/about.html");
});

// Terms page
app.get('/terms', (req, res) => {
  res.sendFile(__dirname + "/pages/terms.html");
});

// Contact page
app.get('/contact', (req, res) => {
  res.sendFile(__dirname + "/pages/contact.html");
});

// Profile page
// app.get('/profile', (req, res) => {
//   res.sendFile(__dirname + "/pages/seeker_profile.html");
// });

function isSeekerLoggedIn(req, res, next) {
  if (req.session.user && req.session.user.role === 'seeker') {
    return next();
  }
  return res.redirect('/login/seeker'); // Or show an error message
}

app.get('/profile', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'seeker') {
    return res.redirect('/login/seeker');
  }
  res.render('seeker_profile', { seeker: req.session.user });
});

// Cart/Bookings page route
app.get('/cart', (req, res) => {
  // Example data - in a real app, you would fetch this from your database
  const bookings = [
      {
          id: 1,
          helperName: "Emma Johnson",
          serviceType: "Home Cleaning",
          date: "March 20, 2025",
          time: "10:00 AM - 1:00 PM",
          price: 85.00,
          status: "Accepted",
          paid: false
      },
      {
          id: 2,
          helperName: "Michael Chen",
          serviceType: "Garden Maintenance",
          date: "March 22, 2025",
          time: "2:00 PM - 4:00 PM",
          price: 60.00,
          status: "Pending",
          paid: false
      },
      {
          id: 3,
          helperName: "Sarah Williams",
          serviceType: "Tech Support",
          date: "March 19, 2025",
          time: "11:30 AM - 12:30 PM",
          price: 45.00,
          status: "Rejected",
          paid: false
      },
      {
          id: 4,
          helperName: "David Miller",
          serviceType: "Plumbing Repair",
          date: "March 21, 2025",
          time: "9:00 AM - 11:00 AM",
          price: 120.00,
          status: "Accepted",
          paid: true
      }
  ];
  
  res.render('cart', { bookings });
});

app.post('/update-seeker-profile', isSeekerLoggedIn, async (req, res) => {
  const { name, mobilenumber, address } = req.body;
  const seekerId = req.session.user.id; // Now guaranteed to exist!

  try {
    const db = await dbPromise;
    await db.run('UPDATE seekers SET name = ?, mobilenumber = ?, address = ? WHERE id = ?', 
      [name, mobilenumber, address, seekerId]);

    // Update session details too!
    req.session.user.name = name;
    req.session.user.mobilenumber = mobilenumber;
    req.session.user.address = address;

    res.redirect('/profile');
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Contact page
app.get('/prevbookings', (req, res) => {
  res.sendFile(__dirname + "/pages/prevbookings.html");
});


// Route: Default Search Page
app.get('/search', async (req, res) => {
  const db = await dbPromise;
  const services = await db.all('SELECT * FROM services');
  res.render('search', {
    helpers: services,
    availabilityFilter: 'all',
    typeFilter: 'all',
    genderFilter: 'all',
    maxPrice: 1500
  });
});

// Route: Filter Services
app.get('/search/filter', async (req, res) => {
  const db = await dbPromise;
  const { maxPrice = 1500, availability = 'all', type = 'all', gender = 'all' } = req.query;

  let query = 'SELECT * FROM services WHERE 1=1';
  const params = [];

  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(maxPrice);
  }
  if (availability && availability !== 'all') {
    query += ' AND availability = ?';
    params.push(availability);
  }
  if (type && type !== 'all') {
    query += ' AND type = ?';
    params.push(type);
  }
  if (gender && gender !== 'all') {
    query += ' AND gender = ?';
    params.push(gender);
  }

  const services = await db.all(query, params);
  res.render('search', {
    helpers: services,
    availabilityFilter: availability,
    typeFilter: type,
    genderFilter: gender,
    maxPrice
  });
});

// Route: Search Services by Name
app.get('/search/search', async (req, res) => {
  const db = await dbPromise;
  const { term } = req.query;
  const services = await db.all('SELECT * FROM services WHERE name LIKE ?', [`%${term}%`]);
  res.render('search', {
    helpers: services,
    availabilityFilter: 'all',
    typeFilter: 'all',
    genderFilter: 'all',
    maxPrice: 1500
  });
});

// Route: Filter Services (POST)
app.post('/search', async (req, res) => {
  const db = await dbPromise;
  const { priceRange = 1500, availabilityFilter = 'all', serviceTypeFilter = 'all', genderFilter = 'all', searchQuery = '' } = req.body;

  let query = 'SELECT * FROM services WHERE 1=1';
  const params = [];

  // Apply search query filter (if any)
  if (searchQuery.trim() !== '') {
    query += ' AND name LIKE ?';
    params.push(`%${searchQuery}%`);
  }

  // Apply price filter
  if (priceRange) {
    query += ' AND price <= ?';
    params.push(priceRange);
  }

  // Apply availability filter
  if (availabilityFilter !== 'all') {
    query += ' AND availability = ?';
    params.push(availabilityFilter);
  }

  // Apply service type filter
  if (serviceTypeFilter !== 'all') {
    query += ' AND type = ?';
    params.push(serviceTypeFilter);
  }

  // Apply gender filter
  if (genderFilter !== 'all') {
    query += ' AND gender = ?';
    params.push(genderFilter);
  }

  // Execute query
  try {
    const services = await db.all(query, params);
    res.render('search', {
      helpers: services,
      availabilityFilter: availabilityFilter,
      typeFilter: serviceTypeFilter,
      genderFilter: genderFilter,
      priceRange,
      searchQuery
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving services.");
  }
});

//Booking form
app.get('/booking', async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seeker") {
    return res.redirect('/login/seeker');
  }

  const helperId = req.query.helperId;

  try {
    const db = await dbPromise;
    const helper = await db.get('SELECT * FROM helpers WHERE id = ?', [helperId]);

    if (!helper) {
      return res.status(404).send("Helper not found.");
    }

    res.render('booking_form', { helper });
  } catch (error) {
    console.error("Error loading booking form:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Booking submit
app.post('/booking', async (req, res) => {
  const { customerName, serviceType, helperName, date, time, address } = req.body;

  // if (!customerName || !serviceType || !helperName || !date || !time || !address) {
  //   return res.status(400).send("Missing booking information!");
  // }

  // Backend Date Validation
  const today = new Date();
  const selectedDate = new Date(date);

  if (selectedDate <= today.setHours(0, 0, 0, 0)) {
    return res.status(400).send("Please select a valid date.");
  }

  try {
    const db = await dbPromise;
    await db.run(
      `INSERT INTO bookings (customer_name, service_type, helper_name, date, time, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [customerName, serviceType, helperName, date, time, address]
    );
    res.redirect('/cart'); // Redirect to cart
  } catch (err) {
    console.error('Error submitting booking:', err);
    res.status(500).send("Error submitting booking!");
  }
});

// Contact page
app.get('/payment', (req, res) => {
  res.sendFile(__dirname + "/pages/payment.html");
});

// Contact page
app.get('/review', (req, res) => {
  res.sendFile(__dirname + "/pages/review.html");
});

// Admin Session & Dashboard Routes

// Admin Login Page
app.get('/login/admin', (req, res) => {
  res.render('login-admin', { error: null, email: null });
});

// Admin Login Validation
app.post('/login/admin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login-admin', { 
      error: "Please fill in all fields", 
      email
    });
  }

  try {
    const db = await dbPromise;

    // Check if admin exists
    const admin = await db.get('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password]);
    if (!admin) {
      return res.render('login-admin', { 
        error: "Invalid email or password!", 
        email
      });
    }

    // ✅ Store admin info in session after successful login
    req.session.user = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "admin"
    };

    console.log('Admin logged in successfully ✅');
    res.redirect('/admin/dashboard');

  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.render('login-admin', { 
      error: "Something went wrong. Please try again!", 
      email
    });
  }
});

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  } else {
    return res.redirect('/login/admin');
  }
}

// Admin Dashboard Routes
app.get('/admin/dashboard', isAdmin, (req, res) => {
  res.render('adminDashboard', { title: 'Dashboard', content: 'partials/user-contact' });
});

app.get('/admin/users', isAdmin, (req, res) => {
  res.render('adminDashboard', { title: 'User Management', content: 'partials/user-management' });
});

app.get('/admin/services', isAdmin, (req, res) => {
  const services = ["Cleaning", "Repairs", "Painting", "Cooking", "Maintenance", "Plumbing", "Electrical"];
  res.render('adminDashboard', { title: 'Service Management', content: 'partials/service-overview', services });
});

app.get('/admin/earnings', isAdmin, (req, res) => {
  const earnings = {
    totalEarnings: 50000,
    monthlyEarnings: [
      { month: 'Jan', amount: 12000 },
      { month: 'Feb', amount: 15000 },
      { month: 'Mar', amount: 23000 },
    ]
  };
  res.render('adminDashboard', { title: 'Earnings Overview', content: 'partials/earnings-overview', ...earnings });
});

// Approve/Reject Users
app.post('/admin/users/approve/:id', isAdmin, async (req, res) => {
  const db = await dbPromise;
  await db.run('UPDATE helpers SET approved = 1 WHERE id = ?', [req.params.id]);
  res.sendStatus(200);
});

app.post('/admin/users/reject/:id', isAdmin, async (req, res) => {
  const db = await dbPromise;
  await db.run('DELETE FROM helpers WHERE id = ?', [req.params.id]);
  res.sendStatus(200);
});

// Add/Remove Services
app.post('/admin/services', isAdmin, (req, res) => {
  services.push(req.body.service);
  res.sendStatus(200);
});

// Server listening
app.listen(3001, () => {
  console.log(`Server running at http://localhost:${port}`);
});

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const RESET_DB_ON_START = false; // Change to false when you're ready for production

// Initialize the database
const dbPromise = open({
  filename: './data/database.sqlite',
  driver: sqlite3.Database
});

(async () => {
  const db = await dbPromise;
  // await db.exec('PRAGMA foreign_keys = ON;'); // Enforce FK constraints

  if (RESET_DB_ON_START) {
    console.log('⚠️ Resetting database...');
    await db.exec(`DROP TABLE IF EXISTS service_requests`); // Drop child first
    await db.exec(`DROP TABLE IF EXISTS helpers`);          // Drop parent
    await db.exec(`DROP TABLE IF EXISTS seekers`);          // Drop parent
    await db.exec(`DROP TABLE IF EXISTS services`);         // Unrelated, can drop anytime
    await db.exec(`DROP TABLE IF EXISTS bookings`); 

  }

  // Create Helpers Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS helpers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      mobilenumber TEXT NOT NULL,
      aadharnumber TEXT NOT NULL,
      gender TEXT NOT NULL,
      services TEXT,
      availability TEXT,
      certifications TEXT,
      approved INTEGER DEFAULT 0
    )
  `);

  // Create Seekers Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS seekers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      mobilenumber TEXT NOT NULL,
      address TEXT NOT NULL
    )
  `);

  // Create Service Requests Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      helper_id INTEGER NOT NULL,
      seeker_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (helper_id) REFERENCES helpers(id) ON DELETE CASCADE,
      FOREIGN KEY (seeker_id) REFERENCES seekers(id) ON DELETE CASCADE
    )
  `);

  // Create Services Table
await db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    helper TEXT,
    price REAL NOT NULL,
    availability TEXT NOT NULL,
    type TEXT NOT NULL,
    gender TEXT NOT NULL,
    rating REAL NOT NULL,
    image TEXT NOT NULL
  )
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    helper_name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    address TEXT NOT NULL
  )
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);



  // Seed fake service requests data
  const existingRequests = await db.get("SELECT COUNT(*) AS count FROM service_requests");
if (existingRequests.count === 0) {
  console.log('🌟 Seeding service requests with fake data...');
  await db.exec(`
    INSERT INTO service_requests (helper_id, seeker_id, customer_name, service_type, date, time, address, status) VALUES
    (1, 1, 'Ritu Varma', 'Cleaning', '2025-03-10', '10:00 AM', 'Hyderabad', 'Pending'),
    (2, 2, 'Amit Sharma', 'Plumbing', '2025-03-11', '02:30 PM', 'Mumbai', 'Accepted'),
    (3, 3, 'Meera Iyer', 'Electrical', '2025-03-12', '04:15 PM', 'Bangalore', 'Pending'),
    (4, 4, 'Rahul Nair', 'Painting', '2025-03-13', '09:00 AM', 'Chennai', 'Rejected'),
    (5, 1, 'Ravi Teja', 'Repairs', '2025-03-14', '12:45 PM', 'Delhi', 'Pending'), -- For helper_id 5
    (5, 2, 'Kiran Rao', 'Cleaning', '2025-03-15', '03:00 PM', 'Hyderabad', 'Accepted')
  `);
}


  // ✅ Seed fake services data
  const existingServices = await db.get("SELECT COUNT(*) AS count FROM services");
  if (existingServices.count === 0) {
    console.log('🌟 Seeding services table with sample data...');
    await db.exec(`
      INSERT INTO services (name, helper, price, availability, type, gender, rating, image) VALUES
      ('Plumbing', 'Priya', 500, 'available', 'household', 'male', 4.5, 'plumbing.jpg'),
      ('Electrician','Shekar', 700, 'available', 'electricity', 'male', 4.2, 'electrician.jpg'),
      ('Personal Trainer', 'Varun', 1000, 'not available', 'personal', 'female', 4.8, 'trainer.jpg'),
      ('Pet Grooming', 'Tej',300, 'available', 'pets', 'female', 4.7, 'pet_grooming.jpg'),
      ('Carpentry','Nani', 800, 'available', 'household', 'male', 4.4, 'carpentry.jpg'),
      ('Gardening','Jaan', 450, 'not available', 'household', 'female', 4.6, 'gardening.jpg')
    `);
  }

    // ✅ Seed fake helpers data
  const existingHelpers = await db.get("SELECT COUNT(*) AS count FROM helpers");
  if (existingHelpers.count === 0) {
    console.log('🌟 Seeding helpers table with sample data...');
    await db.exec(`
      INSERT INTO helpers (name, email, password, mobilenumber, aadharnumber, gender, services, availability, certifications, approved) VALUES
      ('Ravi Kumar', 'ravi@example.com', 'password123', '9876543210', '123456789012', 'male', 'Plumbing,Electrician', 'available', 'certificate1.pdf', 1),
      ('Priya Sharma', 'priya@example.com', 'password123', '8765432109', '234567890123', 'female', 'Personal Trainer', 'not available', 'certificate2.pdf', 1),
      ('Anil Mehta', 'anil@example.com', 'password123', '7654321098', '345678901234', 'male', 'Carpentry', 'available', 'certificate3.pdf', 0),
      ('Sunita Rao', 'sunita@example.com', 'password123', '6543210987', '456789012345', 'female', 'Gardening,Pet Grooming', 'available', 'certificate4.pdf', 1)
    `);
  }

  // Seed seekers (add this)
const existingSeekers = await db.get("SELECT COUNT(*) AS count FROM seekers");
if (existingSeekers.count === 0) {
  console.log('🌟 Seeding seekers table with sample data...');
  await db.exec(`
    INSERT INTO seekers (name, email, password, mobilenumber, address) VALUES
    ('Asha Verma', 'asha@example.com', 'password123', '9123456780', 'Mumbai'),
    ('Rohan Das', 'rohan@example.com', 'password123', '9234567890', 'Delhi'),
    ('Neha Pillai', 'neha@example.com', 'password123', '9345678901', 'Bangalore'),
    ('Karan Patel', 'karan@example.com', 'password123', '9456789012', 'Hyderabad'),
    ('Ishita Gupta', 'ishita@example.com', 'password123', '9567890123', 'Chennai')
  `);
}

// Insert default admin if not exists
const existingAdmin = await db.get('SELECT * FROM admin WHERE email = ?', ['admin@servicesphere.com']);

if (!existingAdmin) {
  await db.run(`
    INSERT INTO admin (name, email, password)
    VALUES (?, ?, ?)
  `, ['Admin', 'admin@gmail.com', 'admin123']);  // You can change email/password here as needed!

  // console.log('✅ Default admin inserted: admin@servicesphere.com / admin123');
} else {
  console.log('⚠️ Default admin already exists');
}


  console.log('Database initialized ✅');
})();

export default dbPromise;

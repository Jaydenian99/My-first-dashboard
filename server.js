const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.static('public'));
app.use(express.json());

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Helper function to read JSON file
function readJsonFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return callback(null, []);
      }
      return callback(err);
    }
    try {
      callback(null, JSON.parse(data));
    } catch (e) {
      callback(e);
    }
  });
}

// Helper function to write JSON file
function writeJsonFile(filePath, data, callback) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}

// Helper to get user's data file
function getUserDataFile(username) {
  return path.join(__dirname, `data_${username}.json`);
}

// Helper to get user's salary file
function getUserSalaryFile(username) {
  return path.join(__dirname, `salary_${username}.json`);
}

// Helper to read user-specific data
function readUserData(username, callback) {
  const userDataFile = getUserDataFile(username);
  readJsonFile(userDataFile, callback);
}

// Helper to write user-specific data
function writeUserData(username, data, callback) {
  const userDataFile = getUserDataFile(username);
  writeJsonFile(userDataFile, data, callback);
}

// Helper to read user salary
function readUserSalary(username, callback) {
  const userSalaryFile = getUserSalaryFile(username);
  readJsonFile(userSalaryFile, callback);
}

// Helper to write user salary
function writeUserSalary(username, salary, callback) {
  const userSalaryFile = getUserSalaryFile(username);
  writeJsonFile(userSalaryFile, salary, callback);
}

// --- AUTHENTICATION ROUTES ---

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  readJsonFile(USERS_FILE, async (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    writeJsonFile(USERS_FILE, users, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      // Initialize user's data file with empty array
      writeUserData(username, [], (err) => {
        if (err) {
          console.error('Error initializing user data:', err);
        }
      });

      // Generate JWT token
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ success: true, token, username });
    });
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  readJsonFile(USERS_FILE, async (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, username });
  });
});

// Verify token endpoint
app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ success: true, username: req.user.username });
});

// --- DATA ROUTES (Protected) ---

// GET all data for authenticated user
app.get('/api/data', authenticateToken, (req, res) => {
  const username = req.user.username;
  readUserData(username, (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json(data);
  });
});

// ADD a new cost (Protected)
app.post('/api/add', authenticateToken, (req, res) => {
  const username = req.user.username;
  readUserData(username, (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    
    const newEntry = {
      id: Date.now(),
      Category: req.body.category,
      Amount: parseFloat(req.body.amount)
    };

    data.push(newEntry);

    writeUserData(username, data, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.json({ success: true, newEntry: newEntry });
    });
  });
});

// DELETE a cost (Protected)
app.post('/api/delete', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { id } = req.body;

  readUserData(username, (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const newData = data.filter(item => item.id !== id);

    if (data.length === newData.length) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    writeUserData(username, newData, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.json({ success: true, message: 'Item deleted' });
    });
  });
});

// UPDATE a cost (Protected)
app.post('/api/update', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { id, category, amount } = req.body;

  if (!id || category === undefined || amount === undefined) {
    return res.status(400).json({ success: false, message: 'ID, category, and amount are required' });
  }

  readUserData(username, (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const itemIndex = data.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update the item
    data[itemIndex].Category = category;
    data[itemIndex].Amount = parseFloat(amount);

    writeUserData(username, data, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.json({ success: true, updatedItem: data[itemIndex] });
    });
  });
});

// GET user salary (Protected)
app.get('/api/salary', authenticateToken, (req, res) => {
  const username = req.user.username;
  readUserSalary(username, (err, salary) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    // Return default values if no salary is set
    if (!salary || Object.keys(salary).length === 0) {
      return res.json({ 
        success: true, 
        salary: { 
          beforeTax: 0, 
          afterTax: 0 
        } 
      });
    }
    res.json({ success: true, salary });
  });
});

// POST/UPDATE user salary (Protected)
app.post('/api/salary', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { beforeTax, afterTax } = req.body;

  if (beforeTax === undefined || afterTax === undefined) {
    return res.status(400).json({ success: false, message: 'Both beforeTax and afterTax are required' });
  }

  const salary = {
    beforeTax: parseFloat(beforeTax),
    afterTax: parseFloat(afterTax),
    updatedAt: new Date().toISOString()
  };

  writeUserSalary(username, salary, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, salary });
  });
});

app.listen(port, () => {
  console.log(`Dashboard app listening at http://localhost:${port}`);
});
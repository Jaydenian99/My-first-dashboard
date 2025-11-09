const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const USERS_FILE = path.join(__dirname, 'users.json');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  MAIL_FROM
} = process.env;

const transporter = (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS)
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })
  : nodemailer.createTransport({ jsonTransport: true });

const MAIL_SENDER = MAIL_FROM || 'no-reply@my-first-dashboard.local';

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

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function isValidEmail(email = '') {
  const normalized = normalizeEmail(email);
  // Simple RFC 5322 compliant pattern (lightweight)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalized);
}

async function sendPasswordResetEmail(to, resetUrl) {
  const message = {
    from: MAIL_SENDER,
    to,
    subject: 'Password Reset Instructions',
    text: `We received a request to reset your password. Use the link below to choose a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Click here to choose a new password</a></p><p>If you did not request this, you can safely ignore this email.</p>`
  };

  const info = await transporter.sendMail(message);

  if (info.messageId) {
    console.log(`Password reset email queued for ${to}: ${info.messageId}`);
  } else {
    console.log(`Password reset email output for ${to}:`, info);
  }
}

// --- AUTHENTICATION ROUTES ---

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = normalizeEmail(email);

  readJsonFile(USERS_FILE, async (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const usernameExists = users.some(u => u.username === username);
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const emailExists = users.some(u => u.email && normalizeEmail(u.email) === normalizedEmail);
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    writeJsonFile(USERS_FILE, users, (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      writeUserData(username, [], (dataErr) => {
        if (dataErr) {
          console.error('Error initializing user data:', dataErr);
        }
      });

      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ success: true, token, username, email: normalizedEmail });
    });
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const identifier = (req.body.identifier || req.body.username || '').trim();
  const password = req.body.password;
  const providedEmail = req.body.email;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Identifier and password are required' });
  }

  readJsonFile(USERS_FILE, async (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const normalizedIdentifier = normalizeEmail(identifier);
    const loweredIdentifier = identifier.toLowerCase();
    const user = users.find(u => 
      u.username === identifier ||
      (typeof u.username === 'string' && u.username.toLowerCase() === loweredIdentifier) ||
      (u.email && normalizeEmail(u.email) === normalizedIdentifier)
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const respondWithSuccess = () => {
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, username: user.username, email: user.email });
    };

    if (!user.email) {
      if (!providedEmail) {
        return res.status(409).json({
          success: false,
          requiresEmail: true,
          message: 'An email address is required to secure your account. Please provide one to continue.'
        });
      }

      if (!isValidEmail(providedEmail)) {
        return res.status(400).json({ success: false, message: 'A valid email address is required' });
      }

      const normalizedEmail = normalizeEmail(providedEmail);
      const emailInUse = users.some(u => 
        u !== user && u.email && normalizeEmail(u.email) === normalizedEmail
      );

      if (emailInUse) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      user.email = normalizedEmail;
      user.emailUpdatedAt = new Date().toISOString();

      return writeJsonFile(USERS_FILE, users, (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ success: false, message: 'Server error' });
        }
        respondWithSuccess();
      });
    }

    respondWithSuccess();
  });
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required' });
  }

  const normalizedEmail = normalizeEmail(email);

  readJsonFile(USERS_FILE, async (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const user = users.find(u => u.email && normalizeEmail(u.email) === normalizedEmail);

    if (!user) {
      // Respond with success to avoid leaking which emails exist
      return res.json({ success: true, message: 'If that email is registered, we have sent a reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetExpiry;
    user.passwordResetRequestedAt = new Date().toISOString();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

    writeJsonFile(USERS_FILE, users, async (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
        res.json({ success: true, message: 'If that email is registered, we have sent a reset link.' });
      } catch (emailErr) {
        console.error('Error sending password reset email:', emailErr);
        res.status(500).json({ success: false, message: 'Unable to send reset email. Please try again later.' });
      }
    });
  });
});

app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  readJsonFile(USERS_FILE, async (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = users.find(u =>
      u.passwordResetToken === hashedToken &&
      u.passwordResetExpires &&
      u.passwordResetExpires > Date.now()
    );

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date().toISOString();
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    delete user.passwordResetRequestedAt;

    writeJsonFile(USERS_FILE, users, (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      res.json({ success: true, message: 'Password has been reset successfully' });
    });
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

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Dashboard app listening at http://localhost:${port}`);
});
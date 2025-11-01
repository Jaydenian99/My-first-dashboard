const express = require('express');
const fs = require('fs'); // We still need the File System
const path = require('path'); // A built-in Node.js module

const app = express();
const port = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.static('public'));
app.use(express.json());

// Helper function to read the JSON file
function readData(callback) {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    try {
      callback(null, JSON.parse(data));
    } catch (e) {
      callback(e);
    }
  });
}

// Helper function to write to the JSON file
function writeData(data, callback) {
  fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    callback(null);
  });
}

// --- ROUTE 1: GETS ALL DATA (Updated for JSON) ---
app.get('/api/data', (req, res) => {
  readData((err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json(data);
  });
});

// --- ROUTE 2: ADDS A NEW COST (Updated for JSON) ---
app.post('/api/add', (req, res) => {
  readData((err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    
    const newEntry = {
      id: Date.now(), // Create a unique ID based on the current time
      Category: req.body.category,
      Amount: parseFloat(req.body.amount)
    };

    data.push(newEntry); // Add the new entry to the array

    writeData(data, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.json({ success: true, newEntry: newEntry });
    });
  });
});

// --- ROUTE 3: DELETES A COST (The New Route!) ---
app.post('/api/delete', (req, res) => {
  const { id } = req.body; // Get the ID from the request

  readData((err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    // Create a new array *without* the item we want to delete
    const newData = data.filter(item => item.id !== id);

    if (data.length === newData.length) {
      // Nothing was filtered, so the ID wasn't found
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    writeData(newData, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.json({ success: true, message: 'Item deleted' });
    });
  });
});

app.listen(port, () => {
  console.log(`Dashboard app listening at http://localhost:${port}`);
});
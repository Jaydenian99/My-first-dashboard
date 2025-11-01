const express = require('express');
const { parse } = require('csv-parse'); // Added
const fs = require('fs'); // Added - File System module

const app = express();
const port = process.env.PORT || 3000; // Use port for Render

app.use(express.static('public'));
app.use(express.json()); // Lets server read JSON from browser

// --- ROUTE 1: GETS ALL DATA FOR THE CHART ---
// This was the missing part
app.get('/api/data', (req, res) => {
  const results = [];
  fs.createReadStream('data.csv')
    .pipe(parse({ columns: true, cast: true, skip_empty_lines: true })) // 'columns: true' uses the first row as headers
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      res.json(results); // Send the data as JSON
    });
});
// --- END OF GET ROUTE ---


// --- ROUTE 2: ADDS A NEW COST ---
// Your new POST route is perfect
app.post('/api/add', (req, res) => {
  // Get the category and amount from the browser's request
  const { category, amount } = req.body;

  // Make sure the data exists
  if (!category || !amount) {
    return res.status(400).json({ success: false, message: 'Missing data' });
  }

  // Format the data as a new line for the CSV file
  // \n ensures it goes on a new line
  const csvLine = `\n"${category}","${amount}"`;

  // Append the new line to your data.csv file
  fs.appendFile('data.csv', csvLine, (err) => {
    if (err) {
      console.error('Failed to save data:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    // Send a success message back to the browser
    res.json({ success: true, newEntry: { Category: category, Amount: amount } });
  });
});
// --- END OF POST ROUTE ---

app.listen(port, () => {
  console.log(`Dashboard app listening at http://localhost:${port}`);
});
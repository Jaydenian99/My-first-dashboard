const express = require('express');
const { parse } = require('csv-parse'); // Added
const fs = require('fs'); // Added - File System module

const app = express();
const port = 3000;

app.use(express.static('public'));

// THIS IS THE NEW PART THAT FIXES THE 404 ERROR
app.get('/api/data', (req, res) => {
  const results = [];
  fs.createReadStream('data.csv')
    .pipe(parse({ columns: true, cast: true })) // 'columns: true' uses the first row as headers
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      res.json(results); // Send the data as JSON
    });
});

app.listen(port, () => {
  console.log(`Dashboard app listening at http://localhost:${port}`);
});
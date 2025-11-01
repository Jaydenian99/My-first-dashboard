console.log("app.js file has loaded!");

// --- Dark Mode Toggle ---
// This code runs as soon as the HTML is parsed
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('darkModeToggle');
  const body = document.querySelector('body');

  toggleButton.addEventListener('click', () => {
    // This one line adds the .dark-mode class if it's not there,
    // and removes it if it is.
    body.classList.toggle('dark-mode');
  });
});
// --- End of Dark Mode Toggle ---


let myChart = null; // <-- MOVED chart variable here to make it global

// Updated this to load the chart AND set up the form
window.addEventListener('load', () => {
  setupDashboard();
  setupFormListener(); // <-- ADDED this call
});

async function setupDashboard() {
  // ADDED this check to destroy the old chart before drawing a new one
  if (myChart) {
    myChart.destroy();
  }

  // 1. Get the data from our API
  const data = await fetchData();
  
  // 2. Prepare the data for the chart
  const labels = data.map(row => row.Category); // ["Rent", "Groceries", ...]
  const amounts = data.map(row => row.Amount); // [1200, 450, ...]

  // 3. Get the <canvas> element from our HTML
  const ctx = document.getElementById('myChart').getContext('2d');

  // 4. Create the chart!
  // CHANGED "new Chart(...)" to "myChart = new Chart(...)"
  myChart = new Chart(ctx, {
    type: 'bar', 
    data: {
      labels: labels, // Use our categories as labels
      datasets: [{
        label: 'Cost',
        data: amounts, // Use our amounts as data
        backgroundColor: '#67147cff' // <-- Bonus: Single color for bar chart
      }]
    },
    options: { // <-- Bonus: Better options for a bar chart
      responsive: true,
      plugins: {
        legend: {
          display: false // No legend needed for a bar chart
        }
      },
      scales: {
        y: {
          beginAtZero: true // Makes sure the bar chart starts at 0
        }
      }
    }
  });
}

// This is the function that calls our backend API
async function fetchData() {
  const response = await fetch('/api/data'); // 'fetch' is the browser's way to get data
  const data = await response.json();
  return data;
}

// --- ADDED THIS ENTIRE NEW FUNCTION ---
// This function listens for the "submit" button click on your new form
function setupFormListener() {
  const form = document.getElementById('addCostForm');

  form.addEventListener('submit', async (event) => {
    // Stop the page from doing a full reload
    event.preventDefault(); 

    const categoryInput = document.getElementById('categoryInput');
    const amountInput = document.getElementById('amountInput');

    const newData = {
      category: categoryInput.value,
      amount: parseFloat(amountInput.value) // Convert text to a number
    };

    // Send the new data to our server's /api/add endpoint
    const response = await fetch('/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newData)
    });

    const result = await response.json();

    if (result.success) {
      // It worked!
      // Clear the input boxes
      categoryInput.value = '';
      amountInput.value = '';
      
      // Reload the chart to show the new data
      setupDashboard(); 
    } else {
      // Show an error if it failed
      alert('Error saving data: ' + result.message);
    }
  });
}
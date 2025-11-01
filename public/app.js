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


// This is your existing code
window.addEventListener('load', setupDashboard);

async function setupDashboard() {
  // 1. Get the data from our API
  const data = await fetchData();
  
  // 2. Prepare the data for the chart
  const labels = data.map(row => row.Category); // ["Rent", "Groceries", ...]
  const amounts = data.map(row => row.Amount); // [1200, 450, ...]

  // 3. Get the <canvas> element from our HTML
  const ctx = document.getElementById('myChart').getContext('2d');

  // 4. Create the chart!
  new Chart(ctx, {
    type: 'bar', // You can change this to 'bar', 'line', etc.
    data: {
      labels: labels, // Use our categories as labels
      datasets: [{
        label: 'Cost',
        data: amounts, // Use our amounts as data
        backgroundColor: [ // Some nice colors
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
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
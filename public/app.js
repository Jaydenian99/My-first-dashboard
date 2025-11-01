console.log("app.js file has loaded!");

// The dark mode toggle code block has been removed from here.

let myChart = null; 

window.addEventListener('load', () => {
  setupDashboard();
  setupFormListener();
  setupDeleteListener(); // <-- NEW: Set up the delete listener
});

async function setupDashboard() {
  if (myChart) {
    myChart.destroy();
  }

  const data = await fetchData();
  
  // --- 1. Render the chart ---
  const labels = data.map(row => row.Category);
  const amounts = data.map(row => row.Amount);

  // NEW: Generate an array of random dark colors
  // This will create one random color for every label in your data.
  const randomColors = labels.map(() => getRandomDarkColor());

  const ctx = document.getElementById('myChart').getContext('2d');

 // This is the updated chart block
  myChart = new Chart(ctx, {
    type: 'bar', 
    data: {
      labels: labels,
      datasets: [{
        label: 'Cost',
        data: amounts,
        backgroundColor: randomColors // Use the new random color array
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { // This is the Y-axis (the amounts on the left)
          beginAtZero: true,
          ticks: {
            color: '#FFFFFF' // <-- ADDED: Sets Y-axis text to white
          }
        },
        x: { // This is the X-axis (the categories on the bottom)
          ticks: {
            color: '#FFFFFF' // <-- ADDED: Sets X-axis text to white
          }
        }
      }
    }
  });

  // --- 2. Render the cost list ---
  renderCostList(data);
}

// NEW FUNCTION: Renders the list with delete buttons
function renderCostList(data) {
  const listElement = document.getElementById('costList');
  listElement.innerHTML = ''; // Clear the old list

  data.forEach(item => {
    const li = document.createElement('li');
    // We use data-id to store the item's unique ID on the button
    li.innerHTML = `
      <span>${item.Category}: $${item.Amount}</span>
      <button class="delete-btn" data-id="${item.id}">Delete</button>
    `;
    listElement.appendChild(li);
  });
}

// This is the function that calls our backend API
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}

// This function (for adding) is almost the same
function setupFormListener() {
  const form = document.getElementById('addCostForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const categoryInput = document.getElementById('categoryInput');
    const amountInput = document.getElementById('amountInput');

    const newData = {
      category: categoryInput.value,
      amount: parseFloat(amountInput.value)
    };

    const response = await fetch('/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });

    const result = await response.json();

    if (result.success) {
      categoryInput.value = '';
      amountInput.value = '';
      setupDashboard(); // Reload everything
    } else {
      alert('Error saving data: ' + result.message);
    }
  });
}

// NEW FUNCTION: Listens for clicks on the cost list
function setupDeleteListener() {
  const listElement = document.getElementById('costList');

  // This is an "event delegate" - it listens for clicks on the 
  // whole list, but only acts if the click was on a .delete-btn
  listElement.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-btn')) {
      // Get the ID we stored in the "data-id" attribute
      const id = parseInt(event.target.getAttribute('data-id'));
      
      // Send this ID to our new /api/delete endpoint
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });

      const result = await response.json();
      
      if (result.success) {
        setupDashboard(); // Reload everything
      } else {
        alert('Error deleting data: ' + result.message);
      }
    }
  });
}

// Helper function to generate a random dark color
function getRandomDarkColor() {
  const hue = Math.floor(Math.random() * 361); // 0-360 degrees
  const saturation = Math.floor(Math.random() * 41) + 60; // 60-100% (nice and vibrant)
  const lightness = Math.floor(Math.random() * 21) + 20; // 20-40% (nice and dark)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
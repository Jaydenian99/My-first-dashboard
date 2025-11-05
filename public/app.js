console.log("app.js file has loaded!");

let myChart = null; 
let currentTheme = 'dark'; // Default to dark mode
let currentChartType = 'bar'; // Default chart type
let authToken = null;
let currentUsername = null;

window.addEventListener('load', () => {
  initializeTheme();
  initializeChartType();
  checkAuthState();
  setupAuthUI();
  setupThemeToggle();
  setupChartTypeSelector();
  setupFormListener();
  setupDeleteListener();
});

// Authentication Functions
function getAuthToken() {
  return localStorage.getItem('authToken');
}

function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

function getUsername() {
  return localStorage.getItem('username');
}

function setUsername(username) {
  currentUsername = username;
  if (username) {
    localStorage.setItem('username', username);
  } else {
    localStorage.removeItem('username');
  }
}

async function checkAuthState() {
  const token = getAuthToken();
  const username = getUsername();
  
  if (token && username) {
    // Verify token is still valid
    try {
      const response = await fetch('/api/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          authToken = token;
          currentUsername = username;
          showDashboard();
          return;
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  
  // If token is invalid or doesn't exist, show auth UI
  showAuthUI();
}

function showAuthUI() {
  document.getElementById('authContainer').classList.add('show');
  document.getElementById('dashboardContent').classList.remove('show');
  document.getElementById('userInfo').classList.remove('show');
}

function showDashboard() {
  document.getElementById('authContainer').classList.remove('show');
  document.getElementById('dashboardContent').classList.add('show');
  document.getElementById('userInfo').classList.add('show');
  document.getElementById('usernameDisplay').textContent = currentUsername;
  setupDashboard(); // Load user's data
}

function setupAuthUI() {
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const logoutBtn = document.getElementById('logoutBtn');

  // Tab switching
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('signupError').classList.remove('show');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('signupError').classList.remove('show');
  });

  // Login form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    errorDiv.classList.remove('show');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setAuthToken(data.token);
        setUsername(data.username);
        showDashboard();
        loginForm.reset();
      } else {
        errorDiv.textContent = data.message || 'Login failed';
        errorDiv.classList.add('show');
      }
    } catch (error) {
      errorDiv.textContent = 'Network error. Please try again.';
      errorDiv.classList.add('show');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Signup form
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    errorDiv.classList.remove('show');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setAuthToken(data.token);
        setUsername(data.username);
        showDashboard();
        signupForm.reset();
      } else {
        errorDiv.textContent = data.message || 'Signup failed';
        errorDiv.classList.add('show');
      }
    } catch (error) {
      errorDiv.textContent = 'Network error. Please try again.';
      errorDiv.classList.add('show');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    setAuthToken(null);
    setUsername(null);
    showAuthUI();
    if (myChart) {
      myChart.destroy();
      myChart = null;
    }
  });
}

// Helper function to make authenticated API requests
async function apiRequest(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid
    setAuthToken(null);
    setUsername(null);
    showAuthUI();
    throw new Error('Session expired. Please login again.');
  }

  return response;
}

async function setupDashboard() {
  if (myChart) {
    myChart.destroy();
  }

  const data = await fetchData();
  
  // --- 1. Render the chart ---
  const labels = data.map(row => row.Category);
  const amounts = data.map(row => row.Amount);

  // Generate an array of random colors based on current theme
  // This will create one random color for every label in your data.
  const randomColors = labels.map(() => getRandomColor());

  const ctx = document.getElementById('myChart').getContext('2d');

  // Base chart configuration
  const isDark = currentTheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Common options for all chart types
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: currentChartType === 'pie',
        position: 'bottom',
        labels: {
          color: textColor,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1
      }
    }
  };

  // Chart-specific options
  let chartOptions = { ...commonOptions };

  // Add scales for bar and line charts (pie charts don't have scales)
  if (currentChartType === 'bar' || currentChartType === 'line') {
    chartOptions.scales = {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor
        },
        grid: {
          color: gridColor
        }
      },
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          color: gridColor
        }
      }
    };
  }

  // Dataset configuration based on chart type
  let datasetConfig = {
    label: 'Cost',
    data: amounts,
    backgroundColor: randomColors
  };

  // For line charts, use a single primary color for the line with colored points
  if (currentChartType === 'line') {
    // Use a theme-appropriate color for the main line
    const primaryLineColor = isDark ? '#4a90e2' : '#357abd';
    
    datasetConfig.borderColor = primaryLineColor;
    datasetConfig.borderWidth = 3;
    datasetConfig.fill = false;
    datasetConfig.tension = 0.4; // Smooth curves
    // Use different colors for each point to distinguish categories
    datasetConfig.pointBackgroundColor = randomColors;
    datasetConfig.pointBorderColor = primaryLineColor;
    datasetConfig.pointBorderWidth = 2;
    datasetConfig.pointRadius = 5;
    datasetConfig.pointHoverRadius = 7;
  }

  // Create the chart
  myChart = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: labels,
      datasets: [datasetConfig]
    },
    options: chartOptions
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
  const response = await apiRequest('/api/data');
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

    const response = await apiRequest('/api/add', {
      method: 'POST',
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
      const response = await apiRequest('/api/delete', {
        method: 'POST',
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

// Chart Type Functions
function initializeChartType() {
  // Check localStorage for saved chart type preference
  const savedChartType = localStorage.getItem('chartType') || 'bar';
  currentChartType = savedChartType;
  const chartTypeSelect = document.getElementById('chartTypeSelect');
  if (chartTypeSelect) {
    chartTypeSelect.value = savedChartType;
  }
}

function setupChartTypeSelector() {
  const chartTypeSelect = document.getElementById('chartTypeSelect');
  if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', (event) => {
      currentChartType = event.target.value;
      localStorage.setItem('chartType', currentChartType);
      setupDashboard(); // Recreate the chart with new type
    });
  }
}

// Dark Mode Toggle Functions
function initializeTheme() {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleButton();
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggleButton();
    updateChartTheme();
  });
}

function updateThemeToggleButton() {
  const themeToggle = document.getElementById('themeToggle');
  if (currentTheme === 'dark') {
    themeToggle.textContent = '☀️ Light Mode';
  } else {
    themeToggle.textContent = '🌙 Dark Mode';
  }
}

function updateChartTheme() {
  if (myChart) {
    const isDark = currentTheme === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#333333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update legend colors
    if (myChart.options.plugins.legend) {
      myChart.options.plugins.legend.labels.color = textColor;
    }
    
    // Update tooltip colors
    if (myChart.options.plugins.tooltip) {
      myChart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      myChart.options.plugins.tooltip.titleColor = textColor;
      myChart.options.plugins.tooltip.bodyColor = textColor;
    }
    
    // Update scale colors (only for bar and line charts)
    if (myChart.options.scales) {
      if (myChart.options.scales.y) {
        myChart.options.scales.y.ticks.color = textColor;
        myChart.options.scales.y.grid.color = gridColor;
      }
      if (myChart.options.scales.x) {
        myChart.options.scales.x.ticks.color = textColor;
        myChart.options.scales.x.grid.color = gridColor;
      }
    }
    
    myChart.update();
  }
}

// Helper function to generate colors based on theme
function getRandomColor() {
  const hue = Math.floor(Math.random() * 361); // 0-360 degrees
  const saturation = Math.floor(Math.random() * 41) + 60; // 60-100% (nice and vibrant)
  
  // Adjust lightness based on theme
  const isDark = currentTheme === 'dark';
  const lightness = isDark 
    ? Math.floor(Math.random() * 21) + 20  // 20-40% (dark theme)
    : Math.floor(Math.random() * 21) + 60; // 60-80% (light theme)
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Helper function to generate a random dark color (kept for backward compatibility)
function getRandomDarkColor() {
  return getRandomColor();
}
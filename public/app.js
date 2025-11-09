console.log("app.js file has loaded!");

let myChart = null; 
let currentTheme = 'dark'; // Default to dark mode
let currentChartType = 'bar'; // Default chart type
let currentLanguage = 'en'; // Default language
let authToken = null;
let currentUsername = null;
let dashboardLoadPromise = null;
let hasDashboardLoadErrorAlerted = false;
let resetPasswordToken = null;
let isResetFlowActive = false;
let showAuthSection = () => {};

// Translation object
const translations = {
  en: {
    // Page title
    pageTitle: 'My Financial Dashboard',
    
    // Authentication
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Username',
    passwordPlaceholder: 'Password',
    identifierPlaceholder: 'Email or Username',
    email: 'Email',
    emailPlaceholder: 'Email address',
    usernameMinChars: 'Username (min 3 characters)',
    passwordMinChars: 'Password (min 6 characters)',
    welcome: 'Welcome,',
    forgotPassword: 'Forgot password?',
    forgotPasswordInfo: 'Enter your email address and we will send you a link to reset your password.',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to login',
    resetPassword: 'Reset Password',
    resetPasswordInfo: 'Choose a new password for your account.',
    confirmPasswordPlaceholder: 'Confirm new password',
    passwordsDoNotMatch: 'Passwords do not match',
    resetPasswordSuccess: 'Password reset successfully. Please login with your new password.',
    resetPasswordFailed: 'Failed to reset password',
    resetLinkSent: 'If that email is registered, we have sent a reset link.',
    upgradeEmailInfo: 'Please add an email address to secure your account.',
    emailRequired: 'Email is required',
    
    // Dashboard
    monthlyCosts: 'My Monthly Costs',
    financialOverview: 'Financial Overview',
    salaryBeforeTax: 'Salary (Before Tax)',
    salaryAfterTax: 'Salary (After Tax)',
    totalCosts: 'Total Costs',
    remainingMoney: 'Remaining Money',
    
    // Salary Form
    monthlySalary: 'Monthly Salary (Netherlands)',
    beforeTaxes: 'Before Taxes (€)',
    afterTaxes: 'After Taxes (€)',
    updateSalary: 'Update Salary',
    salaryBeforeTaxPlaceholder: 'e.g., 5000',
    salaryAfterTaxPlaceholder: 'e.g., 3500',
    
    // Cost Form
    addNewCost: 'Add New Cost',
    category: 'Category:',
    amount: 'Amount:',
    addCost: 'Add Cost',
    categoryPlaceholder: 'e.g., Transport',
    amountPlaceholder: 'e.g., 100.50',
    currentCosts: 'Current Costs',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    editCost: 'Edit Cost',
    
    // Chart
    chartType: 'Chart Type:',
    barChart: 'Bar Chart',
    pieChart: 'Pie Chart',
    lineChart: 'Line Chart',
    cost: 'Cost',
    
    // Theme
    lightMode: '☀️ Light Mode',
    darkMode: '🌙 Dark Mode',
    
    // Language
    language: 'Language',
    english: 'English',
    dutch: 'Dutch',
    setAsDefault: 'Set as Default',
    
    // Errors
    loginFailed: 'Login failed',
    signupFailed: 'Signup failed',
    networkError: 'Network error. Please try again.',
    errorSavingData: 'Error saving data',
    errorDeletingData: 'Error deleting data',
    errorSavingSalary: 'Error saving salary',
    errorUpdatingData: 'Error updating data',
    sessionExpired: 'Session expired. Please login again.',
    required: 'is required',
    mustBeValid: 'must be a valid positive number'
  },
  nl: {
    // Page title
    pageTitle: 'Mijn Financiële Dashboard',
    
    // Authentication
    login: 'Inloggen',
    signup: 'Registreren',
    logout: 'Uitloggen',
    username: 'Gebruikersnaam',
    password: 'Wachtwoord',
    usernamePlaceholder: 'Gebruikersnaam',
    passwordPlaceholder: 'Wachtwoord',
    identifierPlaceholder: 'E-mail of gebruikersnaam',
    email: 'E-mail',
    emailPlaceholder: 'E-mailadres',
    usernameMinChars: 'Gebruikersnaam (min 3 tekens)',
    passwordMinChars: 'Wachtwoord (min 6 tekens)',
    welcome: 'Welkom,',
    forgotPassword: 'Wachtwoord vergeten?',
    forgotPasswordInfo: 'Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.',
    sendResetLink: 'Resetlink versturen',
    backToLogin: 'Terug naar inloggen',
    resetPassword: 'Wachtwoord resetten',
    resetPasswordInfo: 'Kies een nieuw wachtwoord voor je account.',
    confirmPasswordPlaceholder: 'Bevestig nieuw wachtwoord',
    passwordsDoNotMatch: 'Wachtwoorden komen niet overeen',
    resetPasswordSuccess: 'Wachtwoord succesvol gereset. Log opnieuw in met je nieuwe wachtwoord.',
    resetPasswordFailed: 'Wachtwoord resetten is mislukt',
    resetLinkSent: 'Als dat e-mailadres bij ons bekend is, hebben we een resetlink verstuurd.',
    upgradeEmailInfo: 'Voeg een e-mailadres toe om je account te beveiligen.',
    emailRequired: 'E-mailadres is verplicht',
    
    // Dashboard
    monthlyCosts: 'Mijn Maandelijkse Kosten',
    financialOverview: 'Financieel Overzicht',
    salaryBeforeTax: 'Salaris (Voor Belasting)',
    salaryAfterTax: 'Salaris (Na Belasting)',
    totalCosts: 'Totale Kosten',
    remainingMoney: 'Resterend Geld',
    
    // Salary Form
    monthlySalary: 'Maandelijks Salaris (Nederland)',
    beforeTaxes: 'Voor Belasting (€)',
    afterTaxes: 'Na Belasting (€)',
    updateSalary: 'Salaris Bijwerken',
    salaryBeforeTaxPlaceholder: 'bijv., 5000',
    salaryAfterTaxPlaceholder: 'bijv., 3500',
    
    // Cost Form
    addNewCost: 'Nieuwe Kosten Toevoegen',
    category: 'Categorie:',
    amount: 'Bedrag:',
    addCost: 'Kosten Toevoegen',
    categoryPlaceholder: 'bijv., Vervoer',
    amountPlaceholder: 'bijv., 100.50',
    currentCosts: 'Huidige Kosten',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    save: 'Opslaan',
    cancel: 'Annuleren',
    editCost: 'Kosten Bewerken',
    
    // Chart
    chartType: 'Grafiektype:',
    barChart: 'Staafdiagram',
    pieChart: 'Cirkeldiagram',
    lineChart: 'Lijngrafiek',
    cost: 'Kosten',
    
    // Theme
    lightMode: '☀️ Lichte Modus',
    darkMode: '🌙 Donkere Modus',
    
    // Language
    language: 'Taal',
    english: 'Engels',
    dutch: 'Nederlands',
    setAsDefault: 'Instellen als Standaard',
    
    // Errors
    loginFailed: 'Inloggen mislukt',
    signupFailed: 'Registreren mislukt',
    networkError: 'Netwerkfout. Probeer het opnieuw.',
    errorSavingData: 'Fout bij opslaan van gegevens',
    errorDeletingData: 'Fout bij verwijderen van gegevens',
    errorSavingSalary: 'Fout bij opslaan van salaris',
    errorUpdatingData: 'Fout bij bijwerken van gegevens',
    sessionExpired: 'Sessie verlopen. Log opnieuw in.',
    required: 'is verplicht',
    mustBeValid: 'moet een geldig positief getal zijn'
  }
};

window.addEventListener('load', () => {
  detectDeviceType();
  initializeLanguage();
  initializeTheme();
  initializeChartType();
  setupAuthUI();
  checkForResetToken();
  checkAuthState();
  setupThemeToggle();
  setupChartTypeSelector();
  setupLanguageSelector();
  setupFormListener();
  setupDeleteListener();
  setupSalaryFormListener();
  setupResponsiveHandlers();
});

// Device Detection Functions
function detectDeviceType() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Check for mobile devices
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent.toLowerCase());
  const isSmallScreen = width <= 768;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Add device classes to body
  const body = document.body;
  
  if (isMobile || (isSmallScreen && isTouchDevice)) {
    body.classList.add('mobile-device');
    body.classList.remove('desktop-device', 'tablet-device');
  } else if (isTablet || (width > 768 && width <= 1024)) {
    body.classList.add('tablet-device');
    body.classList.remove('mobile-device', 'desktop-device');
  } else {
    body.classList.add('desktop-device');
    body.classList.remove('mobile-device', 'tablet-device');
  }
  
  // Add touch class for touch devices
  if (isTouchDevice) {
    body.classList.add('touch-device');
  } else {
    body.classList.add('no-touch-device');
  }
  
  // Store device info
  window.deviceInfo = {
    isMobile: isMobile || (isSmallScreen && isTouchDevice),
    isTablet: isTablet || (width > 768 && width <= 1024),
    isDesktop: !isMobile && !isTablet && width > 1024,
    isTouch: isTouchDevice,
    width: width,
    height: height
  };
  
  console.log('Device detected:', window.deviceInfo);
}

function setupResponsiveHandlers() {
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      detectDeviceType();
      if (myChart) {
        myChart.resize();
      }
    }, 250);
  });
  
  // Handle orientation change on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      detectDeviceType();
      if (myChart) {
        myChart.resize();
      }
    }, 100);
  });
}

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
  if (isResetFlowActive) {
    return;
  }

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
  if (!isResetFlowActive && typeof showAuthSection === 'function') {
    showAuthSection('login');
  }
}

function showDashboard() {
  document.getElementById('authContainer').classList.remove('show');
  document.getElementById('dashboardContent').classList.add('show');
  document.getElementById('userInfo').classList.add('show');
  isResetFlowActive = false;
  resetPasswordToken = null;
  updateWelcomeMessage();
  setupDashboard(true); // Load user's data
}

function updateWelcomeMessage() {
  const usernameDisplay = document.getElementById('usernameDisplay');
  const welcomeSpan = document.querySelector('#welcomeMessage span[data-i18n="welcome"]');
  if (usernameDisplay) {
    usernameDisplay.textContent = currentUsername;
  }
  if (welcomeSpan) {
    welcomeSpan.textContent = getTranslation('welcome');
  }
}

function setupAuthUI() {
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordBackBtn = document.getElementById('forgotPasswordBackBtn');
  const resetPasswordBackBtn = document.getElementById('resetPasswordBackBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const authTabs = document.querySelector('.auth-tabs');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');
  const forgotPasswordError = document.getElementById('forgotPasswordError');
  const forgotPasswordSuccess = document.getElementById('forgotPasswordSuccess');
  const resetPasswordError = document.getElementById('resetPasswordError');
  const resetPasswordSuccess = document.getElementById('resetPasswordSuccess');
  const upgradeEmailContainer = document.getElementById('upgradeEmailContainer');
  const loginUpgradeEmail = document.getElementById('loginUpgradeEmail');

  function resetUpgradeEmailState() {
    if (upgradeEmailContainer) {
      upgradeEmailContainer.classList.remove('show');
    }
    if (loginUpgradeEmail) {
      loginUpgradeEmail.value = '';
    }
  }

  function resetForgotPasswordState() {
    if (forgotPasswordError) {
      forgotPasswordError.classList.remove('show');
    }
    if (forgotPasswordSuccess) {
      forgotPasswordSuccess.classList.remove('show');
    }
    if (forgotPasswordForm) {
      forgotPasswordForm.reset();
    }
  }

  function resetResetPasswordState() {
    if (resetPasswordError) {
      resetPasswordError.classList.remove('show');
    }
    if (resetPasswordSuccess) {
      resetPasswordSuccess.classList.remove('show');
    }
    if (resetPasswordForm) {
      resetPasswordForm.reset();
    }
  }

  function resetLoginError() {
    if (loginError) {
      loginError.classList.remove('show');
    }
  }

  function resetSignupError() {
    if (signupError) {
      signupError.classList.remove('show');
    }
  }

  function activateSection(section) {
    const forms = {
      login: loginForm,
      signup: signupForm,
      forgot: forgotPasswordForm,
      reset: resetPasswordForm
    };

    Object.entries(forms).forEach(([key, form]) => {
      if (!form) return;
      if (key === section) {
        form.classList.add('active');
      } else {
        form.classList.remove('active');
      }
    });

    if (authTabs) {
      authTabs.style.display = (section === 'login' || section === 'signup') ? 'flex' : 'none';
    }

    if (section === 'login') {
      resetForgotPasswordState();
      resetResetPasswordState();
    } else if (section === 'signup') {
      resetForgotPasswordState();
      resetResetPasswordState();
      resetUpgradeEmailState();
    } else if (section === 'forgot') {
      resetForgotPasswordState();
      resetResetPasswordState();
      resetUpgradeEmailState();
    } else if (section === 'reset') {
      resetResetPasswordState();
      resetUpgradeEmailState();
    }

    if (section === 'login') {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
    } else if (section === 'signup') {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
    } else {
      loginTab.classList.remove('active');
      signupTab.classList.remove('active');
    }
  }

  showAuthSection = activateSection;

  // Tab switching
  loginTab.addEventListener('click', () => {
    isResetFlowActive = false;
    resetPasswordToken = null;
    resetSignupError();
    resetLoginError();
    activateSection('login');
  });

  signupTab.addEventListener('click', () => {
    isResetFlowActive = false;
    resetPasswordToken = null;
    resetLoginError();
    resetSignupError();
    activateSection('signup');
  });

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', () => {
      activateSection('forgot');
      resetForgotPasswordState();
      resetLoginError();
    });
  }

  if (forgotPasswordBackBtn) {
    forgotPasswordBackBtn.addEventListener('click', () => {
      activateSection('login');
      resetLoginError();
    });
  }

  if (resetPasswordBackBtn) {
    resetPasswordBackBtn.addEventListener('click', () => {
      isResetFlowActive = false;
      resetPasswordToken = null;
      if (history.replaceState) {
        history.replaceState({}, document.title, '/');
      }
      activateSection('login');
      resetLoginError();
    });
  }

  // Login form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = loginError;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const upgradeEmailValue = loginUpgradeEmail ? loginUpgradeEmail.value.trim() : '';
    const shouldRequireEmail = upgradeEmailContainer && upgradeEmailContainer.classList.contains('show');

    submitBtn.disabled = true;
    errorDiv.classList.remove('show');

    if (shouldRequireEmail && !upgradeEmailValue) {
      errorDiv.textContent = getTranslation('emailRequired');
      errorDiv.classList.add('show');
      submitBtn.disabled = false;
      return;
    }

    try {
      const payload = { identifier, password };
      if (upgradeEmailValue) {
        payload.email = upgradeEmailValue;
      }

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setAuthToken(data.token);
        setUsername(data.username);
        showDashboard();
        loginForm.reset();
        resetUpgradeEmailState();
        errorDiv.classList.remove('show');
      } else {
        if (data.requiresEmail) {
          if (upgradeEmailContainer) {
            upgradeEmailContainer.classList.add('show');
          }
          const message = data.message || getTranslation('upgradeEmailInfo');
          errorDiv.textContent = message;
          errorDiv.classList.add('show');
          if (loginUpgradeEmail) {
            loginUpgradeEmail.focus();
          }
        } else {
          errorDiv.textContent = data.message || getTranslation('loginFailed');
          errorDiv.classList.add('show');
        }
      }
    } catch (error) {
      errorDiv.textContent = getTranslation('networkError');
      errorDiv.classList.add('show');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Signup form
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorDiv = signupError;
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    errorDiv.classList.remove('show');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (data.success) {
        setAuthToken(data.token);
        setUsername(data.username);
        showDashboard();
        signupForm.reset();
        errorDiv.classList.remove('show');
      } else {
        errorDiv.textContent = data.message || getTranslation('signupFailed');
        errorDiv.classList.add('show');
      }
    } catch (error) {
      errorDiv.textContent = getTranslation('networkError');
      errorDiv.classList.add('show');
    } finally {
      submitBtn.disabled = false;
    }
  });

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotPasswordEmail').value.trim();
      const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');

      if (forgotPasswordError) {
        forgotPasswordError.classList.remove('show');
      }
      if (forgotPasswordSuccess) {
        forgotPasswordSuccess.classList.remove('show');
      }

      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (forgotPasswordSuccess) {
            const successMessage = data.message || getTranslation('resetLinkSent');
            forgotPasswordSuccess.textContent = successMessage;
            forgotPasswordSuccess.classList.add('show');
          }
        } else {
          if (forgotPasswordError) {
            forgotPasswordError.textContent = data.message || getTranslation('networkError');
            forgotPasswordError.classList.add('show');
          }
        }
      } catch (error) {
        if (forgotPasswordError) {
          forgotPasswordError.textContent = getTranslation('networkError');
          forgotPasswordError.classList.add('show');
        }
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('resetPasswordInput').value;
      const confirmPassword = document.getElementById('resetPasswordConfirmInput').value;
      const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');

      if (resetPasswordError) {
        resetPasswordError.classList.remove('show');
      }
      if (resetPasswordSuccess) {
        resetPasswordSuccess.classList.remove('show');
      }

      if (password !== confirmPassword) {
        if (resetPasswordError) {
          resetPasswordError.textContent = getTranslation('passwordsDoNotMatch');
          resetPasswordError.classList.add('show');
        }
        return;
      }

      if (!resetPasswordToken) {
        if (resetPasswordError) {
          resetPasswordError.textContent = getTranslation('resetPasswordFailed');
          resetPasswordError.classList.add('show');
        }
        return;
      }

      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetPasswordToken, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (resetPasswordSuccess) {
            resetPasswordSuccess.textContent = getTranslation('resetPasswordSuccess');
            resetPasswordSuccess.classList.add('show');
          }
          resetPasswordToken = null;
          isResetFlowActive = false;
          resetPasswordForm.reset();
          if (history.replaceState) {
            history.replaceState({}, document.title, '/');
          }
          setTimeout(() => {
            activateSection('login');
            showAuthUI();
          }, 1500);
        } else {
          if (resetPasswordError) {
            resetPasswordError.textContent = data.message || getTranslation('resetPasswordFailed');
            resetPasswordError.classList.add('show');
          }
        }
      } catch (error) {
        if (resetPasswordError) {
          resetPasswordError.textContent = getTranslation('networkError');
          resetPasswordError.classList.add('show');
        }
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Logout
  logoutBtn.addEventListener('click', () => {
    setAuthToken(null);
    setUsername(null);
    isResetFlowActive = false;
    resetPasswordToken = null;
    resetUpgradeEmailState();
    showAuthUI();
    if (myChart) {
      myChart.destroy();
      myChart = null;
    }
  });

  activateSection('login');
}

function checkForResetToken() {
  const url = new URL(window.location.href);
  if (url.pathname === '/reset-password') {
    const token = url.searchParams.get('token');
    showAuthUI();
    if (token) {
      resetPasswordToken = token;
      isResetFlowActive = true;
      if (typeof showAuthSection === 'function') {
        showAuthSection('reset');
      }
      if (history.replaceState) {
        history.replaceState({}, document.title, '/reset-password');
      }
    } else if (typeof showAuthSection === 'function') {
      showAuthSection('forgot');
    }
  }
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
    throw new Error(getTranslation('sessionExpired'));
  }

  return response;
}

async function setupDashboard(forceRefresh = false) {
  if (dashboardLoadPromise) {
    if (!forceRefresh) {
      return dashboardLoadPromise;
    }

    try {
      await dashboardLoadPromise;
    } catch (error) {
      console.warn('Previous dashboard load failed', error);
    }
  }

  dashboardLoadPromise = (async () => {
    try {
      if (myChart) {
        myChart.destroy();
        myChart = null;
      }

      const data = await fetchData();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from /api/data');
      }

      const chartCanvas = document.getElementById('myChart');
      if (!chartCanvas) {
        return;
      }

      const labels = data.map(row => row.Category);
      const amounts = data.map(row => row.Amount);

      const randomColors = labels.map(() => getRandomColor());

      const ctx = chartCanvas.getContext('2d');

      const isDark = currentTheme === 'dark';
      const textColor = isDark ? '#FFFFFF' : '#333333';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

      const isMobileDevice = window.deviceInfo && window.deviceInfo.isMobile;

      const commonOptions = {
        responsive: true,
        maintainAspectRatio: !isMobileDevice,
        plugins: {
          legend: {
            display: currentChartType === 'pie',
            position: 'bottom',
            labels: {
              color: textColor,
              padding: isMobileDevice ? 10 : 15,
              font: {
                size: isMobileDevice ? 10 : 12
              }
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            titleFont: {
              size: isMobileDevice ? 12 : 14
            },
            bodyFont: {
              size: isMobileDevice ? 11 : 13
            }
          }
        }
      };

      let chartOptions = { ...commonOptions };

      if (currentChartType === 'bar' || currentChartType === 'line') {
        chartOptions.scales = {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              font: {
                size: isMobileDevice ? 10 : 12
              }
            },
            grid: {
              color: gridColor
            }
          },
          x: {
            ticks: {
              color: textColor,
              font: {
                size: isMobileDevice ? 10 : 12
              }
            },
            grid: {
              color: gridColor
            }
          }
        };
      }

      let datasetConfig = {
        label: getTranslation('cost'),
        data: amounts,
        backgroundColor: randomColors
      };

      if (currentChartType === 'line') {
        const primaryLineColor = isDark ? '#4a90e2' : '#357abd';

        datasetConfig.borderColor = primaryLineColor;
        datasetConfig.borderWidth = 3;
        datasetConfig.fill = false;
        datasetConfig.tension = 0.4;
        datasetConfig.pointBackgroundColor = randomColors;
        datasetConfig.pointBorderColor = primaryLineColor;
        datasetConfig.pointBorderWidth = 2;
        datasetConfig.pointRadius = 5;
        datasetConfig.pointHoverRadius = 7;
      }

      myChart = new Chart(ctx, {
        type: currentChartType,
        data: {
          labels: labels,
          datasets: [datasetConfig]
        },
        options: chartOptions
      });

      renderCostList(data);

      await updateFinancialSummary(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (!hasDashboardLoadErrorAlerted) {
        alert(getTranslation('networkError'));
        hasDashboardLoadErrorAlerted = true;
        setTimeout(() => {
          hasDashboardLoadErrorAlerted = false;
        }, 5000);
      }
    } finally {
      dashboardLoadPromise = null;
    }
  })();

  return dashboardLoadPromise;
}

// NEW FUNCTION: Renders the list with delete and edit buttons
function renderCostList(data) {
  const listElement = document.getElementById('costList');
  listElement.innerHTML = ''; // Clear the old list

  data.forEach(item => {
    const li = document.createElement('li');
    li.setAttribute('data-id', item.id);
    
    // Format amount to show 2 decimal places
    const formattedAmount = parseFloat(item.Amount).toFixed(2);
    
    // Create display view (default)
    const displayView = document.createElement('div');
    displayView.className = 'cost-item-display';
    
    const span = document.createElement('span');
    span.textContent = `${item.Category}: €${formattedAmount}`;
    displayView.appendChild(span);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'cost-item-buttons';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.setAttribute('data-id', item.id);
    editBtn.setAttribute('data-i18n', 'edit');
    editBtn.textContent = getTranslation('edit');
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('data-id', item.id);
    deleteBtn.setAttribute('data-i18n', 'delete');
    deleteBtn.textContent = getTranslation('delete');
    
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);
    displayView.appendChild(buttonContainer);
    
    // Create edit view (hidden by default)
    const editView = document.createElement('div');
    editView.className = 'cost-item-edit';
    editView.style.display = 'none';
    
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.className = 'edit-category-input';
    categoryInput.value = item.Category;
    categoryInput.setAttribute('data-i18n', 'categoryPlaceholder');
    categoryInput.placeholder = getTranslation('categoryPlaceholder');
    
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'edit-amount-input';
    amountInput.value = item.Amount;
    amountInput.step = '0.01';
    amountInput.min = '0';
    amountInput.setAttribute('data-i18n', 'amountPlaceholder');
    amountInput.placeholder = getTranslation('amountPlaceholder');
    
    const editButtonContainer = document.createElement('div');
    editButtonContainer.className = 'cost-item-edit-buttons';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.setAttribute('data-id', item.id);
    saveBtn.setAttribute('data-i18n', 'save');
    saveBtn.textContent = getTranslation('save');
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.setAttribute('data-id', item.id);
    cancelBtn.setAttribute('data-i18n', 'cancel');
    cancelBtn.textContent = getTranslation('cancel');
    
    editButtonContainer.appendChild(saveBtn);
    editButtonContainer.appendChild(cancelBtn);
    
    editView.appendChild(categoryInput);
    editView.appendChild(amountInput);
    editView.appendChild(editButtonContainer);
    
    li.appendChild(displayView);
    li.appendChild(editView);
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
      setupDashboard(true); // Reload everything
    } else {
      alert(getTranslation('errorSavingData') + ': ' + result.message);
    }
  });
}

// Salary Form Functions
function setupSalaryFormListener() {
  const salaryForm = document.getElementById('salaryForm');
  if (!salaryForm) return;

  salaryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const beforeTaxInput = document.getElementById('salaryBeforeTaxInput');
    const afterTaxInput = document.getElementById('salaryAfterTaxInput');

    const salaryData = {
      beforeTax: parseFloat(beforeTaxInput.value),
      afterTax: parseFloat(afterTaxInput.value)
    };

    try {
      const response = await apiRequest('/api/salary', {
        method: 'POST',
        body: JSON.stringify(salaryData)
      });

      const result = await response.json();

      if (result.success) {
        // Update financial summary
        const data = await fetchData();
        await updateFinancialSummary(data);
        // Show success message (optional)
        console.log('Salary updated successfully');
      } else {
        alert(getTranslation('errorSavingSalary') + ': ' + result.message);
      }
    } catch (error) {
      alert(getTranslation('errorSavingSalary') + ': ' + error.message);
    }
  });
}

// Fetch salary data
async function fetchSalary() {
  try {
    const response = await apiRequest('/api/salary');
    const result = await response.json();
    if (result.success) {
      return result.salary;
    }
    return { beforeTax: 0, afterTax: 0 };
  } catch (error) {
    console.error('Error fetching salary:', error);
    return { beforeTax: 0, afterTax: 0 };
  }
}

// Update financial summary display
async function updateFinancialSummary(costData) {
  const salary = await fetchSalary();
  
  // Calculate total costs
  const totalCosts = costData.reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0);
  
  // Calculate remaining money (after tax salary - total costs)
  const remainingMoney = (salary.afterTax || 0) - totalCosts;
  
  // Update display
  document.getElementById('salaryBeforeTax').textContent = `€${(salary.beforeTax || 0).toFixed(2)}`;
  document.getElementById('salaryAfterTax').textContent = `€${(salary.afterTax || 0).toFixed(2)}`;
  document.getElementById('totalCosts').textContent = `€${totalCosts.toFixed(2)}`;
  document.getElementById('remainingMoney').textContent = `€${remainingMoney.toFixed(2)}`;
  
  // Update salary form inputs
  const beforeTaxInput = document.getElementById('salaryBeforeTaxInput');
  const afterTaxInput = document.getElementById('salaryAfterTaxInput');
  if (beforeTaxInput && salary.beforeTax > 0) {
    beforeTaxInput.value = salary.beforeTax;
  }
  if (afterTaxInput && salary.afterTax > 0) {
    afterTaxInput.value = salary.afterTax;
  }
  
  // Color code remaining money (green if positive, red if negative)
  const remainingMoneyElement = document.getElementById('remainingMoney');
  const summaryItem = remainingMoneyElement.closest('.summary-item');
  if (remainingMoney >= 0) {
    summaryItem.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
  } else {
    summaryItem.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
  }
}

// NEW FUNCTION: Listens for clicks on the cost list
function setupDeleteListener() {
  const listElement = document.getElementById('costList');

  // This is an "event delegate" - it listens for clicks on the 
  // whole list, but only acts if the click was on a .delete-btn, .edit-btn, .save-btn, or .cancel-btn
  listElement.addEventListener('click', async (event) => {
    const target = event.target;
    const id = parseInt(target.getAttribute('data-id'));
    
    if (!id) return; // Exit if no ID found
    
    const listItem = target.closest('li');
    const displayView = listItem.querySelector('.cost-item-display');
    const editView = listItem.querySelector('.cost-item-edit');
    
    // Handle delete button
    if (target.classList.contains('delete-btn')) {
      // Confirm deletion
      if (!confirm(getTranslation('delete') + '?')) {
        return;
      }
      
      // Send this ID to our /api/delete endpoint
      try {
        const response = await apiRequest('/api/delete', {
          method: 'POST',
          body: JSON.stringify({ id: id })
        });

        const result = await response.json();
        
        if (result.success) {
          setupDashboard(true); // Reload everything (this will also update financial summary)
        } else {
          alert(getTranslation('errorDeletingData') + ': ' + result.message);
        }
      } catch (error) {
        alert(getTranslation('errorDeletingData') + ': ' + error.message);
      }
    }
    
    // Handle edit button
    else if (target.classList.contains('edit-btn')) {
      // Store original values before editing
      const categoryInput = editView.querySelector('.edit-category-input');
      const amountInput = editView.querySelector('.edit-amount-input');
      const displaySpan = displayView.querySelector('span');
      
      // Parse original values from display text (format: "Category: €amount")
      const displayText = displaySpan.textContent;
      const match = displayText.match(/^(.+?):\s*€(.+)$/);
      if (match) {
        // Store original values in data attributes
        categoryInput.setAttribute('data-original-category', match[1].trim());
        amountInput.setAttribute('data-original-amount', match[2].trim());
        
        // Set current values
        categoryInput.value = match[1].trim();
        amountInput.value = match[2].trim();
      }
      
      // Hide display view, show edit view
      displayView.style.display = 'none';
      editView.style.display = 'flex';
      
      // Focus on category input
      if (categoryInput) {
        setTimeout(() => {
          categoryInput.focus();
          categoryInput.select();
        }, 10);
      }
      
      // Add keyboard event listeners for this edit view
      const saveBtn = editView.querySelector('.save-btn');
      const cancelBtn = editView.querySelector('.cancel-btn');
      
      // Add Enter key listener to inputs (save on Enter)
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveBtn.click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelBtn.click();
        }
      };
      
      // Attach listeners to both inputs
      categoryInput.addEventListener('keydown', handleKeyDown);
      amountInput.addEventListener('keydown', handleKeyDown);
    }
    
    // Handle save button
    else if (target.classList.contains('save-btn')) {
      const categoryInput = editView.querySelector('.edit-category-input');
      const amountInput = editView.querySelector('.edit-amount-input');
      
      const category = categoryInput.value.trim();
      const amount = parseFloat(amountInput.value);
      
      // Validate inputs
      if (!category) {
        alert(getTranslation('category') + ' ' + getTranslation('required'));
        return;
      }
      
      if (isNaN(amount) || amount < 0) {
        alert(getTranslation('amount') + ' ' + getTranslation('mustBeValid'));
        return;
      }
      
      // Disable save button while saving
      target.disabled = true;
      
      try {
        // Send update request
        const response = await apiRequest('/api/update', {
          method: 'POST',
          body: JSON.stringify({ id: id, category: category, amount: amount })
        });

        const result = await response.json();
        
        if (result.success) {
          // Reload dashboard to show updated data
          setupDashboard(true);
        } else {
          alert(getTranslation('errorUpdatingData') + ': ' + result.message);
          target.disabled = false;
        }
      } catch (error) {
        alert(getTranslation('errorUpdatingData') + ': ' + error.message);
        target.disabled = false;
      }
    }
    
    // Handle cancel button
    else if (target.classList.contains('cancel-btn')) {
      // Reset input values to original
      const categoryInput = editView.querySelector('.edit-category-input');
      const amountInput = editView.querySelector('.edit-amount-input');
      
      const originalCategory = categoryInput.getAttribute('data-original-category');
      const originalAmount = amountInput.getAttribute('data-original-amount');
      
      if (originalCategory) {
        categoryInput.value = originalCategory;
      }
      if (originalAmount) {
        amountInput.value = originalAmount;
      }
      
      // Hide edit view, show display view
      editView.style.display = 'none';
      displayView.style.display = 'flex';
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
      setupDashboard(true); // Recreate the chart with new type
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
    themeToggle.textContent = getTranslation('lightMode');
  } else {
    themeToggle.textContent = getTranslation('darkMode');
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
  const saturation = Math.floor(Math.random() * 31) + 50; // 50-80% (softer, less vibrant)
  
  // Adjust lightness based on theme - lighter colors for better visibility
  const isDark = currentTheme === 'dark';
  const lightness = isDark 
    ? Math.floor(Math.random() * 26) + 55  // 55-80% (lighter for dark theme)
    : Math.floor(Math.random() * 21) + 65; // 65-85% (lighter for light theme)
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Helper function to generate a random dark color (kept for backward compatibility)
function getRandomDarkColor() {
  return getRandomColor();
}

// Language Functions
function initializeLanguage() {
  // Check localStorage for saved language preference, or use browser language
  const savedLanguage = localStorage.getItem('language');
  const browserLanguage = navigator.language || navigator.userLanguage;
  
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'nl')) {
    currentLanguage = savedLanguage;
  } else if (browserLanguage.startsWith('nl')) {
    currentLanguage = 'nl';
  } else {
    currentLanguage = 'en'; // Default to English
  }
  
  applyTranslations();
  // Update HTML lang attribute
  document.documentElement.lang = currentLanguage;
  // Update language button tooltip
  updateLanguageButtonTooltip();
}

function getTranslation(key) {
  return translations[currentLanguage][key] || translations['en'][key] || key;
}

function updateLanguageButtonTooltip() {
  const languageToggleBtn = document.getElementById('languageToggleBtn');
  if (languageToggleBtn) {
    const languageName = currentLanguage === 'nl' ? 'Nederlands' : 'English';
    languageToggleBtn.title = `${getTranslation('language')}: ${languageName}`;
  }
}

function applyTranslations() {
  // Update page title
  document.title = getTranslation('pageTitle');
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key);
    
    if (element.tagName === 'INPUT' && element.type !== 'submit' && element.type !== 'button') {
      // For input elements, update placeholder
      if (element.hasAttribute('placeholder')) {
        element.placeholder = translation;
      }
    } else if (element.tagName === 'BUTTON' || element.type === 'submit') {
      // For buttons, update text content
      element.textContent = translation;
    } else if (element.tagName === 'OPTION') {
      // For options, update text content but keep value
      element.textContent = translation;
    } else if (element.tagName === 'LABEL') {
      // For labels, update text content but preserve structure
      if (element.children.length === 0) {
        element.textContent = translation;
      }
      // If label has children, don't change it (let specific handlers deal with it)
    } else if (element.id === 'usernameDisplay') {
      // Don't translate the username display
      return;
    } else {
      // For other elements, update text content
      // But preserve child elements with IDs
      const childrenWithIds = Array.from(element.children).filter(child => child.id);
      if (childrenWithIds.length === 0) {
        element.textContent = translation;
      } else {
        // Only update text nodes, not children with IDs
        const textNodes = Array.from(element.childNodes).filter(node => 
          node.nodeType === Node.TEXT_NODE && node.textContent.trim() && 
          !Array.from(element.children).some(child => child.contains(node))
        );
        // For elements like welcome message, handle specially
        if (element.id !== 'welcomeMessage') {
          // Clear existing text and add translation
          textNodes.forEach(node => {
            if (!childrenWithIds.some(child => child.contains(node))) {
              node.remove();
            }
          });
          // Insert translation at the beginning if no text exists
          if (element.firstChild && element.firstChild.nodeType !== Node.TEXT_NODE) {
            element.insertBefore(document.createTextNode(translation + ' '), element.firstChild);
          } else if (textNodes.length === 0) {
            element.textContent = translation;
          }
        }
      }
    }
  });
  
  // Update chart label
  if (myChart && myChart.data.datasets[0]) {
    myChart.data.datasets[0].label = getTranslation('cost');
    myChart.update();
  }
  
  // Update theme toggle button
  updateThemeToggleButton();
  
  // Update chart type selector options
  updateChartTypeSelectorOptions();
  
  // Update welcome message
  if (currentUsername) {
    updateWelcomeMessage();
  }
  
  // Update language button tooltip
  updateLanguageButtonTooltip();
}

function updateChartTypeSelectorOptions() {
  const chartTypeSelect = document.getElementById('chartTypeSelect');
  if (chartTypeSelect) {
    const options = Array.from(chartTypeSelect.options);
    options.forEach(option => {
      const i18nKey = option.getAttribute('data-i18n');
      if (i18nKey) {
        option.textContent = getTranslation(i18nKey);
      }
    });
  }
  
  // Also update language selector options
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    const options = Array.from(languageSelect.options);
    options.forEach(option => {
      const i18nKey = option.getAttribute('data-i18n');
      if (i18nKey) {
        option.textContent = getTranslation(i18nKey);
      }
    });
  }
}

function setupLanguageSelector() {
  const languageToggleBtn = document.getElementById('languageToggleBtn');
  const languageSelector = document.getElementById('languageSelector');
  const languageSelect = document.getElementById('languageSelect');
  const setDefaultBtn = document.getElementById('setDefaultLanguageBtn');
  
  // Initialize: hide selector if language is already set
  if (languageSelector) {
    languageSelector.classList.remove('show');
  }
  
  // Toggle button click handler
  if (languageToggleBtn) {
    languageToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (languageSelector) {
        languageSelector.classList.toggle('show');
      }
    });
  }
  
  // Close selector when clicking outside
  document.addEventListener('click', (e) => {
    if (languageSelector && languageToggleBtn) {
      if (!languageSelector.contains(e.target) && !languageToggleBtn.contains(e.target)) {
        languageSelector.classList.remove('show');
      }
    }
  });
  
  if (languageSelect) {
    languageSelect.value = currentLanguage;
    languageSelect.addEventListener('change', (event) => {
      changeLanguage(event.target.value);
      // Hide selector after language is chosen
      if (languageSelector) {
        setTimeout(() => {
          languageSelector.classList.remove('show');
        }, 300);
      }
    });
  }
  
  if (setDefaultBtn) {
    setDefaultBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      localStorage.setItem('language', currentLanguage);
      // Show feedback
      const message = currentLanguage === 'nl' 
        ? 'Taal ingesteld als standaard' 
        : 'Language set as default';
      alert(message);
      // Hide selector after setting default
      if (languageSelector) {
        setTimeout(() => {
          languageSelector.classList.remove('show');
        }, 300);
      }
    });
  }
}

function changeLanguage(lang) {
  if (lang === 'en' || lang === 'nl') {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    updateLanguageButtonTooltip();
    
    // Update language selector if it exists
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = lang;
    }
    
    // Update chart if it exists
    if (myChart) {
      if (myChart.data.datasets[0]) {
        myChart.data.datasets[0].label = getTranslation('cost');
      }
      myChart.update();
    }
    
    // Re-render cost list to update delete buttons if dashboard is visible
    const costList = document.getElementById('costList');
    if (costList && costList.parentElement.offsetParent !== null) {
      // Only fetch if user is authenticated (costList is visible)
      if (getAuthToken()) {
        fetchData().then(data => {
          renderCostList(data);
        }).catch(err => {
          console.error('Error fetching data for language update:', err);
        });
      }
    }
  }
}
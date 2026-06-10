/**
 * JOB HUNTERS — SCRIPT.JS
 * Premium Loading Page Animations & Form Logic
 */

window.addEventListener('load', () => {
  // Ensure elements are present
  const loadingScreen = document.getElementById('loadingScreen');
  const pageWrapper = document.getElementById('pageWrapper');
  const progressBar = document.getElementById('progressBar');
  const loadPercentage = document.getElementById('loadPercentage');
  const loaderHand = document.querySelector('.loader-hand');
  const dynamicLoadText = document.getElementById('dynamicLoadText');

  // Initialize display states
  loadingScreen.style.display = 'flex';
  pageWrapper.style.display = 'none';

  // Configuration
  const targetDuration = 3500; // Simulated loading time in milliseconds
  let currentProgress = 0;
  let currentStatusText = "Finding Opportunities...";
  const strokeDashArrayVal = 283; // 2 * PI * r (approx)

  // Set initial status text opacity
  if (dynamicLoadText) {
    dynamicLoadText.style.opacity = '1';
    dynamicLoadText.style.transition = 'opacity 0.3s ease';
  }

  // Update status text with a smooth fade transition
  function changeStatusText(newText) {
    if (!dynamicLoadText || dynamicLoadText.textContent === newText) return;
    
    dynamicLoadText.style.opacity = '0';
    setTimeout(() => {
      dynamicLoadText.textContent = newText;
      dynamicLoadText.style.opacity = '1';
    }, 300);
  }

  // Update the progress bar, percentage text, and SVG circle hand
  function updateLoaderUI(progress) {
    const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
    
    // Update numeric percentage
    if (loadPercentage) {
      loadPercentage.textContent = `${clampedProgress}%`;
    }
    
    // Update horizontal progress bar width
    if (progressBar) {
      progressBar.style.width = `${clampedProgress}%`;
    }
    
    // Update rotating elegant circular loader hand (stroke-dashoffset)
    if (loaderHand) {
      const offset = strokeDashArrayVal - (clampedProgress / 100) * strokeDashArrayVal;
      loaderHand.style.strokeDashoffset = offset;
    }

    // Dynamic text changes based on progress stages
    if (clampedProgress < 35) {
      changeStatusText("Finding Opportunities...");
    } else if (clampedProgress >= 35 && clampedProgress < 70) {
      changeStatusText("Matching Skills...");
    } else {
      changeStatusText("Preparing Dashboard...");
    }
  }

  // Linear interpolation function for smooth step timing
  const startTime = performance.now();

  function animateLoader(timestamp) {
    const elapsed = timestamp - startTime;
    
    // Calculate progress with a slight cubic easing for natural loading speed drops and rises
    const linearProgress = elapsed / targetDuration;
    // Cubic Out easing: slow down towards the end to feel analytical
    const easeProgress = 1 - Math.pow(1 - Math.min(1, linearProgress), 3);
    
    currentProgress = easeProgress * 100;

    // Apply the progress update
    updateLoaderUI(currentProgress);

    if (elapsed < targetDuration) {
      requestAnimationFrame(animateLoader);
    } else {
      // Ensure it hits exactly 100%
      updateLoaderUI(100);
      
      // Delay transition slightly for visual closure
      setTimeout(transitionToMainPage, 400);
    }
  }

  // Start the loading animation
  requestAnimationFrame(animateLoader);

  // Transition from loader to main application form
  function transitionToMainPage() {
    // Reveal the main content wrapper
    pageWrapper.style.display = 'block';
    
    // Fade out the loader screen
    loadingScreen.style.opacity = '0';
    
    // Once transition completes, hide loadingScreen element from layout
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      
      // Check and show custom PWA installation prompt
      if (typeof showPwaPromptIfAvailable === 'function') {
        showPwaPromptIfAvailable();
      }
    }, 800); // Matches the 0.8s transition duration in CSS
  }
});

// Register Service Worker for PWA offline support and installation capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('[PWA] ServiceWorker registered successfully on scope:', registration.scope);
      })
      .catch(error => {
        console.error('[PWA] ServiceWorker registration failed:', error);
      });
  });
}

// ── Custom PWA Installation Prompt Logic ──
let deferredPrompt;
const pwaInstallBanner = document.getElementById('pwaInstallBanner');
const btnPwaInstall = document.getElementById('btnPwaInstall');
const btnPwaDismiss = document.getElementById('btnPwaDismiss');

// Intercept browser's native install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  console.log('[PWA] beforeinstallprompt event captured');
  
  // Show prompt if load transition is already completed
  const pageWrapper = document.getElementById('pageWrapper');
  if (pageWrapper && pageWrapper.style.display === 'block') {
    showPwaPromptIfAvailable();
  }
});

// Show the custom premium PWA banner
function showPwaPromptIfAvailable() {
  if (!deferredPrompt || !pwaInstallBanner) return;

  // Check localStorage to respect user dismissal choice
  if (localStorage.getItem('pwaPromptDismissed') === 'true') {
    return;
  }

  // Display the banner using flex layout, then slide it in after a small delay
  pwaInstallBanner.style.display = 'flex';
  setTimeout(() => {
    pwaInstallBanner.classList.add('show');
  }, 100);
}

// Trigger installation when user clicks "Install App"
if (btnPwaInstall) {
  btnPwaInstall.addEventListener('click', () => {
    if (!deferredPrompt || !pwaInstallBanner) return;

    // Slide banner out
    pwaInstallBanner.classList.remove('show');
    setTimeout(() => {
      pwaInstallBanner.style.display = 'none';
    }, 600);

    // Show native prompt
    deferredPrompt.prompt();

    // Check user decision
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the installation');
      } else {
        console.log('[PWA] User dismissed the installation');
      }
      deferredPrompt = null;
    });
  });
}

// Dismiss custom prompt when user clicks "Maybe Later"
if (btnPwaDismiss) {
  btnPwaDismiss.addEventListener('click', () => {
    if (!pwaInstallBanner) return;

    // Slide banner out
    pwaInstallBanner.classList.remove('show');
    setTimeout(() => {
      pwaInstallBanner.style.display = 'none';
    }, 600);

    // Save choice in localStorage to prevent annoying prompts
    localStorage.setItem('pwaPromptDismissed', 'true');
    console.log('[PWA] Install prompt dismissed by user');
  });
}

// Handle successful install event
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  deferredPrompt = null;
  if (pwaInstallBanner) {
    pwaInstallBanner.classList.remove('show');
    setTimeout(() => {
      pwaInstallBanner.style.display = 'none';
    }, 600);
  }
});

// ── FORM VALIDATION & SUBMISSION ──
const form = document.getElementById('applicationForm');
const submitBtn = document.getElementById('submitBtn');
const btnSpinner = document.getElementById('btnSpinner');
const btnLabel = document.querySelector('.btn-label');
const btnArrow = document.querySelector('.btn-arrow');
const successScreen = document.getElementById('successScreen');
const formCard = document.getElementById('formCard');

// Reference conditional fields
const refYesRadio = document.getElementById('ref-yes');
const refNoRadio = document.getElementById('ref-no');
const referenceBox = document.getElementById('reference-box');

// File upload functionality
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('resumeFile');
const uploadEmpty = document.getElementById('uploadEmpty');
const uploadPreview = document.getElementById('uploadPreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFile');
const browseBtn = document.getElementById('browseBtn');

// Handle file selection
function handleFileSelect(file) {
  if (file) {
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please upload a PDF, DOC, or DOCX file');
      fileInput.value = '';
      return;
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      fileInput.value = '';
      return;
    }
    
    // Show file preview
    uploadEmpty.style.display = 'none';
    uploadPreview.style.display = 'flex';
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// File input change event
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });
}

// Drag and drop events
if (uploadZone) {
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  
  uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
}

// Browse button click
if (browseBtn) {
  browseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
  });
}

// Remove file button
if (removeFileBtn) {
  removeFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.value = '';
    uploadEmpty.style.display = 'block';
    uploadPreview.style.display = 'none';
  });
}

// Show/hide reference box based on selection
function toggleReferenceBox() {
  if (refYesRadio && refYesRadio.checked) {
    referenceBox.style.display = 'block';
  } else {
    referenceBox.style.display = 'none';
  }
}

if (refYesRadio && refNoRadio) {
  refYesRadio.addEventListener('change', toggleReferenceBox);
  refNoRadio.addEventListener('change', toggleReferenceBox);
}

// Form validation
function validateForm() {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    const fieldGroup = field.closest('.field-group') || field.closest('.terms-agree-wrap');
    const errorMsg = fieldGroup ? fieldGroup.querySelector('.err-msg') : null;
    
    // Reset error state
    if (field.type !== 'radio' && field.type !== 'checkbox') {
      field.classList.remove('invalid');
    }
    if (errorMsg) errorMsg.textContent = '';
    
    // Check if field is empty
    if (field.type === 'radio' || field.type === 'checkbox') {
      const radioGroup = form.querySelectorAll(`[name="${field.name}"]`);
      const isChecked = Array.from(radioGroup).some(radio => radio.checked);
      if (!isChecked) {
        isValid = false;
        if (errorMsg) errorMsg.textContent = 'This field is required';
      }
    } else if (!field.value.trim()) {
      isValid = false;
      field.classList.add('invalid');
      if (errorMsg) errorMsg.textContent = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        isValid = false;
        field.classList.add('invalid');
        if (errorMsg) errorMsg.textContent = 'Please enter a valid email address';
      }
    }
    
    // Phone validation (Pakistan format: 0000 0000000)
    if (field.type === 'tel' && field.value.trim()) {
      const phoneRegex = /^\d{4}\s\d{7}$/;
      if (!phoneRegex.test(field.value.trim())) {
        isValid = false;
        field.classList.add('invalid');
        if (errorMsg) errorMsg.textContent = 'Format: 0000 0000000';
      }
    }
    
    // Date validation (DD-MM-YYYY)
    if (field.id === 'memberSince' && field.value.trim()) {
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(field.value.trim())) {
        isValid = false;
        field.classList.add('invalid');
        if (errorMsg) errorMsg.textContent = 'Format: DD-MM-YYYY';
      }
    }
  });
  
  // File upload validation
  const fileInput = document.getElementById('resumeFile');
  if (fileInput && !fileInput.files.length) {
    const fileGroup = fileInput.closest('.field-group');
    const errorMsg = fileGroup ? fileGroup.querySelector('.err-msg') : null;
    isValid = false;
    if (errorMsg) errorMsg.textContent = 'Please upload your resume';
  } else if (fileInput && fileInput.files.length) {
    const file = fileInput.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const fileGroup = fileInput.closest('.field-group');
      const errorMsg = fileGroup ? fileGroup.querySelector('.err-msg') : null;
      isValid = false;
      if (errorMsg) errorMsg.textContent = 'File size must be less than 5MB';
    }
  }
  
  return isValid;
}

// Form submission handler
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstError = form.querySelector('.invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnLabel.style.display = 'none';
    btnArrow.style.display = 'none';
    btnSpinner.style.display = 'flex';
    
    // Prepare form data
    const formData = new FormData(form);
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success screen
        form.style.display = 'none';
        successScreen.style.display = 'flex';
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting your application. Please try again or contact us directly at jobhunterspak@gmail.com');
      
      // Reset button state
      submitBtn.disabled = false;
      btnLabel.style.display = 'flex';
      btnArrow.style.display = 'flex';
      btnSpinner.style.display = 'none';
    }
  });
}

// Reset form function
function resetForm() {
  form.reset();
  form.style.display = 'block';
  successScreen.style.display = 'none';
  submitBtn.disabled = false;
  btnLabel.style.display = 'flex';
  btnArrow.style.display = 'flex';
  btnSpinner.style.display = 'none';
  
  // Reset file upload UI
  const uploadEmpty = document.getElementById('uploadEmpty');
  const uploadPreview = document.getElementById('uploadPreview');
  if (uploadEmpty) uploadEmpty.style.display = 'block';
  if (uploadPreview) uploadPreview.style.display = 'none';
  
  // Reset reference box
  if (referenceBox) referenceBox.style.display = 'none';
  
  // Clear all error messages
  const errorMessages = form.querySelectorAll('.err-msg');
  errorMessages.forEach(msg => msg.textContent = '');
  
  // Remove invalid classes
  const invalidFields = form.querySelectorAll('.invalid');
  invalidFields.forEach(field => field.classList.remove('invalid'));
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
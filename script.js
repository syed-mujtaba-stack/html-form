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
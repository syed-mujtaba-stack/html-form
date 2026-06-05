window.addEventListener('load', () => {
  // Show loading screen
  document.getElementById('loadingScreen').style.display = 'flex';
  document.getElementById('pageWrapper').style.display = 'none';

  // Animate logo fly-in
  const loadingLogo = document.getElementById('loadingLogo');
  const loadingTitle = document.getElementById('loadingTitle');
  const letters = loadingTitle.querySelectorAll('.letter');

  // Fly in logo
  setTimeout(() => {
    loadingLogo.style.animation = 'flyIn 1s forwards';
    loadingLogo.style.opacity = '1';
  }, 50);

  // Set CSS custom properties for animation delays
  letters.forEach((letter, index) => {
    letter.style.setProperty('--i', index);
  });

  // Transition to main content after 10 seconds with fade
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.transition = 'opacity 1s ease';
    loadingScreen.style.opacity = '0';

    setTimeout(() => {
      loadingScreen.style.display = 'none';
      document.getElementById('pageWrapper').style.display = 'block';
    }, 1000);
  }, 10000);
});
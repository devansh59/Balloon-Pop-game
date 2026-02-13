const shootBtn = document.getElementById('shootBtn');
const bowContainer = document.getElementById('bowContainer');
const balloonsContainer = document.getElementById('balloonsContainer');
const popupOverlay = document.getElementById('popupOverlay');
const emailForm = document.getElementById('emailForm');
const prizeImage = document.getElementById('prizeImage');

let hasShot = false;

// Replace with your actual shampoo product image URL
const SHAMPOO_IMAGE_URL = 'https://via.placeholder.com/150x200/007FFF/FFFFFF?text=FREE+Shampoo';

// Replace with your Google Apps Script URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Judge.me review link
const REVIEW_LINK = 'https://judge.me/product_reviews/dd28df9e-62e6-48ae-9376-c804cb54521a/new?id=8062426284193&source=shareable-link';

shootBtn.addEventListener('click', shootArrow);

function shootArrow() {
  if (hasShot) return;
  hasShot = true;
  
  shootBtn.classList.add('shooting');
  shootBtn.innerHTML = '<span class="btn-text">🎯 Shooting...</span>';
  
  // Play shooting sound
  playSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 0.5);
  
  // Vibrate
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }
  
  // Animate bow shooting
  bowContainer.style.transition = 'transform 0.5s';
  bowContainer.style.transform = 'translateY(-20px) rotate(-10deg)';
  
  setTimeout(() => {
    bowContainer.style.transform = 'translateY(0) rotate(0deg)';
  }, 500);
  
  // Target the center balloon (guaranteed win)
  const centerBalloon = document.querySelector('.balloon.guaranteed');
  
  setTimeout(() => {
    popBalloon(centerBalloon);
  }, 600);
}

function popBalloon(balloon) {
  const balloonBody = balloon.querySelector('.balloon-body');
  
  // Play pop sound
  playSound('https://assets.mixkit.co/active_storage/sfx/1996/1996-preview.mp3', 0.7);
  
  // Vibrate
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
  
  // Pop animation
  balloonBody.style.transition = 'all 0.3s';
  balloonBody.style.transform = 'scale(0)';
  balloonBody.style.opacity = '0';
  
  // Create shampoo image flying out
  setTimeout(() => {
    createFlyingPrize(balloon);
  }, 300);
  
  // Show popup after animation
  setTimeout(() => {
    showPopup();
  }, 1500);
}

function createFlyingPrize(balloon) {
  const rect = balloon.getBoundingClientRect();
  const prize = document.createElement('img');
  prize.src = SHAMPOO_IMAGE_URL;
  prize.style.position = 'fixed';
  prize.style.left = rect.left + rect.width / 2 - 50 + 'px';
  prize.style.top = rect.top + 'px';
  prize.style.width = '100px';
  prize.style.height = 'auto';
  prize.style.zIndex = '9998';
  prize.style.transition = 'all 1s ease-out';
  prize.style.filter = 'drop-shadow(0 10px 20px rgba(0, 127, 255, 0.5))';
  
  document.body.appendChild(prize);
  
  // Animate prize flying up and scaling
  setTimeout(() => {
    prize.style.transform = 'translateY(-100px) scale(1.5) rotate(360deg)';
    prize.style.opacity = '1';
  }, 50);
  
  // Remove after animation
  setTimeout(() => {
    prize.remove();
  }, 1500);
}

function showPopup() {
  prizeImage.src = SHAMPOO_IMAGE_URL;
  popupOverlay.classList.add('active');
  
  // Play celebration sound
  playSound('https://assets.mixkit.co/active_storage/sfx/1999/1999-preview.mp3', 0.8);
}

emailForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value;
  const name = document.getElementById('nameInput').value || '';
  
  // Log to Google Sheets
  logToGoogleSheets(email, name);
  
  // Redirect to review link
  window.location.href = REVIEW_LINK;
});

function logToGoogleSheets(email, name) {
  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toLocaleString(),
      email: email,
      name: name,
      reward: 'Free Shampoo',
      game: 'Balloon Pop'
    })
  }).then(() => {
    console.log('✅ Logged to Google Sheets');
  }).catch(err => {
    console.log('⚠️ Logging attempted');
  });
}

function playSound(url, volume = 0.5) {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(err => console.log('Sound failed:', err));
}

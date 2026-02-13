const shootBtn = document.getElementById('shootBtn');
const bowContainer = document.getElementById('bowContainer');
const bow = document.querySelector('.bow');
const balloonsContainer = document.getElementById('balloonsContainer');
const messageDisplay = document.getElementById('messageDisplay');
const tryAgainPopup = document.getElementById('tryAgainPopup');
const winnerPopup = document.getElementById('winnerPopup');
const continueBtn = document.getElementById('continueBtn');
const emailForm = document.getElementById('emailForm');
const prizeImage = document.getElementById('prizeImage');

// Replace with your actual shampoo product image URL
const SHAMPOO_IMAGE_URL = 'https://github.com/devansh59/Balloon-Pop-game/blob/main/02_MycoPet_Bugoff_V1-removebg-preview.png?raw=true';

// Replace with your Google Apps Script URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Judge.me review link
const REVIEW_LINK = 'https://judge.me/product_reviews/dd28df9e-62e6-48ae-9376-c804cb54521a/new?id=8062426284193&source=shareable-link';

let currentBalloonIndex = 0;
let isShooting = false;

const balloons = document.querySelectorAll('.balloon');

shootBtn.addEventListener('click', shootArrow);
continueBtn.addEventListener('click', closePopup);

function shootArrow() {
  if (isShooting) return;
  
  // Find next available balloon
  const availableBalloons = Array.from(balloons).filter(b => !b.classList.contains('popped'));
  if (availableBalloons.length === 0) return;
  
  const targetBalloon = availableBalloons[0];
  
  isShooting = true;
  shootBtn.disabled = true;
  shootBtn.innerHTML = '<span class="btn-text">🏹 Shooting...</span>';
  
  // Play bow release sound (archery sound)
  playSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', 0.6);
  
  // Vibrate
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }
  
  // Animate bow shooting
  bow.classList.add('shooting');
  
  setTimeout(() => {
    bow.classList.remove('shooting');
    popBalloon(targetBalloon);
  }, 600);
}

function popBalloon(balloon) {
  const balloonBody = balloon.querySelector('.balloon-body');
  const hasPrize = balloon.dataset.hasPrize === 'true';
  
  // Play balloon pop sound
  playSound('https://assets.mixkit.co/active_storage/sfx/1723/1723-preview.mp3', 0.7);
  
  // Vibrate
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
  
  // Pop animation
  balloon.classList.add('popped');
  balloonBody.style.transition = 'all 0.4s';
  balloonBody.style.transform = 'scale(0)';
  balloonBody.style.opacity = '0';
  
  setTimeout(() => {
    if (hasPrize) {
      // Winner!
      createFlyingPrize(balloon);
      setTimeout(() => {
        showWinnerPopup();
      }, 1800);
    } else {
      // Try again
      showTryAgainMessage();
      setTimeout(() => {
        showTryAgainPopup();
      }, 1200);
    }
  }, 400);
}

function showTryAgainMessage() {
  messageDisplay.innerHTML = '😅 Oops! Try Again!';
  messageDisplay.style.color = '#C44569';
  messageDisplay.style.animation = 'shake 0.5s';
  
  setTimeout(() => {
    messageDisplay.style.animation = '';
  }, 500);
}

function showTryAgainPopup() {
  tryAgainPopup.classList.add('active');
  playSound('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', 0.5);
}

function closePopup() {
  tryAgainPopup.classList.remove('active');
  messageDisplay.innerHTML = '';
  isShooting = false;
  shootBtn.disabled = false;
  shootBtn.innerHTML = '<span class="btn-text">🎯 SHOOT!</span>';
}

function createFlyingPrize(balloon) {
  const rect = balloon.getBoundingClientRect();
  const prize = document.createElement('img');
  prize.src = SHAMPOO_IMAGE_URL;
  prize.style.position = 'fixed';
  prize.style.left = rect.left + rect.width / 2 - 60 + 'px';
  prize.style.top = rect.top + 'px';
  prize.style.width = '120px';
  prize.style.height = 'auto';
  prize.style.zIndex = '9998';
  prize.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
  prize.style.filter = 'drop-shadow(0 10px 30px rgba(255, 217, 61, 0.6))';
  
  document.body.appendChild(prize);
  
  // Animate prize flying up and scaling
  setTimeout(() => {
    prize.style.transform = 'translateY(-150px) scale(1.8) rotate(720deg)';
    prize.style.opacity = '1';
  }, 50);
  
  // Remove after animation
  setTimeout(() => {
    prize.style.opacity = '0';
    setTimeout(() => prize.remove(), 500);
  }, 1500);
}

function showWinnerPopup() {
  prizeImage.src = SHAMPOO_IMAGE_URL;
  winnerPopup.classList.add('active');
  
  // Play victory fanfare
  playSound('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', 0.8);
  
  // Vibrate celebration
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
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

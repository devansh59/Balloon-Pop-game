const bow = document.getElementById('bow');
const bowContainer = document.getElementById('bowContainer');
const dragHint = document.getElementById('dragHint');
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

let isDragging = false;
let startY = 0;
let currentY = 0;
let isShooting = false;

const balloons = document.querySelectorAll('.balloon');

// Drag & Release Events
bow.addEventListener('mousedown', startDrag);
bow.addEventListener('touchstart', startDrag, { passive: false });

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

continueBtn.addEventListener('click', closePopup);

function startDrag(e) {
  if (isShooting) return;
  
  isDragging = true;
  bow.classList.add('dragging');
  dragHint.classList.add('hidden');
  
  const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
  startY = clientY;
  
  if (e.type === 'touchstart') {
    e.preventDefault();
  }
  
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

function drag(e) {
  if (!isDragging) return;
  
  const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
  currentY = clientY - startY;
  
  // Only allow dragging down (positive Y)
  if (currentY > 0) {
    bow.style.transform = `translateY(${Math.min(currentY, 100)}px) rotate(${Math.min(currentY / 5, 15)}deg)`;
  }
}

function endDrag(e) {
  if (!isDragging) return;
  
  isDragging = false;
  bow.classList.remove('dragging');
  
  // Check if dragged enough to shoot (at least 50px)
  if (currentY > 50) {
    shootArrow();
  } else {
    // Reset bow position
    bow.style.transform = '';
    dragHint.classList.remove('hidden');
  }
  
  currentY = 0;
}

function shootArrow() {
  if (isShooting) return;
  
  // Find next available balloon
  const availableBalloons = Array.from(balloons).filter(b => !b.classList.contains('popped'));
  if (availableBalloons.length === 0) return;
  
  const targetBalloon = availableBalloons[0];
  
  isShooting = true;
  
  // Vibrate
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }
  
  // Animate bow shooting
  bow.classList.add('shooting');
  bow.style.transform = '';
  
  setTimeout(() => {
    bow.classList.remove('shooting');
    popBalloon(targetBalloon);
  }, 600);
}

function popBalloon(balloon) {
  const balloonBody = balloon.querySelector('.balloon-body');
  const hasPrize = balloon.dataset.hasPrize === 'true';
  
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
}

function closePopup() {
  tryAgainPopup.classList.remove('active');
  messageDisplay.innerHTML = '';
  isShooting = false;
  dragHint.classList.remove('hidden');
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

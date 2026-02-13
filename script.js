const arrow = document.getElementById('arrow');
const dragHint = document.getElementById('dragHint');
const balloonsContainer = document.getElementById('balloonsContainer');
const messageDisplay = document.getElementById('messageDisplay');
const winnerPopup = document.getElementById('winnerPopup');
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

// Drag & Release Events (Arrow Only)
arrow.addEventListener('mousedown', startDrag);
arrow.addEventListener('touchstart', startDrag, { passive: false });

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function startDrag(e) {
  if (isShooting) return;
  
  isDragging = true;
  arrow.classList.add('dragging');
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
    const dragAmount = Math.min(currentY, 100);
    arrow.style.transform = `translateX(-50%) translateY(${dragAmount}px) rotate(90deg)`;
  }
}

function endDrag(e) {
  if (!isDragging) return;
  
  isDragging = false;
  arrow.classList.remove('dragging');
  
  // Check if dragged enough to shoot (at least 50px)
  if (currentY > 50) {
    shootArrow();
  } else {
    // Reset arrow position
    arrow.style.transform = 'translateX(-50%) rotate(90deg)';
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
  
  // Animate arrow shooting
  arrow.classList.add('shooting');
  arrow.style.transform = 'translateX(-50%) rotate(90deg)';
  
  setTimeout(() => {
    arrow.classList.remove('shooting');
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
      // Try again - just show message, no popup
      showTryAgainMessage();
      setTimeout(() => {
        // Auto reset for next shot
        messageDisplay.innerHTML = '';
        isShooting = false;
        dragHint.classList.remove('hidden');
      }, 2000);
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

function createFlyingPrize(balloon) {
  const rect = balloon.getBoundingClientRect();
  const prize = document.createElement('img');
  prize.src = SHAMPOO_IMAGE_URL;
  prize.style.position = 'fixed';
  prize.style.left = rect.left + rect

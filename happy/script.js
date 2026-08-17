/**
 * Independence Day Greeting Generator — Application Logic
 * Institution: Shree Venkateshwara Group of Institutions
 */

// Storage Configuration
const STORAGE_KEY = 'svg_indep_greeting_data';

// Application State
let appState = {
  photoDataUrl: null,
  userName: '',
  zoom: 1
};

// Banner Geometry Constants (Derived from 576 x 1024 Native Banner)
const BANNER_SPECS = {
  width: 576,
  height: 1024,
  circleCenterX: 288,
  circleCenterY: 667,
  circleRadius: 115,
  nameBadgeY: 792
};

/* ==========================================================================
   Page Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Detect Current Page
  const isGreetingPage = window.location.pathname.includes('greeting.html') || document.getElementById('posterFrame') !== null;

  if (isGreetingPage) {
    initGreetingPage();
  } else {
    initLandingPage();
  }
});

/* ==========================================================================
   PAGE 1 — Landing Page Logic
   ========================================================================== */

function initLandingPage() {
  const dropzone = document.getElementById('photoDropzone');
  const nameInput = document.getElementById('userNameInput');

  if (!dropzone) return;

  // Restore prior session data if available
  try {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.photoDataUrl) {
        setPhotoPreview(parsed.photoDataUrl);
      }
      if (parsed.userName && nameInput) {
        nameInput.value = parsed.userName;
        appState.userName = parsed.userName;
      }
      if (parsed.zoom) {
        appState.zoom = parsed.zoom;
        const zoomSlider = document.getElementById('photoZoomRange');
        if (zoomSlider) {
          zoomSlider.value = parsed.zoom;
          handleZoomChange(parsed.zoom);
        }
      }
    }
  } catch (err) {
    console.warn('Session data read error:', err);
  }

  // Setup Drag and Drop Listeners
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  });
}

function triggerPhotoSelect() {
  const input = document.getElementById('photoInput');
  if (input) {
    input.value = '';
    input.click();
  }
}

function handlePhotoUpload(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    processSelectedFile(files[0]);
  }
}

function processSelectedFile(file) {
  // Validate File Type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    showValidation('Please upload a valid image (JPG, JPEG or PNG).');
    return;
  }

  hideValidation();

  // Read as DataURL
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    setPhotoPreview(dataUrl);
  };
  reader.onerror = () => {
    showValidation('Failed to read image file. Please try another photo.');
  };
  reader.readAsDataURL(file);
}

function setPhotoPreview(dataUrl) {
  appState.photoDataUrl = dataUrl;

  const dropzone = document.getElementById('photoDropzone');
  const preview = document.getElementById('photoPreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const btnChange = document.getElementById('btnChangePhoto');
  const adjuster = document.getElementById('photoAdjuster');

  if (preview) {
    preview.src = dataUrl;
    preview.classList.add('visible');
  }
  if (dropzone) {
    dropzone.classList.add('has-photo');
  }
  if (placeholder) {
    placeholder.style.display = 'none';
  }
  if (btnChange) {
    btnChange.classList.add('visible');
  }
  if (adjuster) {
    adjuster.classList.add('visible');
  }

  hideValidation();
}

function handleZoomChange(val) {
  appState.zoom = parseFloat(val);
  const preview = document.getElementById('photoPreview');
  const text = document.getElementById('zoomValText');
  if (preview) {
    preview.style.transform = `scale(${appState.zoom})`;
  }
  if (text) {
    text.textContent = `${Math.round(appState.zoom * 100)}%`;
  }
}

function handleNameInput(input) {
  appState.userName = input.value;
  hideValidation();
}

function showValidation(message) {
  const alertBox = document.getElementById('validationAlert');
  const text = document.getElementById('validationText');
  if (alertBox && text) {
    text.textContent = message;
    alertBox.classList.add('visible');
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function hideValidation() {
  const alertBox = document.getElementById('validationAlert');
  if (alertBox) {
    alertBox.classList.remove('visible');
  }
}

function handleProcess() {
  const nameInput = document.getElementById('userNameInput');
  const trimmedName = (nameInput ? nameInput.value : appState.userName || '').trim();

  // Validate Photo
  if (!appState.photoDataUrl) {
    showValidation('Please upload your photo.');
    return;
  }

  // Validate Name
  if (!trimmedName) {
    showValidation('Please enter your name.');
    if (nameInput) nameInput.focus();
    return;
  }

  hideValidation();

  // Store in Session
  appState.userName = trimmedName.toUpperCase();
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.error('Failed to save to sessionStorage:', e);
  }

  // Navigate to Page 2
  window.location.href = 'greeting.html';
}

/* ==========================================================================
   PAGE 2 — Greeting Display & Poster Logic
   ========================================================================== */

function initGreetingPage() {
  const bannerPhoto = document.getElementById('bannerUserPhoto');
  const bannerName = document.getElementById('bannerUserNameDisplay');

  let data = null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      data = JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error reading greeting state:', err);
  }

  // If no data is present, prompt or fallback gracefully
  if (!data || !data.photoDataUrl || !data.userName) {
    // Provide sample fallback or redirect
    alert('Please upload your photo and enter your name first.');
    window.location.href = 'index.html';
    return;
  }

  // Populate Page Elements
  if (bannerPhoto) {
    bannerPhoto.src = data.photoDataUrl;
    if (data.zoom && data.zoom > 1) {
      bannerPhoto.style.transform = `scale(${data.zoom})`;
    }
  }

  if (bannerName) {
    bannerName.innerHTML = `<span class="gold-dot">★</span> ${escapeHtml(data.userName)} <span class="gold-dot">★</span>`;
  }

  // Trigger celebration confetti
  startConfettiCelebration();
}

function handleCreateAnother() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  window.location.href = 'index.html';
}

/* ==========================================================================
   High-Definition Canvas Poster Export & Download
   ========================================================================== */

async function generateCompositeCanvas(scale = 2) {
  // Render at 2x resolution (1152 x 2048) for ultra-sharp HD download
  let data = null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) data = JSON.parse(saved);
  } catch (e) {}

  if (!data) return null;

  const canvas = document.getElementById('exportCanvas') || document.createElement('canvas');
  const targetWidth = BANNER_SPECS.width * scale;
  const targetHeight = BANNER_SPECS.height * scale;

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  // 1. Draw Base Banner Image
  const bannerImg = await loadImage('assets/banner.png');
  ctx.drawImage(bannerImg, 0, 0, targetWidth, targetHeight);

  // 2. Draw Circular Clipped User Photo
  const userImg = await loadImage(data.photoDataUrl);
  const cx = BANNER_SPECS.circleCenterX * scale;
  const cy = BANNER_SPECS.circleCenterY * scale;
  const radius = BANNER_SPECS.circleRadius * scale;
  const userZoom = data.zoom || 1;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  // Draw user photo with aspect-fit cover & zoom
  const imgAspect = userImg.width / userImg.height;
  let drawW, drawH, drawX, drawY;

  const circleDiameter = radius * 2;
  if (imgAspect > 1) {
    drawH = circleDiameter * userZoom;
    drawW = drawH * imgAspect;
  } else {
    drawW = circleDiameter * userZoom;
    drawH = drawW / imgAspect;
  }
  drawX = cx - drawW / 2;
  drawY = cy - drawH / 2;

  ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 3. Draw Fine Golden Rim around the Photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#fef3c7';
  ctx.stroke();
  ctx.restore();

  // 4. Draw Elegant User Name Badge on Banner
  const nameText = `★  ${data.userName}  ★`;
  const nameY = BANNER_SPECS.nameBadgeY * scale;

  ctx.save();
  const fontSize = Math.round(15 * scale);
  ctx.font = `800 ${fontSize}px "Montserrat", "Outfit", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Measure text width for badge background
  const textMetrics = ctx.measureText(nameText);
  const badgeWidth = Math.min(textMetrics.width + (32 * scale), targetWidth * 0.85);
  const badgeHeight = 30 * scale;
  const badgeX = cx - badgeWidth / 2;
  const badgeTopY = nameY - badgeHeight / 2;
  const badgeRadius = badgeHeight / 2;

  // Draw Pill Background
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeTopY, badgeWidth, badgeHeight, badgeRadius);
  ctx.fillStyle = 'rgba(6, 11, 24, 0.88)';
  ctx.fill();

  // Badge Golden Border
  ctx.lineWidth = 1.8 * scale;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.stroke();

  // Draw Name Text with Soft Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4 * scale;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(nameText, cx, nameY);
  ctx.restore();

  return canvas;
}

async function downloadHDPoster() {
  const btn = document.getElementById('btnDownloadPoster');
  const originalText = btn ? btn.innerHTML : '';

  try {
    if (btn) {
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        <span>Generating HD...</span>
      `;
      btn.disabled = true;
    }

    const canvas = await generateCompositeCanvas(2);
    if (!canvas) throw new Error('Could not generate poster');

    // Get User Name for Filename
    let data = {};
    try {
      data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    } catch(e) {}
    const sanitizedName = (data.userName || 'Independence_Day')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    // Export as PNG
    const link = document.createElement('a');
    link.download = `Independence_Day_Greeting_${sanitizedName}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error('Download error:', err);
    alert('Could not generate greeting download. Please try again.');
  } finally {
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
}

async function sharePoster() {
  const btn = document.getElementById('btnSharePoster');
  try {
    const canvas = await generateCompositeCanvas(2);
    if (!canvas) return;

    let data = {};
    try {
      data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    } catch(e) {}

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `Independence_Day_Greeting_${data.userName || 'Poster'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Independence Day Greeting',
            text: `Personalized 80th Independence Day Greeting.`,
            files: [file]
          });
          return;
        } catch (shareErr) {
          if (shareErr.name !== 'AbortError') {
            console.log('Share error:', shareErr);
          }
        }
      }

      // Fallback: Copy Image or Download
      downloadHDPoster();
    }, 'image/png');

  } catch (err) {
    console.error('Share failure:', err);
    downloadHDPoster();
  }
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}

/* ==========================================================================
   Celebratory Confetti Animation System
   ========================================================================== */

function startConfettiCelebration() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = [
    '#ff9933', // Saffron
    '#ffffff', // White
    '#138808', // Green
    '#d4af37', // Gold
    '#facc15', // Light Gold
    '#38bdf8'  // Sky Blue
  ];

  const particles = [];
  const particleCount = 70;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height * -0.6,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 2.5 + 1.2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
      opacity: 1
    });
  }

  let animationFrame;
  let startTime = Date.now();

  function renderConfetti() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.02) * p.speedX;
      p.rotation += p.rotationSpeed;

      if (elapsed > 3500) {
        p.opacity -= 0.015;
      }

      if (p.opacity > 0 && p.y < height + 20) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    });

    if (activeParticles > 0 && elapsed < 6500) {
      animationFrame = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, width, height);
      cancelAnimationFrame(animationFrame);
    }
  }

  renderConfetti();
}

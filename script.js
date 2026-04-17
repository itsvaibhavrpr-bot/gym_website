// ============================================
// THE BODY TOWN GYM & SPA — script.js
// ============================================

// ── SCROLL PROGRESS BAR ──
const scrollBar = document.getElementById('scroll-bar');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (window.scrollY / total) * 100;
  scrollBar.style.width = pct + '%';
});



// ── NAV SCROLL ──
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HAMBURGER ──
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));

// ── SMOOTH SCROLL NAV LINKS ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); navLinks.classList.remove('open'); }
  });
});

// ── THREE.JS HERO BACKGROUND ──
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.z = 5;

  // Particle field
  const particleCount = 1200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.025, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(geo, mat));

  // Grid lines (laser beams)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.15 });
  const gridGroup = new THREE.Group();
  for (let i = -8; i <= 8; i += 2) {
    const hGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10, i * 0.6, -2), new THREE.Vector3(10, i * 0.6, -2)]);
    const vGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.2, -5, -2), new THREE.Vector3(i * 1.2, 5, -2)]);
    gridGroup.add(new THREE.Line(hGeo, lineMat));
    gridGroup.add(new THREE.Line(vGeo, lineMat));
  }
  scene.add(gridGroup);

  // Moving laser beams
  const beams = [];
  const beamMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 14; i++) {
    const y = (Math.random() - 0.5) * 10;
    const bGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, y, -1), new THREE.Vector3(12, y, -1)]);
    const beam = new THREE.Line(bGeo, beamMat.clone());
    beam.userData = { speed: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1), y };
    scene.add(beam);
    beams.push(beam);
  }

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;
    gridGroup.rotation.z += 0.0003;
    beams.forEach(b => {
      b.position.y += b.userData.speed;
      if (b.position.y > 6) b.position.y = -6;
      if (b.position.y < -6) b.position.y = 6;
    });
    const pts = geo.attributes.position.array;
    for (let i = 1; i < particleCount * 3; i += 3) pts[i] += 0.001;
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ── REVEAL ON SCROLL ──
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), e.target.dataset.delay || 0);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(r => io.observe(r));

// ── COUNTER ANIMATION ──
function animateCounter(el, target, suffix) {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      animateCounter(el, parseInt(el.dataset.target), el.dataset.suffix || '');
      counterIO.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterIO.observe(el));

// ── REVIEWS SLIDER ──
const track = document.querySelector('.reviews-track');
const cards = document.querySelectorAll('.review-card');
const dots  = document.querySelectorAll('.rev-dot');
let currentRev = 0;
let autoPlay;

function goToReview(idx) {
  const cardW = cards[0]?.offsetWidth + 24 || 364;
  currentRev = (idx + cards.length) % cards.length;
  track.style.transform = `translateX(-${currentRev * cardW}px)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentRev));
}
document.getElementById('rev-prev')?.addEventListener('click', () => { goToReview(currentRev - 1); resetAuto(); });
document.getElementById('rev-next')?.addEventListener('click', () => { goToReview(currentRev + 1); resetAuto(); });
dots.forEach((d, i) => d.addEventListener('click', () => { goToReview(i); resetAuto(); }));
function resetAuto() { clearInterval(autoPlay); autoPlay = setInterval(() => goToReview(currentRev + 1), 4500); }
autoPlay = setInterval(() => goToReview(currentRev + 1), 4500);
window.addEventListener('resize', () => goToReview(currentRev));

// ── FORM SUBMIT ──
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('.btn-submit');
  btn.textContent = '✓ MESSAGE SENT!';
  btn.style.background = 'linear-gradient(135deg,#00cc55,#00ff88)';
  setTimeout(() => {
    btn.textContent = 'SEND MESSAGE';
    btn.style.background = '';
    this.reset();
  }, 3000);
});

// ── PARALLAX HERO TEXT ──
window.addEventListener('scroll', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) heroContent.style.transform = `translateY(${window.scrollY * 0.3}px)`;
});

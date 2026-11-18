/** Hachioji portfolio — small, dependency-free interactions. */
'use strict';

// Set verified public URLs here before publishing. Leave blank to show a clear notice.
const SITE_LINKS = {
  note: 'https://note.com/hachiojiiphone',
  x: 'https://x.com/hachiojiiphone'
};

const menuButton = document.querySelector('[data-menu-toggle]');
const siteNav = document.getElementById('site-nav');
const menuBackdrop = document.querySelector('[data-menu-backdrop]');

// Apple歴は2007年9月5日からの満年数で表示する。
const today = new Date();
const appleAnniversaryPassed = today.getMonth() > 8
  || (today.getMonth() === 8 && today.getDate() >= 5);
const appleYears = Math.max(0, today.getFullYear() - 2007 - (appleAnniversaryPassed ? 0 : 1));
for (const element of document.querySelectorAll('[data-apple-years]')) {
  element.textContent = String(appleYears);
}
for (const element of document.querySelectorAll('[data-apple-years-label]')) {
  element.textContent = `Apple歴 ${appleYears}年`;
}

function animateCount(element) {
  const counter = element.querySelector('[data-count-target]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!counter || reducedMotion.matches) return;

  const target = Number(counter.dataset.countTarget);
  const delay = 500;
  const duration = 1500;
  const startTime = performance.now() + delay;
  element.classList.add('is-counting');
  counter.textContent = '0K';

  function updateCount(now) {
    const progress = Math.min(Math.max((now - startTime) / duration, 0), 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    counter.textContent = `${Math.round(target * easedProgress)}K`;
    if (progress === 1 || reducedMotion.matches) {
      counter.textContent = `${target}K`;
      element.classList.remove('is-counting');
      element.classList.add('is-counted');
      return;
    }
    requestAnimationFrame(updateCount);
  }

  requestAnimationFrame(updateCount);
}

const statementElements = document.querySelectorAll('.statement-heading, .ghost, .mega');
if ('IntersectionObserver' in window) {
  const statementObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-waiting');
        entry.target.classList.add('is-visible');
        if (entry.target.matches('.mega')) animateCount(entry.target);
        statementObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.25 });

  for (const element of statementElements) {
    element.classList.add('is-waiting');
    statementObserver.observe(element);
  }
}

function setMenuOpen(open, { restoreFocus = false } = {}) {
  if (!siteNav || !menuButton || !menuBackdrop) return;
  siteNav.hidden = !open;
  menuBackdrop.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  if (open) siteNav.querySelector('a')?.focus({ preventScroll: true });
  if (!open && restoreFocus) menuButton.focus({ preventScroll: true });
}

menuButton?.addEventListener('click', () => {
  setMenuOpen(siteNav.hidden);
});
menuBackdrop?.addEventListener('click', () => setMenuOpen(false, { restoreFocus: true }));
siteNav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !siteNav.hidden) {
    setMenuOpen(false, { restoreFocus: true });
  }
});

for (const anchor of document.querySelectorAll('[data-external]')) {
  const key = anchor.dataset.external;
  const href = SITE_LINKS[key]?.trim();
  if (href) {
    anchor.href = href;
    anchor.removeAttribute('title');
    if (/^https:\/\//.test(href)) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
  } else {
    anchor.classList.add('is-unconfigured');
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      window.alert(`「${key}」のリンク先が未設定です。script.js 内の SITE_LINKS を編集してください。`);
    });
  }
}

/* =========================================================
   OPENCODE — main.js
   Handles: scroll animations, terminal typing, copy buttons
   ========================================================= */

// ── 1. NAV: add scrolled class on scroll ──────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


// ── 2. REVEAL on scroll (IntersectionObserver) ────────────
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach((el) => observer.observe(el));


// ── 3. TERMINAL TYPING ANIMATION ─────────────────────────
const typedCmd = document.getElementById('typed-cmd');
const cursor = document.getElementById('cursor');
const terminalOutput = document.getElementById('terminal-output');

const CMD = 'opencode agent -p "List all files"';

const OUTPUT_LINES = [
  { text: '⟳  Initializing agent loop...', cls: 'out-label', delay: 200 },
  { text: '→  Tool call: list_files(".")', cls: 'out-label', delay: 500 },
  { text: '✓  Found 12 files in workspace', cls: 'out-success', delay: 900 },
  { text: '→  Tool call: read_file("package.json")', cls: 'out-label', delay: 1300 },
  { text: '✓  Agent response ready', cls: 'out-success', delay: 1700 },
  { text: '    The workspace contains a Node.js CLI project...', cls: 'out-value', delay: 2000 },
];

let typingStarted = false;

function typeCommand() {
  if (typingStarted) return;
  typingStarted = true;

  let i = 0;
  const interval = setInterval(() => {
    typedCmd.textContent += CMD[i];
    i++;
    if (i >= CMD.length) {
      clearInterval(interval);
      cursor.style.display = 'none';
      showOutputLines();
    }
  }, 42);
}

function showOutputLines() {
  OUTPUT_LINES.forEach(({ text, cls, delay }) => {
    setTimeout(() => {
      const line = document.createElement('span');
      line.className = `out-line ${cls}`;
      line.textContent = text;
      terminalOutput.appendChild(line);
      // Force reflow then add visible class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          line.classList.add('visible');
        });
      });
    }, delay);
  });
}

// Start typing when terminal enters viewport
const terminal = document.getElementById('terminal-window');
if (terminal) {
  const termObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(typeCommand, 600);
        termObserver.disconnect();
      }
    },
    { threshold: 0.5 }
  );
  termObserver.observe(terminal);
}


// ── 4. COPY TO CLIPBOARD ─────────────────────────────────
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    const copyIcon = btn.querySelector('#copy-icon');
    const checkIcon = btn.querySelector('#check-icon');
    if (copyIcon) copyIcon.style.display = 'none';
    if (checkIcon) checkIcon.style.display = 'block';

    setTimeout(() => {
      btn.classList.remove('copied');
      if (copyIcon) copyIcon.style.display = 'block';
      if (checkIcon) checkIcon.style.display = 'none';
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// Hero install copy button
const copyInstallBtn = document.getElementById('copy-install-btn');
if (copyInstallBtn) {
  copyInstallBtn.addEventListener('click', () => {
    copyText('npm install -g @joshxdevs/opencode', copyInstallBtn);
  });
}

// Small copy buttons in steps
document.querySelectorAll('.copy-btn-sm').forEach((btn) => {
  btn.addEventListener('click', () => {
    const text = btn.dataset.copy;
    if (!text) return;

    const original = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    btn.classList.add('copied');

    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
    }, 2000);

    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  });
});


// ── 5. SMOOTH ACTIVE NAV HIGHLIGHT ───────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--text)'
            : '';
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((s) => sectionObserver.observe(s));

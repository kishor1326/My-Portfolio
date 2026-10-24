/**
 * Kishor Kumar Portfolio - Interactive Aceternity UI Scripts
 * Handles Spotlight effect, 3D Tilt, Scroll Reveals, Timeline, Project Modals, and Forms.
 */

// Register custom property for Aceternity Hover Border Gradient animation
if (window.CSS && CSS.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--border-angle',
      syntax: '<angle>',
      inherits: false,
      initialValue: '0deg',
    });
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initContainerTextFlip();
  initScrollReveal();
  initProjectFilters();
  initProjectModals();
  initCertificatesTabs();
  initCertificatesShowMore();
  initCertificateModalEvents();
  initCopyActions();
  initContactForm();
  initLiveClock();
  initBackToTop();
  initWobbleCards();
  new CurzrArrowPointer();
  updateCurrentYear();
});

/* ==========================================================================
   1. NAVBAR & NAVIGATION (ACETERNITY SLIDING PILL & SCROLL REVEAL)
   ========================================================================== */
function initNavbar() {
  const navWrapper = document.getElementById('navbar-wrapper');
  const nav = document.getElementById('main-nav');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');
  const navIndicator = document.getElementById('nav-indicator-pill');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  let lastScrollY = window.scrollY;
  let scrollThreshold = 10;

  // Position the sliding pill indicator
  function setIndicatorPosition(targetEl) {
    if (!targetEl || !navIndicator) return;
    const { offsetLeft, offsetWidth } = targetEl;
    navIndicator.style.transform = `translateX(${offsetLeft}px)`;
    navIndicator.style.width = `${offsetWidth}px`;
    navIndicator.style.opacity = '1';
  }

  // Initial indicator position for currently active link
  const initialActive = document.querySelector('.nav-link.active') || navLinks[0];
  if (initialActive) {
    setTimeout(() => setIndicatorPosition(initialActive), 100);
  }

  // Hover sliding effect
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      setIndicatorPosition(link);
    });

    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      setIndicatorPosition(link);
    });
  });

  // When cursor leaves the nav links container, return indicator to active link
  if (navLinksContainer) {
    navLinksContainer.addEventListener('mouseleave', () => {
      const currentActive = document.querySelector('.nav-link.active') || navLinks[0];
      if (currentActive) {
        setIndicatorPosition(currentActive);
      }
    });
  }

  // Aceternity Smart Floating Header: Hide on scroll down, Reveal on scroll up
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Scrolled styling (border & background glow)
    if (currentScrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Scroll Direction & Hide/Reveal
    if (navWrapper) {
      if (currentScrollY <= 80) {
        navWrapper.classList.remove('nav-hidden');
        navWrapper.classList.add('nav-visible');
      } else if (currentScrollY > lastScrollY + scrollThreshold) {
        // Scrolling DOWN -> smoothly hide
        navWrapper.classList.add('nav-hidden');
        navWrapper.classList.remove('nav-visible');
      } else if (currentScrollY < lastScrollY - scrollThreshold) {
        // Scrolling UP -> smoothly reveal
        navWrapper.classList.remove('nav-hidden');
        navWrapper.classList.add('nav-visible');
      }
    }

    lastScrollY = currentScrollY;
    highlightActiveSection();
  }, { passive: true });

  // Mobile menu toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileDrawer.classList.toggle('open');
    });

    // Close mobile drawer when clicking a link
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileDrawer.contains(e.target) && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active section indicator
  function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset + 240;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            if (!link.classList.contains('active')) {
              navLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
              // Only move indicator if mouse is not currently hovering over nav
              if (!navLinksContainer.matches(':hover')) {
                setIndicatorPosition(link);
              }
            }
          }
        });
      }
    });
  }
}

/* ==========================================================================
   ACETERNITY "CONTAINER TEXT FLIP"
   https://ui.aceternity.com/components/container-text-flip
   Cycles through: Embedded, IOT, Robotics, Web Development
   Features 3D rotateX text flip animation + dynamic container width adjustment
   ========================================================================== */
function initContainerTextFlip() {
  const container = document.getElementById('container-text-flip');
  const textEl = document.getElementById('flip-text-inner');
  if (!container || !textEl) return;

  const words = ['Embedded', 'IOT', 'Robotics', 'Web Development'];
  let currentIndex = 0;

  // Off-screen ruler to precisely measure text width for dynamic container sizing
  const ruler = document.createElement('span');
  ruler.style.visibility = 'hidden';
  ruler.style.position = 'absolute';
  ruler.style.left = '-9999px';
  ruler.style.top = '-9999px';
  ruler.style.whiteSpace = 'nowrap';
  const computed = window.getComputedStyle(textEl);
  ruler.style.fontFamily = computed.fontFamily;
  ruler.style.fontSize = computed.fontSize;
  ruler.style.fontWeight = computed.fontWeight;
  ruler.style.letterSpacing = computed.letterSpacing;
  document.body.appendChild(ruler);

  function getWordWidth(word) {
    ruler.textContent = word;
    // Add horizontal padding (1.25rem * 2 = ~40px) + 10px breathing room
    return Math.ceil(ruler.getBoundingClientRect().width) + 48;
  }

  // Set initial container width smoothly
  const initialWidth = getWordWidth(words[0]);
  container.style.width = `${initialWidth}px`;

  setInterval(() => {
    // 1. 3D Flip Exit (rotateX: 90deg, translateY: -14px, blur)
    textEl.classList.remove('active');
    textEl.classList.add('flip-exit');

    const nextIndex = (currentIndex + 1) % words.length;
    const nextWord = words[nextIndex];
    const targetWidth = getWordWidth(nextWord);

    // Smoothly animate the container width to fit the next word perfectly
    container.style.width = `${targetWidth}px`;

    setTimeout(() => {
      // 2. Load next word in 3D Entrance position (rotateX: -90deg, translateY: 14px, blur)
      currentIndex = nextIndex;
      textEl.textContent = nextWord;
      textEl.classList.remove('flip-exit');
      textEl.classList.add('flip-enter-prep');

      // 3. Force reflow for seamless CSS transition
      void textEl.offsetWidth;

      // 4. Animate to active state (rotateX: 0deg, translateY: 0, crisp focus)
      textEl.classList.remove('flip-enter-prep');
      textEl.classList.add('active');
    }, 420);
  }, 2800);
}

/* ==========================================================================
   2. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. PROJECT FILTERS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   6. PROJECT MODALS
   ========================================================================== */
const projectDetailsData = {
  'modal-nidar': {
    title: 'Nidar Mission - 2: Air Mouse (Autonomous Navigation Drone)',
    category: 'Autonomous Robotics & Aerial Systems',
    status: 'Active Engineering Phase',
    image: 'assets/drone-nidar-mission.jpg',
    description: `Nidar Mission - 2 is an ambitious initiative at Prathyusha Engineering College focused on developing an intelligent quadcopter drone capable of navigating complex indoor and outdoor spaces without relying on external GPS signals.`,
    highlights: [
      'Visual Inertial Odometry (VIO) & LiDAR SLAM for real-time 3D spatial mapping.',
      'Onboard edge computer vision for dynamic obstacle detection & avoidance.',
      'Custom flight trajectory planner integrating PX4 / ArduPilot flight controllers.',
      '915 MHz long-range telemetry link delivering flight telemetry to ground station.'
    ],
    tech: ['ROS 2', 'PX4 Autopilot', 'LiDAR SLAM', 'OpenCV', 'Python', 'C++', 'MAVLink'],
    github: 'https://github.com/kishor1326/'
  },
  'modal-vision': {
    title: 'Intelligent Edge Vision & Target Tracker',
    category: 'Computer Vision & Edge Machine Learning',
    status: 'Completed / Active Deployment',
    image: 'assets/edge-vision-ai.jpg',
    description: `An optimized edge vision pipeline engineered to perform low-latency object detection, pedestrian tracking, and spatial depth estimation directly on constrained embedded devices.`,
    highlights: [
      'Trained YOLOv8 nano and small models quantized with TensorFlow Lite / INT8.',
      'Achieves steady 60 FPS inference throughput on edge coprocessor boards.',
      'Stereo depth map visualization for precise distance estimation from drone camera.',
      'Integrated with ROS message nodes for autonomous target interception.'
    ],
    tech: ['YOLOv8', 'OpenCV', 'TensorFlow Lite', 'Edge TPU', 'Python', 'NumPy'],
    github: 'https://github.com/kishor1326/'
  },
  'modal-embedded': {
    title: 'Autonomous Robotics & Telemetry Hub',
    category: 'Embedded Hardware & Sensor Telemetry',
    status: 'Hardware Prototype Validated',
    image: 'assets/embedded-robotics.jpg',
    description: `A custom-designed sensor telemetry hub integrating multiple high-precision environmental and inertial sensors with low-latency radio communication protocols.`,
    highlights: [
      'Dual-core ESP32 / STM32 microcontroller processing concurrent sensor loops using FreeRTOS.',
      'Seamless multi-bus architecture supporting SPI, I2C, and UART peripherals.',
      'Real-time IMU Kalman filtering for drone orientation stabilization.',
      'Low-power wireless telemetry transmitter with CRC error detection.'
    ],
    tech: ['Embedded C/C++', 'ESP32 / STM32', 'FreeRTOS', 'I2C / SPI', 'KiCad PCB', 'Telemetry'],
    github: 'https://github.com/kishor1326/'
  },
  'modal-web': {
    title: 'Startup-Grade AI & Telemetry Web Suite',
    category: 'Full-Stack Web & Real-Time Dashboards',
    status: 'Production Architecture',
    image: null,
    description: `A responsive, high-performance monitoring dashboard built to stream real-time drone flight metrics, live AI object detections, and spatial navigation coordinates with zero latency.`,
    highlights: [
      'Built with modern responsive vanilla CSS & JavaScript for maximum speed and zero dependencies.',
      'Real-time WebSocket data stream plotting battery, pitch, roll, yaw, and altitude.',
      'Interactive dark-mode UI with Aceternity-inspired micro-interactions and spotlight cards.',
      'Mobile-optimized touch controls and progressive telemetry views.'
    ],
    tech: ['JavaScript (ES6+)', 'Modern CSS3', 'WebSockets', 'Chart.js', 'Node.js', 'REST API'],
    github: 'https://github.com/kishor1326/'
  }
};

function initProjectModals() {
  const modalOverlay = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const detailButtons = document.querySelectorAll('.project-details-btn');

  detailButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalKey = btn.getAttribute('data-modal');
      const data = projectDetailsData[modalKey];

      if (!data) return;

      const imgHtml = data.image ? `
        <div style="width: 100%; height: 240px; border-radius: 12px; overflow: hidden; margin-bottom: 1.25rem;">
          <img src="${data.image}" alt="${data.title}" style="width:100%; height:100%; object-fit: cover;" />
        </div>` : '';

      const highlightsHtml = data.highlights.map(h => `<li style="margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem;">${h}</li>`).join('');
      const techHtml = data.tech.map(t => `<span class="tech-chip" style="font-size: 0.78rem;">${t}</span>`).join('');

      modalBody.innerHTML = `
        ${imgHtml}
        <div style="font-size: 0.75rem; font-weight: 700; color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">${data.category}</div>
        <h3 style="font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-bottom: 0.75rem;">${data.title}</h3>
        <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">${data.description}</p>
        
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">Key Architecture Highlights:</h4>
        <ul style="padding-left: 1.25rem; margin-bottom: 1.25rem;">${highlightsHtml}</ul>
        
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem;">${techHtml}</div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem;">
          <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn-aceternity btn-primary" style="padding: 0.6rem 1.25rem; font-size: 0.85rem;">
            <span>View GitHub Repository</span>
          </a>
        </div>
      `;

      modalOverlay.classList.add('active');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   7. COPY TO CLIPBOARD ACTIONS & TOAST
   ========================================================================== */
function initCopyActions() {
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');
  const copySmallButtons = document.querySelectorAll('.copy-btn-small');

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'Kishor132006@gmail.com';
      copyToClipboard(email, 'Email copied to clipboard!');
      if (copyText) {
        const originalText = copyText.innerText;
        copyText.innerText = 'Copied!';
        setTimeout(() => { copyText.innerText = originalText; }, 2000);
      }
    });
  }

  copySmallButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        copyToClipboard(textToCopy, `Copied: ${textToCopy}`);
      }
    });
  });
}

function copyToClipboard(text, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => {
      fallbackCopy(text, message);
    });
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.style.position = 'fixed';
  tempInput.style.left = '-9999px';
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  try {
    document.execCommand('copy');
    showToast(message);
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(tempInput);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ==========================================================================
   8. CONTACT FORM INTERACTION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    // If browser supports mailto redirection
    const name = document.getElementById('sender-name').value;
    const email = document.getElementById('sender-email').value;
    const subject = document.getElementById('message-subject').value;
    const message = document.getElementById('message-text').value;

    if (submitBtn && submitText) {
      submitText.textContent = 'Opening Mail Client...';
      submitBtn.style.opacity = '0.8';
    }

    const mailtoUrl = `mailto:Kishor132006@gmail.com?subject=${encodeURIComponent(subject + ' - Portfolio Inquiry from ' + name)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;

    window.location.href = mailtoUrl;

    setTimeout(() => {
      showToast('Thank you! Your mail client has been opened.');
      if (submitText) submitText.textContent = 'Message Prepared ✓';
      form.reset();
      setTimeout(() => {
        if (submitText) submitText.textContent = 'Send Message';
        if (submitBtn) submitBtn.style.opacity = '1';
      }, 4000);
    }, 600);
  });
}

/* ==========================================================================
   9. LIVE CHENNAI CLOCK
   ========================================================================== */
function initLiveClock() {
  const timeBadge = document.getElementById('local-time-badge');
  if (!timeBadge) return;

  function updateClock() {
    try {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat([], options);
      timeBadge.textContent = `${formatter.format(new Date())} IST`;
    } catch (e) {
      timeBadge.textContent = 'Chennai (IST)';
    }
  }

  updateClock();
  setInterval(updateClock, 30000);
}

/* ==========================================================================
   10. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   11. CURRENT YEAR
   ========================================================================== */
function updateCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   12. CERTIFICATIONS TABS & SHOW MORE INTERACTION
   ========================================================================== */
function switchCertTab(targetId) {
  const tabButtons = document.querySelectorAll('.cert-tab-btn');
  const tabPanes = document.querySelectorAll('.cert-tab-pane');

  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === targetId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tabPanes.forEach(pane => {
    if (pane.id === targetId) {
      pane.classList.add('active');
      pane.style.opacity = '0';
      pane.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        pane.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        pane.style.opacity = '1';
        pane.style.transform = 'translateY(0)';
      });
    } else {
      pane.classList.remove('active');
    }
  });
}
window.switchCertTab = switchCertTab;

let lastShowMoreToggleTime = 0;
function toggleCertificatesShowMore(e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }

  const now = Date.now();
  if (now - lastShowMoreToggleTime < 250) {
    return; // Prevent duplicate rapid firing
  }
  lastShowMoreToggleTime = now;

  const showMoreBtn = document.getElementById('cert-show-more-btn');
  const otherGrid = document.querySelector('.cert-other-grid');
  if (!showMoreBtn || !otherGrid) return;

  const willExpand = !otherGrid.classList.contains('is-expanded');

  if (willExpand) {
    otherGrid.classList.add('is-expanded');
    showMoreBtn.setAttribute('data-expanded', 'true');
    showMoreBtn.textContent = 'SHOW LESS';
  } else {
    otherGrid.classList.remove('is-expanded');
    showMoreBtn.setAttribute('data-expanded', 'false');
    showMoreBtn.textContent = 'SHOW MORE (14 MORE)';
    const otherPane = document.getElementById('tab-other');
    if (otherPane) {
      otherPane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}
window.toggleCertificatesShowMore = toggleCertificatesShowMore;

function initCertificatesTabs() {
  const tabButtons = document.querySelectorAll('.cert-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (targetId) switchCertTab(targetId);
    });
  });
}

function initCertificatesShowMore() {
  const showMoreBtn = document.getElementById('cert-show-more-btn');
  if (showMoreBtn) {
    showMoreBtn.onclick = toggleCertificatesShowMore;
  }
}

/* ==========================================================================
   13. IN-SITE CERTIFICATE VIEWER MODAL (PURE LIGHTBOX)
   ========================================================================== */
function openCertificateModal({ src, title }) {
  const modal = document.getElementById('cert-viewer-modal');
  if (!modal) return;

  const viewport = document.getElementById('cert-modal-viewport');

  if (viewport) {
    viewport.innerHTML = '';
    const isPdf = src.toLowerCase().includes('.pdf');

    if (isPdf) {
      const iframe = document.createElement('iframe');
      iframe.className = 'cert-modal-pdf';
      iframe.src = `${src}#toolbar=0&navpanes=0&scrollbar=1`;
      iframe.title = title || 'Certificate PDF Viewer';
      viewport.appendChild(iframe);
    } else {
      const img = document.createElement('img');
      img.className = 'cert-modal-img';
      img.src = src;
      img.alt = title || 'Certificate Image Viewer';
      viewport.appendChild(img);
    }
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
window.openCertificateModal = openCertificateModal;

function closeCertificateModal() {
  const modal = document.getElementById('cert-viewer-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  const viewport = document.getElementById('cert-modal-viewport');
  if (viewport) {
    viewport.innerHTML = '';
  }
}
window.closeCertificateModal = closeCertificateModal;

function initCertificateModalEvents() {
  const modal = document.getElementById('cert-viewer-modal');
  const closeBtn = document.getElementById('cert-modal-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCertificateModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      // Close if clicking outside the image / pdf viewer
      if (e.target === modal || e.target.classList.contains('cert-modal-lightbox') || e.target.classList.contains('cert-modal-viewport')) {
        closeCertificateModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const m = document.getElementById('cert-viewer-modal');
      if (m && m.classList.contains('active')) {
        closeCertificateModal();
      }
    }
  });

  // Attach click listener for all certificate view triggers & banners
  document.addEventListener('click', (e) => {
    const banner = e.target.closest('.cert-spec-banner');
    let trigger = e.target.closest('.cert-view-trigger, .btn-cert-primary, .cert-other-card');

    if (banner && !trigger) {
      trigger = banner.closest('.cert-spec-card')?.querySelector('.cert-view-trigger, .btn-cert-primary');
    }

    if (!trigger) return;

    // Trigger minimal click pulse animation on hackathon-view-cert-btn
    if (trigger.classList.contains('hackathon-view-cert-btn')) {
      trigger.classList.remove('btn-click-pulse');
      void trigger.offsetWidth;
      trigger.classList.add('btn-click-pulse');
      setTimeout(() => trigger.classList.remove('btn-click-pulse'), 380);
    }

    // Ignore clicks on download links or secondary actions
    if (e.target.closest('.btn-cert-secondary') || e.target.closest('a[download]')) {
      return;
    }

    const src = trigger.getAttribute('data-cert-src') || trigger.getAttribute('href');
    if (!src || src.startsWith('#')) return;

    e.preventDefault();

    const card = trigger.closest('.cert-spec-card, .cert-other-card');
    const title = trigger.getAttribute('data-cert-title') ||
                  card?.querySelector('.cert-spec-title, .cert-other-title')?.textContent?.trim() ||
                  'Certificate';

    openCertificateModal({ src, title });
  });
}

/* ==========================================================================
   14. WOBBLE CARD - JELLY HOVER PHYSICS
   Reference: https://webdevpuneet.com/ui-snippets/wobble-card/
   Squishes and follows pointer like soft jelly with counter-parallax,
   then springs back with custom spring easing. Zero dot-grid.
   ========================================================================== */
function initWobbleCards() {
  const cards = document.querySelectorAll('[data-wobble="true"], .hackathon-wobble-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const inner = card.querySelector('.wobble-inner-content') || card.querySelector('.hackathon-photo-frame');
    let isHovering = false;

    function handlePointerEnter() {
      isHovering = true;
      card.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
      if (inner) inner.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    function handlePointerMove(e) {
      if (!isHovering) isHovering = true;

      const rect = card.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Calculate pointer position relative to center (-0.5 to 0.5)
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;

      // Minimal, subtle multipliers for an ultra-clean, refined micro-wobble
      const moveX = x * 7;
      const moveY = y * 7;
      const rotateX = -y * 7;
      const rotateY = x * 7;

      // Outer card subtle micro-tilt
      card.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

      // Inner image gentle counter-parallax
      if (inner) {
        inner.style.transform = `translate3d(${(-moveX * 0.45).toFixed(2)}px, ${(-moveY * 0.45).toFixed(2)}px, 0) scale(1.02)`;
      }
    }

    function handlePointerLeave() {
      isHovering = false;

      // Smooth silky reset easing
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease';
      card.style.transform = 'translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)';

      if (inner) {
        inner.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        inner.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
      }
    }

    card.addEventListener('pointerenter', handlePointerEnter);
    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerleave', handlePointerLeave);
  });
}

/* ==========================================================================
   15. CURZR ARROW POINTER (DYNAMIC MINIMAL ARROW CURSOR)
   Smooth Directional Trajectory Rotation & Fluid Lerp Tracking
   ========================================================================== */
class CurzrArrowPointer {
  constructor() {
    this.cursor = document.querySelector('.curzr-arrow');
    if (!this.cursor) return;

    this.position = {
      distanceX: 0,
      distanceY: 0,
      pointerX: -100,
      pointerY: -100,
    };
    this.previousPointerX = -100;
    this.previousPointerY = -100;
    this.angle = -135;
    this.previousAngle = -135; // -135 + 90 = -45 deg (points top-left like classic arrow cursor at rest)
    this.angleDisplace = 0;
    this.degrees = 57.2957795;
    this.cursorSize = 20;
    this.isVisible = false;
    this.isHovering = false;
    this.isClicking = false;
    this.innerSvg = this.cursor.querySelector('svg');

    this.init();
  }

  init() {
    const handleMove = (e) => {
      if (typeof e.clientX !== 'number') return;
      this.position.pointerX = e.clientX;
      this.position.pointerY = e.clientY;

      if (!this.isVisible) {
        this.isVisible = true;
        this.previousPointerX = e.clientX;
        this.previousPointerY = e.clientY;
      }
      this.cursor.style.opacity = '1';
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('pointermove', handleMove, { passive: true });

    window.addEventListener('mousedown', () => {
      this.isClicking = true;
      this.cursor.classList.add('curzr-click');
    });

    window.addEventListener('mouseup', () => {
      this.isClicking = false;
      this.cursor.classList.remove('curzr-click');
    });

    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
    });

    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, .cert-card, .project-card, .tech-chip, .filter-btn, .hackathon-tag, .nav-link, .cert-tab-btn, [data-wobble="true"], .contact-social-logo-btn, .hero-social-circle-white, .btn-pill-cta, .hackathon-view-cert-btn, .hackathon-ghost-btn';

    document.addEventListener('mouseover', (e) => {
      if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
        if (!this.isHovering) {
          this.isHovering = true;
          this.cursor.classList.add('curzr-hover');
        }
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
        const related = e.relatedTarget;
        if (!related || !related.closest || !related.closest(interactiveSelector)) {
          this.isHovering = false;
          this.cursor.classList.remove('curzr-hover');
        }
      }
    }, { passive: true });

    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    if (!this.isVisible) return;

    this.position.distanceX = this.position.pointerX - this.previousPointerX;
    this.position.distanceY = this.position.pointerY - this.previousPointerY;

    // Smooth movement interpolation (lerp)
    this.previousPointerX += this.position.distanceX * 0.32;
    this.previousPointerY += this.position.distanceY * 0.32;

    this.cursor.style.transform = `translate3d(${(this.previousPointerX - this.cursorSize / 2).toFixed(2)}px, ${(this.previousPointerY - this.cursorSize / 2).toFixed(2)}px, 0)`;

    // Calculate rotation angle based on movement trajectory
    const moveDist = Math.hypot(this.position.distanceX, this.position.distanceY);
    if (moveDist > 0.35) {
      this.angle = Math.atan2(this.position.distanceY, this.position.distanceX) * this.degrees;
      this.angleDisplace = this.angle - this.previousAngle;

      if (this.angleDisplace < -180) this.angleDisplace += 360;
      if (this.angleDisplace > 180) this.angleDisplace -= 360;

      this.previousAngle += this.angleDisplace * 0.22;

      if (this.innerSvg) {
        this.innerSvg.style.transform = `rotate(${(this.previousAngle + 90).toFixed(2)}deg)${this.isClicking ? ' scale(0.88)' : (this.isHovering ? ' scale(1.12)' : '')}`;
      }
    } else if (this.innerSvg) {
      this.innerSvg.style.transform = `rotate(${(this.previousAngle + 90).toFixed(2)}deg)${this.isClicking ? ' scale(0.88)' : (this.isHovering ? ' scale(1.12)' : '')}`;
    }
  }
}

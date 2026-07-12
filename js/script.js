const formatEuro = (value) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);

const initBeforeAfterSliders = () => {
  const sliders = document.querySelectorAll('.ba-wrap');

  sliders.forEach((slider) => {
    const after = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;

    let isDragging = false;

    const updateSlider = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let position = clientX - rect.left;
      position = Math.max(0, Math.min(position, rect.width));
      const percent = (position / rect.width) * 100;

      after.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handle.style.left = `${percent}%`;
    };

    const pointerMove = (event) => {
      if (!isDragging) return;
      updateSlider(event.clientX);
    };

    handle.addEventListener('pointerdown', (event) => {
      isDragging = true;
      handle.setPointerCapture(event.pointerId);
      slider.classList.add('is-dragging');
    });

    handle.addEventListener('pointermove', pointerMove);
    handle.addEventListener('pointerup', () => {
      isDragging = false;
      slider.classList.remove('is-dragging');
    });

    handle.addEventListener('pointercancel', () => {
      isDragging = false;
      slider.classList.remove('is-dragging');
    });

    slider.addEventListener('click', (event) => {
      updateSlider(event.clientX);
    });

    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', () => {
      isDragging = false;
      slider.classList.remove('is-dragging');
    });

    updateSlider(slider.getBoundingClientRect().left + slider.offsetWidth / 2);
  });
};

const initFaq = () => {
  const faqButtons = document.querySelectorAll('.faq-question');

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      item.classList.toggle('is-open');
    });
  });
};

const initContactForm = () => {
  const cfName = document.getElementById('cfName');
  const cfEmail = document.getElementById('cfEmail');
  const cfMessage = document.getElementById('cfMessage');
  const cfPhone = document.getElementById('cfPhone');
  const cfSubject = document.getElementById('cfSubject');
  const cfFiles = document.getElementById('cfFiles');
  const cfFilesInfo = document.getElementById('cfFilesInfo');
  const cfSubmit = document.getElementById('cfSubmit');
  const cfFeedback = document.getElementById('cfFeedback');

  if (!cfSubmit) return;

  if (cfFiles && cfFilesInfo) {
    cfFiles.addEventListener('change', () => {
      const fileCount = cfFiles.files ? cfFiles.files.length : 0;
      if (!fileCount) {
        cfFilesInfo.textContent = 'Keine Bilder ausgewählt';
      } else if (fileCount === 1) {
        cfFilesInfo.textContent = `1 Bild ausgewählt: ${cfFiles.files[0].name}`;
      } else {
        cfFilesInfo.textContent = `${fileCount} Bilder ausgewählt`;
      }
    });
  }

  cfSubmit.addEventListener('click', () => {
    if (!cfName?.value || !cfEmail?.value || !cfMessage?.value) {
      alert('Bitte fülle mindestens Name, E-Mail und Nachricht aus.');
      return;
    }

    const payload = {
      name: cfName.value,
      email: cfEmail.value,
      phone: cfPhone?.value || '',
      subject: cfSubject?.value || '',
      message: cfMessage.value,
      files: cfFiles?.files ? [...cfFiles.files].map((file) => file.name) : []
    };

    console.info('Kontaktformular gespeichert:', payload);

    if (cfFeedback) {
      cfFeedback.hidden = false;
    }

    cfName.value = '';
    cfEmail.value = '';
    if (cfPhone) cfPhone.value = '';
    if (cfSubject) cfSubject.selectedIndex = 0;
    cfMessage.value = '';
    if (cfFiles) cfFiles.value = '';
    if (cfFilesInfo) cfFilesInfo.textContent = 'Keine Bilder ausgewählt';
  });
};

const initPriceCalculator = () => {
  const service = document.getElementById('calcService');
  const condition = document.getElementById('calcCondition');
  const areaInput = document.getElementById('calcArea');
  const areaRange = document.getElementById('calcAreaRange');
  const joints = document.getElementById('calcJoints');
  const baseOutput = document.getElementById('calcBaseOutput');
  const conditionOutput = document.getElementById('calcConditionOutput');
  const jointOutput = document.getElementById('calcJointOutput');
  const totalOutput = document.getElementById('calcTotalOutput');
  const materialOutput = document.getElementById('calcMaterialOutput');

  if (!service || !condition || !areaInput || !areaRange) return;

  const basePrices = {
    terrasse: 10,
    einfahrt: 12,
    parkplatz: 9,
    fassade: 14
  };

  const clampArea = (value) => {
    const numeric = Number(value) || 10;
    return Math.max(10, Math.min(1000, numeric));
  };

  const syncAreaInputs = (value) => {
    const area = clampArea(value);
    areaInput.value = area;
    areaRange.value = area;
    return area;
  };

  const updateCalculator = () => {
    const area = syncAreaInputs(areaInput.value);
    const basePricePerSquareMeter = basePrices[service.value] || 0;
    const conditionFactor = Number(condition.value) || 1;
    const basePrice = area * basePricePerSquareMeter;
    const jointPricePerSquareMeter = joints?.checked ? 3 : 0;
    const jointCost = area * jointPricePerSquareMeter;
    const total = (basePrice * conditionFactor) + jointCost;

    if (baseOutput) baseOutput.textContent = formatEuro(basePrice);
    if (conditionOutput) conditionOutput.textContent = `${conditionFactor.toFixed(2).replace('.', ',')}×`;
    if (jointOutput) jointOutput.textContent = formatEuro(jointCost);
    if (totalOutput) totalOutput.textContent = formatEuro(total);

    if (materialOutput) {
      if (joints?.checked) {
        const kg = Math.max(1, Math.round(area * 0.5));
        materialOutput.textContent = `Geschätzter Materialbedarf für Nachsandung: ca. ${kg} kg.`;
      } else {
        materialOutput.textContent = 'Kein zusätzlicher Materialbedarf berechnet.';
      }
    }
  };

  areaInput.addEventListener('input', () => {
    syncAreaInputs(areaInput.value);
    updateCalculator();
  });

  areaRange.addEventListener('input', () => {
    syncAreaInputs(areaRange.value);
    updateCalculator();
  });

  service.addEventListener('change', updateCalculator);
  condition.addEventListener('change', updateCalculator);
  joints?.addEventListener('change', updateCalculator);

  updateCalculator();
};


const initImageGallery = () => {
  const track = document.querySelector('.gallery-track');
  if (!track || track.dataset.loopReady === 'true') return;

  const originalCards = [...track.children];
  if (!originalCards.length) return;

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');

    clone.querySelectorAll('img').forEach((image) => {
      image.alt = '';
    });

    track.appendChild(clone);
  });

  track.dataset.loopReady = 'true';
};

const initScrollReveal = () => {
  if (!document.body.classList.contains('home-page')) return;

  document.body.classList.add('js-ready');

  const revealGroups = [
    '.section-heading',
    '.service-grid .service-card',
    '.gallery-marquee',
    '.ba-container .ba-card',
    '.why-grid .why-card',
    '.reviews-marquee',
    '.price-cta__copy',
    '.price-cta__features .mini-feature',
    '.price-cta__action',
    '.faq-list .faq-item',
    '.contact-copy',
    '.contact-form'
  ];

  const elements = [];

  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add('reveal-on-scroll');
      element.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 90}ms`);
      elements.push(element);
    });
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px'
  });

  elements.forEach((element) => observer.observe(element));
};



const initCleanUrlDisplay = () => {
  if (!['http:', 'https:'].includes(window.location.protocol)) return;

  const cleanPaths = new Map([
    ['/index.html', '/'],
    ['/preisrechner/index.html', '/preisrechner/'],
    ['/impressum/index.html', '/impressum/'],
    ['/datenschutz/index.html', '/datenschutz/']
  ]);

  const cleanPath = cleanPaths.get(window.location.pathname);
  if (!cleanPath) return;

  window.history.replaceState(
    window.history.state,
    '',
    `${cleanPath}${window.location.search}${window.location.hash}`
  );
};

initCleanUrlDisplay();
initBeforeAfterSliders();
initImageGallery();
initFaq();
initContactForm();
initPriceCalculator();
initScrollReveal();

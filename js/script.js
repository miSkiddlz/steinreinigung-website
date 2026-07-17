const formatEuro = (value) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);

const CALCULATOR_STORAGE_KEY = 'martinReinigungstechnikCalculator';

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
  const form = document.getElementById('contactForm');
  const cfMessage = document.getElementById('cfMessage');
  const cfSubject = document.getElementById('cfSubject');
  const cfFiles = document.getElementById('cfFiles');
  const cfFilesInfo = document.getElementById('cfFilesInfo');
  const cfFeedback = document.getElementById('cfFeedback');

  if (!form) return;

  let calculatorConfiguration = null;
  try {
    const storedConfiguration = localStorage.getItem(CALCULATOR_STORAGE_KEY);
    const requestedTransfer = new URLSearchParams(window.location.search).get('calculator') === '1';

    if (storedConfiguration && requestedTransfer) {
      calculatorConfiguration = JSON.parse(storedConfiguration);

      const transferNote = document.createElement('div');
      transferNote.className = 'calculator-transfer-note';
      transferNote.innerHTML = '<strong>Preisrechner-Konfiguration übernommen</strong><span>Die ausgewählten Angaben und die Kostenschätzung wurden automatisch in die Nachricht eingefügt.</span>';
      form.prepend(transferNote);

      if (cfSubject) {
        const matchingOption = [...cfSubject.options].find((option) => option.textContent.includes('Pflasterreinigung'));
        if (matchingOption) cfSubject.value = matchingOption.value;
      }

      if (cfMessage && calculatorConfiguration.summary) {
        cfMessage.value = `Hallo, ich interessiere mich für folgende unverbindliche Konfiguration:

${calculatorConfiguration.summary}

Zusätzliche Nachricht:
`;
      }

      const hiddenSummary = document.createElement('input');
      hiddenSummary.type = 'hidden';
      hiddenSummary.name = 'Preisrechner-Konfiguration';
      hiddenSummary.value = calculatorConfiguration.summary || '';
      form.appendChild(hiddenSummary);
    }
  } catch (error) {
    console.warn('Preisrechner-Konfiguration konnte nicht geladen werden.', error);
  }

  if (cfFiles && cfFilesInfo) {
    cfFiles.addEventListener('change', () => {
      const files = cfFiles.files ? [...cfFiles.files] : [];
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      if (totalSize > 10 * 1024 * 1024) {
        cfFiles.value = '';
        cfFilesInfo.textContent = 'Die ausgewählten Bilder sind zusammen größer als 10 MB. Bitte verkleinern und erneut auswählen.';
        return;
      }

      if (!files.length) {
        cfFilesInfo.textContent = 'Keine Bilder ausgewählt';
      } else if (files.length === 1) {
        cfFilesInfo.textContent = `1 Bild ausgewählt: ${files[0].name}`;
      } else {
        cfFilesInfo.textContent = `${files.length} Bilder ausgewählt`;
      }
    });
  }

  const sentSuccessfully = new URLSearchParams(window.location.search).get('sent') === '1';
  if (sentSuccessfully && cfFeedback) {
    cfFeedback.hidden = false;
    localStorage.removeItem(CALCULATOR_STORAGE_KEY);
  }

  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Wird gesendet …';
    }
  });
};

const initExternalForms = () => {
  const forms = document.querySelectorAll('form[action*="formsubmit.co"]:not(#contactForm)');

  forms.forEach((form) => {
    const fileInputs = form.querySelectorAll('input[type="file"]');
    const feedback = form.querySelector('.form-feedback');

    fileInputs.forEach((fileInput) => {
      fileInput.addEventListener('change', () => {
        const files = fileInput.files ? [...fileInput.files] : [];
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        if (totalSize > 10 * 1024 * 1024) {
          fileInput.value = '';
          alert('Die ausgewählten Dateien sind zusammen größer als 10 MB. Bitte verkleinere sie und versuche es erneut.');
        }
      });
    });

    if (new URLSearchParams(window.location.search).get('sent') === '1' && feedback) {
      feedback.hidden = false;
    }

    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Wird gesendet …';
      }
    });
  });
};

const initPriceCalculator = () => {
  const stoneType = document.getElementById('calcStoneType');
  const condition = document.getElementById('calcCondition');
  const areaInput = document.getElementById('calcArea');
  const areaRange = document.getElementById('calcAreaRange');
  const cleaning = document.getElementById('calcCleaning');
  const joints = document.getElementById('calcJoints');
  const impregnation = document.getElementById('calcImpregnation');
  const weedTreatment = document.getElementById('calcWeedTreatment');
  const jointSettings = document.getElementById('jointSettings');
  const jointMaterial = document.getElementById('calcJointMaterial');
  const stoneWidth = document.getElementById('calcStoneWidth');
  const stoneLength = document.getElementById('calcStoneLength');
  const jointWidth = document.getElementById('calcJointWidth');
  const jointDepth = document.getElementById('calcJointDepth');
  const receiptItems = document.getElementById('receiptItems');
  const receiptStone = document.getElementById('receiptStone');
  const receiptArea = document.getElementById('receiptArea');
  const receiptCondition = document.getElementById('receiptCondition');
  const receiptTravel = document.getElementById('receiptTravel');
  const receiptNet = document.getElementById('receiptNet');
  const receiptVat = document.getElementById('receiptVat');
  const receiptGross = document.getElementById('receiptGross');
  const receiptPerSqm = document.getElementById('receiptPerSqm');
  const inquiryButton = document.getElementById('calcInquiryButton');
  const printButton = document.getElementById('calcPrintButton');

  if (!stoneType || !condition || !areaInput || !areaRange || !receiptItems) return;

  // Alle Preise sind Netto-Richtwerte und können später zentral hier angepasst werden.
  const pricing = {
    vatRate: 0.19,
    travelFlat: 80,
    cleaningPerSquareMeter: 8,
    stones: {
      concrete: { label: 'Betonpflaster / Betonstein', factor: 1 },
      natural: { label: 'Naturstein', factor: 1.25 },
      clinker: { label: 'Klinker / Ziegelpflaster', factor: 1.15 },
      porcelain: { label: 'Feinsteinzeug / Keramik', factor: 1.1 },
      washed: { label: 'Waschbeton', factor: 1.2 },
      unknown: { label: 'Nicht sicher / Sonstiges', factor: 1.1 }
    },
    conditions: {
      light: { label: 'Leicht verschmutzt', factor: 1 },
      normal: { label: 'Normal verschmutzt', factor: 1.15 },
      strong: { label: 'Stark verschmutzt', factor: 1.35 },
      extreme: { label: 'Sehr stark verschmutzt', factor: 1.6 }
    },
    jointMaterials: {
      standard: { label: 'Standard-Fugensand', pricePerKg: 1.2, laborPerSquareMeter: 3.5, densityKgPerLiter: 1.55 },
      weed: { label: 'Unkrauthemmender Fugensand', pricePerKg: 1.9, laborPerSquareMeter: 4.25, densityKgPerLiter: 1.55 },
      polymer: { label: 'Polymer-Fugensand', pricePerKg: 3.2, laborPerSquareMeter: 6.5, densityKgPerLiter: 1.5 }
    },
    impregnation: { label: 'Extra Materialschutz', litersPerSquareMeter: 0.12, pricePerLiter: 6.3, laborPerSquareMeter: 4 },
    weedTreatment: { label: 'Unkrautbehandlung', pricePerSquareMeter: 1.2, minimum: 120 }
  };

  let lastConfiguration = null;

  const clampNumber = (value, min, max, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  };

  const roundTo = (value, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  };

  let lastValidArea = clampNumber(areaInput.value, 5, 1000, 50);

  const readAreaWhileTyping = () => {
    if (areaInput.value.trim() === '') return null;
    const area = Number(areaInput.value);
    if (!Number.isFinite(area) || area <= 0) return null;
    lastValidArea = area;
    areaRange.value = Math.min(Math.max(area, Number(areaRange.min)), Number(areaRange.max));
    return area;
  };

  const normalizeArea = () => {
    const area = clampNumber(areaInput.value, 5, 1000, lastValidArea || 50);
    lastValidArea = area;
    areaInput.value = area;
    areaRange.value = Math.min(area, Number(areaRange.max));
    return area;
  };

  const syncAreaFromRange = () => {
    const area = clampNumber(areaRange.value, 5, Number(areaRange.max), 50);
    lastValidArea = area;
    areaInput.value = area;
    return area;
  };

  const calculateJointQuantity = (area, material) => {
    const stoneWidthM = clampNumber(stoneWidth?.value, 5, 100, 10) / 100;
    const stoneLengthM = clampNumber(stoneLength?.value, 5, 100, 20) / 100;
    const jointWidthM = clampNumber(jointWidth?.value, 1, 30, 5) / 1000;
    const jointDepthM = clampNumber(jointDepth?.value, 5, 80, 30) / 1000;

    const moduleArea = (stoneWidthM + jointWidthM) * (stoneLengthM + jointWidthM);
    const stoneArea = stoneWidthM * stoneLengthM;
    const jointShare = Math.max(0.01, 1 - (stoneArea / moduleArea));
    const volumeLiters = area * jointShare * jointDepthM * 1000;
    const kilograms = volumeLiters * material.densityKgPerLiter * 1.1;

    return {
      stoneWidthCm: stoneWidthM * 100,
      stoneLengthCm: stoneLengthM * 100,
      jointWidthMm: jointWidthM * 1000,
      jointDepthMm: jointDepthM * 1000,
      kilograms: Math.max(1, Math.ceil(kilograms))
    };
  };

  const createReceiptItem = ({ title, total, details = [], note = '' }) => {
    const detailMarkup = details.map((detail) => `
      <div class="receipt-detail-line">
        <span>${detail.label}</span>
        <strong>${detail.value}</strong>
      </div>
    `).join('');

    return `
      <article class="receipt-item">
        <div class="receipt-item__heading">
          <strong>${title}</strong>
          <span>${formatEuro(total)}</span>
        </div>
        <div class="receipt-item__details">${detailMarkup}</div>
        ${note ? `<p class="receipt-item__note">${note}</p>` : ''}
      </article>
    `;
  };

  const buildConfigurationText = (configuration) => {
    const itemLines = configuration.items
      .map((item) => `- ${item.title}: ${formatEuro(item.total)}`)
      .join('\n');

    return [
      'Konfiguration aus dem Preisrechner',
      '',
      `Steinart: ${configuration.stoneLabel}`,
      `Fläche: ${configuration.area} m²`,
      `Verschmutzung: ${configuration.conditionLabel}`,
      '',
      'Ausgewählte Leistungen:',
      itemLines,
      `- Anfahrt und Rüstzeit: ${formatEuro(configuration.travel)}`,
      '',
      `Gesamt Netto: ${formatEuro(configuration.net)}`,
      `Mehrwertsteuer (19 %): ${formatEuro(configuration.vat)}`,
      `Geschätzt Brutto: ${formatEuro(configuration.gross)}`,
      `Brutto je m²: ${formatEuro(configuration.grossPerSquareMeter)}`,
      '',
      'Die Berechnung ist unverbindlich und dient nur als erste Orientierung.'
    ].join('\n');
  };

  const updateCalculator = () => {
    const area = readAreaWhileTyping();
    if (area === null) return;
    const selectedStone = pricing.stones[stoneType.value] || pricing.stones.unknown;
    const selectedCondition = pricing.conditions[condition.value] || pricing.conditions.normal;
    const items = [];

    if (cleaning?.checked) {
      const cleaningRate = pricing.cleaningPerSquareMeter * selectedStone.factor * selectedCondition.factor;
      const cleaningTotal = area * cleaningRate;
      items.push({
        title: 'Flächenreinigung im Hochdruck-/Niederdruckverfahren',
        total: cleaningTotal,
        details: [
          { label: 'Fläche', value: `${area} m²` },
          { label: 'Preis je m²', value: formatEuro(cleaningRate) }
        ],
        note: `Steinfaktor ${selectedStone.factor.toFixed(2).replace('.', ',')} × Verschmutzungsfaktor ${selectedCondition.factor.toFixed(2).replace('.', ',')}.`
      });
    }

    if (joints?.checked) {
      const material = pricing.jointMaterials[jointMaterial?.value] || pricing.jointMaterials.standard;
      const quantity = calculateJointQuantity(area, material);
      const materialCost = quantity.kilograms * material.pricePerKg;
      const laborCost = area * material.laborPerSquareMeter;
      const total = materialCost + laborCost;

      items.push({
        title: material.label,
        total,
        details: [
          { label: 'Materialkosten', value: `${quantity.kilograms} kg × ${formatEuro(material.pricePerKg)} = ${formatEuro(materialCost)}` },
          { label: 'Verarbeitung', value: `${area} m² × ${formatEuro(material.laborPerSquareMeter)} = ${formatEuro(laborCost)}` }
        ],
        note: `Berechnet mit ${quantity.stoneWidthCm.toFixed(1).replace('.', ',')} × ${quantity.stoneLengthCm.toFixed(1).replace('.', ',')} cm Steinmaß, ${quantity.jointWidthMm.toFixed(0)} mm Fugenbreite und ${quantity.jointDepthMm.toFixed(0)} mm Fugentiefe inklusive 10 % Materialreserve.`
      });
    }

    if (impregnation?.checked) {
      const service = pricing.impregnation;
      const liters = Math.max(1, Math.ceil(area * service.litersPerSquareMeter));
      const materialCost = liters * service.pricePerLiter;
      const laborCost = area * service.laborPerSquareMeter;
      items.push({
        title: service.label,
        total: materialCost + laborCost,
        details: [
          { label: 'Materialkosten', value: `${liters} L × ${formatEuro(service.pricePerLiter)} = ${formatEuro(materialCost)}` },
          { label: 'Verarbeitung', value: `${area} m² × ${formatEuro(service.laborPerSquareMeter)} = ${formatEuro(laborCost)}` }
        ]
      });
    }


    if (weedTreatment?.checked) {
      const service = pricing.weedTreatment;
      const calculated = area * service.pricePerSquareMeter;
      const total = Math.max(service.minimum, calculated);
      items.push({
        title: service.label,
        total,
        details: [
          { label: 'Behandlung', value: calculated < service.minimum ? `Mindestpauschale ${formatEuro(service.minimum)}` : `${area} m² × ${formatEuro(service.pricePerSquareMeter)}` }
        ],
        note: 'Manuelle oder mechanische Behandlung. Bei starkem Wiederbewuchs können weitere Termine sinnvoll sein.'
      });
    }

    const serviceNet = items.reduce((sum, item) => sum + item.total, 0);
    const travel = items.length ? pricing.travelFlat : 0;
    const net = serviceNet + travel;
    const vat = net * pricing.vatRate;
    const gross = net + vat;
    const grossPerSquareMeter = gross / area;

    receiptItems.innerHTML = items.length ? items.map(createReceiptItem).join('') : '<div class="receipt-empty"><strong>Noch keine Arbeit ausgewählt</strong><span>Bitte wähle mindestens eine Leistung aus.</span></div>';
    if (receiptStone) receiptStone.textContent = selectedStone.label;
    if (receiptArea) receiptArea.textContent = `${area} m²`;
    if (receiptCondition) receiptCondition.textContent = selectedCondition.label;
    if (receiptTravel) receiptTravel.textContent = formatEuro(travel);
    if (receiptNet) receiptNet.textContent = formatEuro(net);
    if (receiptVat) receiptVat.textContent = formatEuro(vat);
    if (receiptGross) receiptGross.textContent = formatEuro(gross);
    if (receiptPerSqm) receiptPerSqm.textContent = `${formatEuro(grossPerSquareMeter)}/m²`;
    if (jointSettings) jointSettings.hidden = !joints?.checked;

    lastConfiguration = {
      createdAt: new Date().toISOString(),
      stoneType: stoneType.value,
      stoneLabel: selectedStone.label,
      condition: condition.value,
      conditionLabel: selectedCondition.label,
      area,
      cleaning: Boolean(cleaning?.checked),
      joints: Boolean(joints?.checked),
      jointMaterial: jointMaterial?.value || null,
      stoneWidthCm: Number(stoneWidth?.value || 0),
      stoneLengthCm: Number(stoneLength?.value || 0),
      jointWidthMm: Number(jointWidth?.value || 0),
      jointDepthMm: Number(jointDepth?.value || 0),
      impregnation: Boolean(impregnation?.checked),
      weedTreatment: Boolean(weedTreatment?.checked),
      items: items.map((item) => ({ title: item.title, total: roundTo(item.total) })),
      travel,
      net: roundTo(net),
      vat: roundTo(vat),
      gross: roundTo(gross),
      grossPerSquareMeter: roundTo(grossPerSquareMeter)
    };
    lastConfiguration.summary = buildConfigurationText(lastConfiguration);
  };

  areaInput.addEventListener('input', updateCalculator);
  areaInput.addEventListener('blur', () => { normalizeArea(); updateCalculator(); });
  areaInput.addEventListener('change', () => { normalizeArea(); updateCalculator(); });
  areaRange.addEventListener('input', () => {
    syncAreaFromRange();
    updateCalculator();
  });

  [stoneType, condition, cleaning, joints, jointMaterial, stoneWidth, stoneLength, jointWidth, jointDepth, weedTreatment, impregnation]
    .filter(Boolean)
    .forEach((element) => element.addEventListener('change', updateCalculator));

  [stoneWidth, stoneLength, jointWidth, jointDepth]
    .filter(Boolean)
    .forEach((element) => element.addEventListener('input', updateCalculator));



  inquiryButton?.addEventListener('click', () => {
    updateCalculator();
    if (!lastConfiguration) return;

    if (!lastConfiguration.items.length) {
      alert('Bitte wähle mindestens eine gewünschte Arbeit aus.');
      return;
    }

    localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(lastConfiguration));
    const target = window.location.protocol === 'file:'
      ? '../index.html?calculator=1#kontakt'
      : '/index.html?calculator=1#kontakt';
    window.location.href = target;
  });

  printButton?.addEventListener('click', () => {
    updateCalculator();
    window.print();
  });

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
    ['/datenschutz/index.html', '/datenschutz/'],
    ['/karriere/index.html', '/karriere/']
  ]);

  const cleanPath = cleanPaths.get(window.location.pathname);
  if (!cleanPath) return;

  window.history.replaceState(
    window.history.state,
    '',
    `${cleanPath}${window.location.search}${window.location.hash}`
  );
};

const runInitializer = (initializer, name) => {
  try {
    initializer();
  } catch (error) {
    console.error(`${name} konnte nicht initialisiert werden.`, error);
  }
};

runInitializer(initCleanUrlDisplay, 'Saubere URLs');
runInitializer(initBeforeAfterSliders, 'Vorher-/Nachher-Slider');
runInitializer(initImageGallery, 'Bildergalerie');
runInitializer(initFaq, 'FAQ');
runInitializer(initContactForm, 'Kontaktformular');
runInitializer(initExternalForms, 'Weitere Formulare');
runInitializer(initPriceCalculator, 'Preisrechner');
runInitializer(initScrollReveal, 'Scroll-Animationen');

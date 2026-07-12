// ===== VORHER/NACHHER-SLIDER =====
document.querySelectorAll('.ba-wrap').forEach((slider) => {
  const afterImage = slider.querySelector('.ba-after');
  const handle = slider.querySelector('.ba-handle');

  const updateSlider = (clientX) => {
    const bounds = slider.getBoundingClientRect();
    const position = Math.max(0, Math.min(clientX - bounds.left, bounds.width));
    const percent = (position / bounds.width) * 100;

    afterImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    handle.style.left = `${percent}%`;
  };

  slider.addEventListener('pointerdown', (event) => {
    slider.setPointerCapture(event.pointerId);
    updateSlider(event.clientX);
  });

  slider.addEventListener('pointermove', (event) => {
    if (!slider.hasPointerCapture(event.pointerId)) return;
    updateSlider(event.clientX);
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const currentPercent = Number.parseFloat(handle.style.left) || 50;
    const direction = event.key === 'ArrowLeft' ? -5 : 5;
    const nextPercent = Math.max(0, Math.min(currentPercent + direction, 100));
    const bounds = slider.getBoundingClientRect();

    updateSlider(bounds.left + (bounds.width * nextPercent) / 100);
  });
});

// ===== PREISRECHNER =====
const cleaningType = document.getElementById('reinigungsart');
const areaInput = document.getElementById('flaeche');
const areaValue = document.getElementById('flaecheValue');
const priceOutput = document.getElementById('preisAnzeigen');

const pricePerSquareMetre = {
  terrasse: 10,
  einfahrt: 12,
  fugen: 15,
};

const calculatePrice = () => {
  const area = Number.parseInt(areaInput.value, 10);
  const price = area * pricePerSquareMetre[cleaningType.value];

  areaValue.textContent = area;
  priceOutput.textContent = price.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

cleaningType.addEventListener('change', calculatePrice);
areaInput.addEventListener('input', calculatePrice);
calculatePrice();

// ===== FAQ =====
document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', String(!isOpen));
    answer.classList.toggle('is-open', !isOpen);
  });
});

// ===== KONTAKTFORMULAR =====
const contactForm = document.getElementById('contactForm');
const feedback = document.getElementById('cfFeedback');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Platzhalter: Hier muss noch ein echter Versanddienst angebunden werden.
  feedback.hidden = false;
  contactForm.reset();
});

console.log("Website läuft");

// ======== VORHER/NACHHER SLIDER ========
const sliders = document.querySelectorAll('.ba-wrap');

sliders.forEach(slider => {
  const after = slider.querySelector('.ba-after');
  const handle = slider.querySelector('.ba-handle');

  let isDragging = false;

  const updateSlider = (x) => {
    const rect = slider.getBoundingClientRect();
    let position = x - rect.left;
    position = Math.max(0, Math.min(position, rect.width));

    const percent = (position / rect.width) * 100;

    after.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    handle.style.left = `${percent}%`;
  };

  handle.addEventListener('mousedown', () => {
    isDragging = true;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  // Startposition Mitte
  updateSlider(slider.getBoundingClientRect().left + slider.offsetWidth / 2);
});

// ======== KONTAKTFORMULAR / ANFRAGEPORTAL ========
const cfName = document.getElementById('cfName');
const cfEmail = document.getElementById('cfEmail');
const cfMessage = document.getElementById('cfMessage');
const cfSubmit = document.getElementById('cfSubmit');
const cfFeedback = document.getElementById('cfFeedback');

cfSubmit.addEventListener('click', () => {
  if (!cfName.value || !cfEmail.value || !cfMessage.value) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }
  
  // Hier könntest du die Daten an einen Server senden (Fetch/Ajax)
  console.log("Nachricht gesendet:", {
    name: cfName.value,
    email: cfEmail.value,
    message: cfMessage.value
  });

  cfFeedback.style.display = 'block';
  cfName.value = '';
  cfEmail.value = '';
  cfMessage.value = '';
});

// ======== PREISRECHNER ========
const reinigungsart = document.getElementById('reinigungsart');
const flaeche = document.getElementById('flaeche');
const flaecheValue = document.getElementById('flaecheValue');
const preisAnzeigen = document.getElementById('preisAnzeigen');

// Preise pro m² je Leistung
const preisProM2 = {
  terrasse: 10,
  einfahrt: 12,
  fugen: 15,
};

// Berechnung
const berechnePreis = () => {
  const art = reinigungsart.value;
  const qm = parseInt(flaeche.value);
  const preis = qm * preisProM2[art];
  flaecheValue.textContent = qm;
  preisAnzeigen.textContent = preis.toFixed(2);
};

// Event Listener
reinigungsart.addEventListener('change', berechnePreis);
flaeche.addEventListener('input', berechnePreis);

// Initialer Preis
berechnePreis();

// ======== FAQ TOGGLE ========
const faqButtons = document.querySelectorAll('.faq-question');

faqButtons.forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
  });
});

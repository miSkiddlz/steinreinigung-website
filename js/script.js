console.log("Website läuft");

// ======== VORHER/NACHHER SLIDER ========
const baWrap = document.querySelector('.ba-wrap');
const baAfter = document.querySelector('.ba-after');
const baHandle = document.querySelector('.ba-handle');

if (baWrap && baAfter && baHandle) {
  const moveHandle = (x) => {
    const rect = baWrap.getBoundingClientRect();
    let pos = x - rect.left;
    pos = Math.max(0, Math.min(pos, rect.width));
    const percent = (pos / rect.width) * 100;
    baAfter.style.width = percent + '%';
    baHandle.style.left = percent + '%';
  };

  baWrap.addEventListener('mousemove', (e) => moveHandle(e.clientX));
  baWrap.addEventListener('touchmove', (e) => moveHandle(e.touches[0].clientX));
}

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

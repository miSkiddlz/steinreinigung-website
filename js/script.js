console.log("Website läuft");

const slider = document.getElementById('sliderRange');

if (slider) {
  slider.addEventListener('input', function () {
    const after = document.querySelector('.after');
    after.style.clipPath = `inset(0 ${100 - this.value}% 0 0)`;
  });
}

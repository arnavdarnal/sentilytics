// Initialize the hero slider interface and set up automatic slide rotation
export function initHeroSlider() {
  const $slides = $(".hero-slider .slide");
  if ($slides.length === 0) return;

  let currentIndex = 0;
  const slideInterval = 5000;

  // Transition to the next slide in the sequence, looping back to the first slide after the last one
  function showNextSlide() {
    $slides.eq(currentIndex).removeClass("active");
    currentIndex = (currentIndex + 1) % $slides.length;
    $slides.eq(currentIndex).addClass("active");
  }

  // Set up an interval timer to automatically transition to the next slide every 5 seconds, but only if there is more than one slide
  if ($slides.length > 1) {
    setInterval(showNextSlide, slideInterval);
  }
}

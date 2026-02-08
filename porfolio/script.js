const sliderTrack = document.querySelector(".slider-track");
const sliderThumb = document.querySelector(".slider-thumb");
const robot = document.querySelector(".spline-bg");
const btn = document.querySelectorAll(".post-link");
const wrapper = document.querySelector(".card-wrapper");
const list = document.querySelector(".card-list");
const autoWords = document.querySelectorAll(".Autotype");
const navLinks = document.querySelectorAll(".navigation a");
const hireButtons = document.querySelectorAll(".hire-me");
const sections = document.querySelectorAll("section");

let isGrabbed = false;

/* -------- Helpers -------- */
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

function updateFromX(clientX) {
  const trackRect = sliderTrack.getBoundingClientRect();
  let x = clientX - trackRect.left;
  const maxX = sliderTrack.clientWidth - sliderThumb.offsetWidth;
  x = clamp(x, 0, maxX);

  sliderThumb.style.left = `${x}px`;
  const progress = x / maxX;
  window.scrollTo(0, progress * maxScroll());
}

// Robot positions for sections
const robotPositions = [0, 600, 0, -600];
const sectionTops = Array.from(sections).map(sec => sec.offsetTop);

// Update robot on scroll
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  let robotX = robotPositions[0];

  for (let i = 0; i < sectionTops.length - 1; i++) {
    const start = sectionTops[i];
    const end = sectionTops[i + 1];
    const startX = robotPositions[i];
    const endX = robotPositions[i + 1];

    if (scrollY >= start && scrollY <= end) {
      const t = (scrollY - start) / (end - start);
      robotX = startX + (endX - startX) * t;
      break;
    }
  }

  robot.style.transform = `translateX(${robotX}px)`;
});

/* =========================
   GRAB — THUMB ONLY
   ========================= */
sliderThumb.addEventListener("mousedown", (e) => {
  e.preventDefault();
  e.stopPropagation();
  isGrabbed = true;
  sliderThumb.classList.add("grabbing");
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isGrabbed) return;
  updateFromX(e.clientX);
});

document.addEventListener("mouseup", () => {
  if (!isGrabbed) return;
  isGrabbed = false;
  sliderThumb.classList.remove("grabbing");
  document.body.style.userSelect = "";
});

sliderThumb.addEventListener("touchstart", (e) => {
  isGrabbed = true;
  e.stopPropagation();
});

document.addEventListener("touchmove", (e) => {
  if (!isGrabbed) return;
  updateFromX(e.touches[0].clientX);
}, { passive: true });

document.addEventListener("touchend", () => {
  isGrabbed = false;
});

function syncThumbWithScroll() {
  if (isGrabbed) return;
  const maxX = sliderTrack.clientWidth - sliderThumb.offsetWidth;
  const ratio = window.scrollY / maxScroll();
  sliderThumb.style.left = `${maxX * ratio}px`;
}

window.addEventListener("scroll", syncThumbWithScroll);
window.addEventListener("resize", syncThumbWithScroll);
syncThumbWithScroll();

// Post link buttons
btn.forEach(button => {
  button.addEventListener("click", () => {
    const url = button.getAttribute("data-link");
    window.open(url, "_blank");
  });
});

// Card auto scroll
let cards = Array.from(document.querySelectorAll(".card-items"));
let position = 0;
let targetPosition = 0;
let speed = 5;
let isPaused = false;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function recycleCards() {
  const firstCard = cards[0];
  const firstCardWidth = firstCard.offsetWidth + 20;
  if (-position >= firstCardWidth) {
    position += firstCardWidth;
    targetPosition += firstCardWidth;
    list.appendChild(firstCard);
    cards.push(cards.shift());
  }
}

function animate() {
  if (!isPaused) targetPosition -= speed;
  position = lerp(position, targetPosition, 0.08);
  list.style.transform = `translateX(${position}px)`;
  recycleCards();
  requestAnimationFrame(animate);
}

animate();

cards.forEach(card => {
  card.addEventListener("mouseenter", () => {
    isPaused = true;
    targetPosition = -(card.offsetLeft - wrapper.offsetWidth / 2 + card.offsetWidth / 2);
  });
  card.addEventListener("mouseleave", () => { isPaused = false; });
});

// Autotype
var options = {
  strings: ["Game Developer", "Game Designer", "3D Artist", "Electronics Engineer"],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true
};
var typed = new Typed(".Autotype", options);

// ------------------------
// NAVBAR & HIRE ME BUTTON
// ------------------------

// Set home active on load
window.addEventListener("DOMContentLoaded", () => {
  navLinks.forEach(link => link.classList.remove("active"));
  const homeLink = document.querySelector('.navigation a[data-target="home"]');
  if (homeLink) homeLink.classList.add("active");
});

// Nav link clicks
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const targetId = link.dataset.target;
    const section = document.getElementById(targetId);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Hire me button clicks
hireButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) contactSection.scrollIntoView({ behavior: "smooth", block: "start" });

    // Update navbar active
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.dataset.target === "contact") link.classList.add("active");
    });
  });
});

/* =========================
   UPDATE NAV ACTIVE ON SCROLL
   ========================= */
function updateNavActiveOnScroll() {
  let currentSectionId = sections[0].id; // default

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
      currentSectionId = sec.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.dataset.target === currentSectionId) link.classList.add("active");
  });
}

window.addEventListener("scroll", updateNavActiveOnScroll);
window.addEventListener("resize", updateNavActiveOnScroll);
window.addEventListener("load", updateNavActiveOnScroll);

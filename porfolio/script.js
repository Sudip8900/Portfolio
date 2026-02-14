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

/* =========================
   ROBOT CONTROL
   ========================= */
let robotCurrentX = 0;
let robotTargetX = 0;
let robotManualMove = false;
let latestScrollY = window.scrollY;
let scrollTicking = false;

/* -------- Helpers -------- */
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
const maxScroll = () =>
  document.documentElement.scrollHeight - window.innerHeight;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* =========================
   SLIDER → SCROLL
   ========================= */
function updateFromX(clientX) {
  const trackRect = sliderTrack.getBoundingClientRect();
  let x = clientX - trackRect.left;
  const maxX = sliderTrack.clientWidth - sliderThumb.offsetWidth;
  x = clamp(x, 0, maxX);

  sliderThumb.style.left = `${x}px`;
  window.scrollTo(0, (x / maxX) * maxScroll());
}

/* =========================
   ROBOT DATA
   ========================= */
const robotPositions = [0, 600, 0, -600];
let sectionTops = [];

function updateSectionTops() {
  sectionTops = Array.from(sections).map(sec => sec.offsetTop);
}
updateSectionTops();

/* =========================
   SCROLL HANDLER (LIGHT)
   ========================= */
window.addEventListener(
  "scroll",
  () => {
    latestScrollY = window.scrollY;
    scrollTicking = true;
  },
  { passive: true }
);

/* =========================
   ROBOT ANIMATION LOOP
   ========================= */
function animateRobot() {
  if (scrollTicking && !robotManualMove) {
    scrollTicking = false;

    for (let i = 0; i < sectionTops.length - 1; i++) {
      const start = sectionTops[i];
      const end = sectionTops[i + 1];

      if (latestScrollY >= start && latestScrollY <= end) {
        const t = (latestScrollY - start) / (end - start);
        robotTargetX =
          robotPositions[i] +
          (robotPositions[i + 1] - robotPositions[i]) * t;
        break;
      }
    }
  }

  robotCurrentX = lerp(robotCurrentX, robotTargetX, 0.12);
  robot.style.transform = `translate3d(${robotCurrentX}px,0,0)`;

  requestAnimationFrame(animateRobot);
}
animateRobot();

/* =========================
   SLIDER GRAB
   ========================= */
sliderThumb.addEventListener("mousedown", e => {
  e.preventDefault();
  isGrabbed = true;
  sliderThumb.classList.add("grabbing");
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", e => {
  if (isGrabbed) updateFromX(e.clientX);
});

document.addEventListener("mouseup", () => {
  isGrabbed = false;
  sliderThumb.classList.remove("grabbing");
  document.body.style.userSelect = "";
});

sliderThumb.addEventListener("touchstart", () => (isGrabbed = true));
document.addEventListener(
  "touchmove",
  e => isGrabbed && updateFromX(e.touches[0].clientX),
  { passive: true }
);
document.addEventListener("touchend", () => (isGrabbed = false));

function syncThumbWithScroll() {
  if (isGrabbed) return;
  const maxX = sliderTrack.clientWidth - sliderThumb.offsetWidth;
  sliderThumb.style.left = `${(window.scrollY / maxScroll()) * maxX}px`;
}

addEventListener("scroll", syncThumbWithScroll);
addEventListener("resize", () => {
  syncThumbWithScroll();
  updateSectionTops();
});

/* =========================
   EXTERNAL LINKS
   ========================= */
btn.forEach(b =>
  b.addEventListener("click", () => window.open(b.dataset.link, "_blank"))
);

/* =========================
   CARD AUTO SCROLL
   ========================= */
let cards = Array.from(document.querySelectorAll(".card-items"));
let position = 0;
let targetPosition = 0;
let speed = 5;
let isPaused = false;

function recycleCards() {
  const w = cards[0].offsetWidth + 20;
  if (-position >= w) {
    position += w;
    targetPosition += w;
    list.appendChild(cards.shift());
    cards.push(cards[cards.length - 1]);
  }
}

function animateCards() {
  if (!isPaused) targetPosition -= speed;
  position = lerp(position, targetPosition, 0.08);
  list.style.transform = `translateX(${position}px)`;
  recycleCards();
  requestAnimationFrame(animateCards);
}
animateCards();

/* =========================
   AUTOTYPE
   ========================= */
new Typed(".Autotype", {
  strings: ["Game Developer", "Game Designer", "3D Artist", "Electronics Engineer"],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true
});

/* =========================
   NAV + HIRE ME
   ========================= */
window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector('.navigation a[data-target="home"]')
    ?.classList.add("active");
});

function jumpRobotToSection(id) {
  const index = [...sections].findIndex(s => s.id === id);
  if (index === -1) return;

  robotManualMove = true;
  robotTargetX = robotPositions[index];
  setTimeout(() => (robotManualMove = false), 600);
}

navLinks.forEach(link =>
  link.addEventListener("click", e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    jumpRobotToSection(link.dataset.target);
    document.getElementById(link.dataset.target)?.scrollIntoView({
      behavior: "smooth"
    });
  })
);

hireButtons.forEach(b =>
  b.addEventListener("click", () => {
    jumpRobotToSection("contact");
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    navLinks.forEach(l =>
      l.classList.toggle("active", l.dataset.target === "contact")
    );
  })
);

/* =========================
   UPDATE NAV ON SCROLL
   ========================= */
function updateNavActiveOnScroll() {
  let current = sections[0].id;

  sections.forEach(sec => {
    const r = sec.getBoundingClientRect();
    if (r.top <= innerHeight * 0.5 && r.bottom >= innerHeight * 0.5)
      current = sec.id;
  });

  navLinks.forEach(link =>
    link.classList.toggle("active", link.dataset.target === current)
  );
}

addEventListener("scroll", updateNavActiveOnScroll, { passive: true });
addEventListener("resize", updateNavActiveOnScroll);
addEventListener("load", updateNavActiveOnScroll);


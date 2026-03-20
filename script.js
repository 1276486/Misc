const scenes = Array.from(document.querySelectorAll(".scene"));
const dots = Array.from(document.querySelectorAll(".indicator-dot"));
const avatar = document.querySelector("#avatar-figure");
const counters = Array.from(document.querySelectorAll(".hero-stats strong, .metrics-grid strong"));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateSceneState = () => {
  const viewportHeight = window.innerHeight;
  let activeIndex = 0;
  let bestVisibility = -1;

  scenes.forEach((scene, index) => {
    const rect = scene.getBoundingClientRect();
    const visible = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    const visibility = clamp(visible / viewportHeight, 0, 1);
    const centerDistance = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
    const progress = clamp(1 - centerDistance / viewportHeight, 0, 1);

    scene.style.setProperty("--scene-progress", progress.toFixed(4));

    if (visibility > bestVisibility) {
      bestVisibility = visibility;
      activeIndex = index;
    }
  });

  scenes.forEach((scene, index) => {
    scene.classList.toggle("is-active", index === activeIndex);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
};

const updateAvatar = () => {
  if (!avatar) {
    return;
  }

  const scrollProgress = clamp(window.scrollY / window.innerHeight, 0, 4);
  const rotateY = -14 + scrollProgress * 6;
  const rotateX = 6 - scrollProgress * 0.8;
  const lift = Math.min(scrollProgress * 12, 30);
  const scale = 1 + Math.min(scrollProgress * 0.02, 0.08);

  avatar.style.transform =
    `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${-lift}px) scale(${scale})`;
};

const updateAll = () => {
  updateSceneState();
  updateAvatar();
};

let countersStarted = false;

const animateCounters = () => {
  if (countersStarted) {
    return;
  }

  countersStarted = true;

  counters.forEach((node) => {
    const text = node.textContent.trim();
    const match = text.match(/(\d[\d,.]*)/);

    if (!match) {
      return;
    }

    const target = Number(match[1].replace(/,/g, ""));

    if (Number.isNaN(target)) {
      return;
    }

    const prefix = text.slice(0, match.index);
    const suffix = text.slice((match.index || 0) + match[1].length);
    const duration = 1000;
    const start = performance.now();

    const tick = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const value = Math.round(target * progress);
      const formatted = match[1].includes(",") ? value.toLocaleString("en-US") : value.toString();
      node.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        node.textContent = text;
      }
    };

    requestAnimationFrame(tick);
  });
};

updateAll();
window.addEventListener("scroll", updateAll, { passive: true });
window.addEventListener("resize", updateAll);
window.setTimeout(animateCounters, 250);

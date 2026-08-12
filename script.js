(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal (fade/scale each time a section enters view) ---------- */
  var targets = document.querySelectorAll(".reveal-target");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            // Remove so it can gently replay next time the section is scrolled back into view
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.35 }
    );
    targets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Page dots: highlight current section + smooth-scroll on click ---------- */
  var sections = document.querySelectorAll(".reveal-section");
  var dots = document.querySelectorAll(".page-dots .dot");

  if (sections.length && dots.length && "IntersectionObserver" in window) {
    var dotObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            dots.forEach(function (dot) {
              dot.classList.toggle("active", dot.dataset.target === id);
            });
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach(function (s) { dotObserver.observe(s); });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.getElementById(dot.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---------- Subtle parallax on the floral watermark ---------- */
  if (!reduceMotion) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            document.documentElement.style.setProperty("--scrollY", window.scrollY);
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Countdown to the wedding ---------- */
  var countdownEl = document.getElementById("countdown");
  if (countdownEl) {
    var weddingDate = new Date("2026-09-26T18:00:00+03:00").getTime();
    var daysEl = countdownEl.querySelector('[data-unit="days"]');
    var hoursEl = countdownEl.querySelector('[data-unit="hours"]');
    var minsEl = countdownEl.querySelector('[data-unit="minutes"]');

    function updateCountdown() {
      var now = Date.now();
      var diff = weddingDate - now;

      if (diff <= 0) {
        countdownEl.style.display = "none";
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var mins = Math.floor((diff / (1000 * 60)) % 60);

      daysEl.textContent = days;
      hoursEl.textContent = String(hours).padStart(2, "0");
      minsEl.textContent = String(mins).padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 30000);
  }
})();
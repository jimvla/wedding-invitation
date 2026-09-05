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


document.getElementById('photoInput').addEventListener('change', function() {
    const fileText = document.getElementById('fileChosenText');
    if (this.files.length > 0) {
        fileText.textContent = this.files.length === 1 
            ? 'Επιλέχθηκε 1 αρχείο' 
            : `Επιλέχθηκαν ${this.files.length} αρχεία`;
        fileText.style.color = 'var(--accent)';
    } else {
        fileText.textContent = 'Επιλέξτε φωτογραφίες γάμου...';
        fileText.style.color = 'var(--muted)';
    }
});


const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // <-- Σταματάει το flickering, μένει σταθερό!
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll('.reveal-target').forEach(el => {
    observer.observe(el);
});


window.addEventListener('load', () => {
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 300); // 300ms καθυστέρηση για να προλάβει να «καθίσει» το layout
        }
    }
});


document.getElementById('uploadBtn').addEventListener('click', async function() {
    const fileInput = document.getElementById('photoInput');
    const files = fileInput.files;
    const statusDiv = document.getElementById('uploadStatus');
    const progressContainer = document.getElementById('uploadProgressContainer');
    const progressBar = document.getElementById('uploadProgressBar');
    
    statusDiv.textContent = '';
    statusDiv.className = 'upload-status';

    if (files.length === 0) return;

    const API_URL = 'https://dimitris-maria-wedding-api-and6aefyd3aga7c9.italynorth-01.azurewebsites.net/api/upload-photo';
    //const API_URL = 'http://localhost:5041/api/upload-photo'; // Τοπικό endpoint για ανάπτυξη

    const uploadBtn = this;
    const originalText = uploadBtn.textContent;
    
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="spinner"></span> Μεταφόρτωση...';
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    let uploadedCount = 0;

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch(API_URL, {
                method: 'POST',
                body: formData 
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.error || `Αποτυχία στο αρχείο ${file.name}`);
            }

            uploadedCount++;
            
            // Ενημέρωση μπάρας προόδου βάσει των αρχείων που ανέβηκαν
            const progressPercent = ((i + 1) / files.length) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }

        statusDiv.textContent = `Επιτυχία! Ανέβηκαν ${uploadedCount} φωτογραφίες. Σας ευχαριστούμε!`;
        statusDiv.className = 'upload-status success';
        fileInput.value = '';
        document.getElementById('fileChosenText').textContent = 'Επιλέξτε φωτογραφίες γάμου...';
        document.getElementById('fileChosenText').style.color = 'var(--muted)';

    } catch (error) {
        console.error('Σφάλμα:', error);
        statusDiv.textContent = error.message || 'Πρόβλημα σύνδεσης κατά τη μεταφόρτωση.';
        statusDiv.className = 'upload-status error';
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        
        // Απόκρυψη της μπάρας μετά από λίγο
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
        }, 1500);
    }
});



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
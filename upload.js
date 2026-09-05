(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal (fade/scale in once) ---------- */
  var targets = document.querySelectorAll(".reveal-target");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach(function (el) { revealObserver.observe(el); });
  }

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

  /* ---------- File input label ---------- */
  var photoInput = document.getElementById("photoInput");
  var fileText = document.getElementById("fileChosenText");

  photoInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      fileText.textContent = this.files.length === 1
        ? "Επιλέχθηκε 1 αρχείο"
        : `Επιλέχθηκαν ${this.files.length} αρχεία`;
      fileText.style.color = "var(--accent)";
    } else {
      fileText.textContent = "Επιλέξτε φωτογραφίες ...";
      fileText.style.color = "var(--muted)";
    }
  });

  /* ---------- Upload logic ---------- */
  document.getElementById("uploadBtn").addEventListener("click", async function () {
    const fileInput = photoInput;
    const files = fileInput.files;
    const statusDiv = document.getElementById("uploadStatus");
    const progressContainer = document.getElementById("uploadProgressContainer");
    const progressBar = document.getElementById("uploadProgressBar");

    statusDiv.textContent = "";
    statusDiv.className = "upload-status";

    if (files.length === 0) return;

    const API_URL = "https://dimitris-maria-wedding-api-and6aefyd3aga7c9.italynorth-01.azurewebsites.net/api/upload-photo";
    // const API_URL = "http://localhost:5041/api/upload-photo"; // Τοπικό endpoint για ανάπτυξη

    const uploadBtn = this;
    const originalText = uploadBtn.textContent;

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="spinner"></span> Μεταφόρτωση...';

    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    let uploadedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(API_URL, {
          method: "POST",
          body: formData
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || `Αποτυχία στο αρχείο ${file.name}`);
        }

        uploadedCount++;

        const progressPercent = ((i + 1) / files.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
      }

      statusDiv.textContent = `Επιτυχία! Ανέβηκαν ${uploadedCount} φωτογραφίες. Σας ευχαριστούμε!`;
      statusDiv.className = "upload-status success";
      fileInput.value = "";
      fileText.textContent = "Επιλέξτε φωτογραφίες ...";
      fileText.style.color = "var(--muted)";

    } catch (error) {
      console.error("Σφάλμα:", error);
      statusDiv.textContent = error.message || "Πρόβλημα σύνδεσης κατά τη μεταφόρτωση.";
      statusDiv.className = "upload-status error";
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = originalText;

      setTimeout(() => {
        progressContainer.style.display = "none";
        progressBar.style.width = "0%";
      }, 1500);
    }
  });
})();

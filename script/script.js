const sanitizeHTML = (str) => {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
};

const isValidURL = (url) => {
  try {
    const urlObj = new URL(url);
    return ["http:", "https:"].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

const createSafeElement = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const rateLimiter = {
  actions: {},
  isAllowed(action, limit = 5, window = 60000) {
    const now = Date.now();
    if (!this.actions[action]) {
      this.actions[action] = [];
    }

    this.actions[action] = this.actions[action].filter(
      (time) => now - time < window
    );

    if (this.actions[action].length >= limit) {
      return false;
    }

    this.actions[action].push(now);
    return true;
  },
};

const toggleLoading = (show) => {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.style.display = show ? "flex" : "none";
  }
};

const showError = (message) => {
  const errorMsg = document.getElementById("errorMessage");
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
    setTimeout(() => {
      errorMsg.style.display = "none";
    }, 5000);
  }
};

const showSuccess = (message) => {
  const successMsg = document.createElement("div");
  successMsg.className = "success-message";
  successMsg.textContent = message;
  document.body.appendChild(successMsg);
  setTimeout(() => {
    successMsg.classList.add("show");
  }, 10);
  setTimeout(() => {
    successMsg.classList.remove("show");
    setTimeout(() => successMsg.remove(), 300);
  }, 3000);
};

toggleLoading(true);

fetch("config.json")
  .then((response) => {
    if (!response.ok) throw new Error("Gagal memuat konfigurasi");
    return response.json();
  })
  .then((data) => {
    const timelineContainer = document.querySelector(".timeline");
    let timelineHTML = `<h2>TIMELINE</h2>`;
    const year = new Date().getFullYear();

    data.timeline.forEach((item) => {
      const safeIcon = sanitizeHTML(item.icon);
      const safeTitle = sanitizeHTML(item.title);
      const safeDate = sanitizeHTML(item.date);

      timelineHTML += `
                    <div class="timeline-item">
                        <div class="timeline-icon">${safeIcon}</div>
                        <div class="timeline-content">
                            <h3>${safeTitle}</h3>
                            <p>${safeDate} ${year}</p>
                        </div>
                    </div>
                `;
    });

    const footerCapt = document.getElementById("footerCapt");
    footerCapt.innerHTML = "";

    data.footer_text.forEach((item) => {
      let url = "#";
      const safeIcon = sanitizeHTML(item.icon);
      const safeText = sanitizeHTML(item.text);

      if (item.icon === "📱") {
        url = "https://instagram.com/" + encodeURIComponent(item.text);
      } else if (item.icon === "🌐") {
        const fullUrl = "https://" + item.text;
        url = isValidURL(fullUrl) ? fullUrl : "#";
      } else if (item.icon === "📞") {
        let num = item.text.replace(/\D/g, "");
        if (num.startsWith("0")) {
          num = "62" + num.substring(1);
        }
        url = "https://wa.me/" + encodeURIComponent(num);
      }

      footerCapt.innerHTML += `
                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="color:white; text-decoration:none;">
                        ${safeIcon} ${safeText}
                    </a>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                `;
    });

    timelineContainer.innerHTML = timelineHTML;

    const contactList = document.querySelector(".contact-list");
    contactList.innerHTML = "";

    data.contacts.forEach((c) => {
      const safeName = sanitizeHTML(c.name);
      const safePhone = sanitizeHTML(c.phone);

      let num = c.phone.replace(/\D/g, "");

      if (num.startsWith("0")) {
        num = "62" + num.substring(1);
      }

      let waLink = c.whatsapp + encodeURIComponent(num);

      if (!isValidURL(waLink)) {
        waLink = "#";
      }

      contactList.innerHTML += `
                    <div class="contact-item">
                        <strong>${safeName}</strong><br>
                        <a href="${waLink}" target="_blank" rel="noopener noreferrer" style="color:white; text-decoration:none;">
                            ${safePhone}
                        </a>
                    </div>
                `;
    });

    if (data.text_to_qr && isValidURL(data.text_to_qr)) {
      const qrImg = document.getElementById("qrImage");
      const qrLoading = document.getElementById("qrLoading");

      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        data.text_to_qr
      )}`;

      qrImg.onload = () => {
        qrImg.style.display = "block";
        if (qrLoading) qrLoading.style.display = "none";
      };

      qrImg.onerror = () => {
        if (qrLoading) {
          qrLoading.textContent = "❌ Gagal memuat QR";
          qrLoading.style.color = "#e74c3c";
        }
        showError("Gagal memuat QR Code");
      };

      const registerBtn = document.getElementById("registerBtn");
      registerBtn.href = data.text_to_qr;
    } else {
      showError("URL pendaftaran tidak valid");
    }

    const reqList = document.getElementById("reqList");
    reqList.innerHTML = "";
    data.persyaratan.forEach((item) => {
      const safeItem = sanitizeHTML(item);
      reqList.innerHTML += `<li>${safeItem}</li>`;
    });

    const benefitList = document.getElementById("benefitList");
    benefitList.innerHTML = "";
    data.benefit.forEach((item) => {
      const safeItem = sanitizeHTML(item);
      benefitList.innerHTML += `<li>${safeItem}</li>`;
    });

    if (data.countdown_deadline) {
      initCountdown({
        deadline: data.countdown_deadline.date,
        time: data.countdown_deadline.time,
      });
    } else {
      initCountdown({
        deadline: "19 Desember 2025",
        time: "23:59:59",
      });
    }

    toggleLoading(false);
  })
  .catch((error) => {
    console.error("Gagal mengambil config:", error);
    showError("Gagal memuat data. Silakan refresh halaman.");
    toggleLoading(false);
  });

const saveQRBtn = document.getElementById("saveQRBtn");
saveQRBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!rateLimiter.isAllowed("saveQR", 3, 60000)) {
    showError("Terlalu banyak percobaan. Tunggu 1 menit.");
    return;
  }

  const qrImgSrc = document.getElementById("qrImage").src;

  if (!qrImgSrc || qrImgSrc === "") {
    showError("QR Code belum dimuat");
    return;
  }

  saveQRBtn.disabled = true;
  saveQRBtn.innerHTML = "<span>⏳</span> Menyimpan...";

  try {
    const resp = await fetch(qrImgSrc, { mode: "cors" });
    if (!resp.ok) throw new Error("Network response was not ok");
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr_aslab_pendaftaran.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess("QR Code berhasil disimpan!");
    saveQRBtn.innerHTML = "<span>💾</span> SIMPAN QR";
    saveQRBtn.disabled = false;
    return;
  } catch (err) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = qrImgSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "qr_aslab_pendaftaran.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("QR Code berhasil disimpan!");
      saveQRBtn.innerHTML = "<span>💾</span> SIMPAN QR";
      saveQRBtn.disabled = false;
      return;
    } catch (err2) {
      showError("Gagal menyimpan otomatis. Gambar akan dibuka di tab baru.");
      window.open(qrImgSrc, "_blank");
      saveQRBtn.innerHTML = "<span>💾</span> SIMPAN QR";
      saveQRBtn.disabled = false;
    }
  }
});

const copyLinkBtn = document.getElementById("copyLinkBtn");
if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!rateLimiter.isAllowed("copyLink", 5, 60000)) {
      showError("Terlalu banyak percobaan. Tunggu 1 menit.");
      return;
    }

    const registerBtn = document.getElementById("registerBtn");
    const linkToCopy = registerBtn ? registerBtn.href : "";

    if (!linkToCopy || linkToCopy === "#") {
      showError("Link pendaftaran tidak tersedia");
      return;
    }

    try {
      await navigator.clipboard.writeText(linkToCopy);
      copyLinkBtn.innerHTML = "<span>✅</span> TERSALIN!";
      showSuccess("Link berhasil disalin ke clipboard!");
      setTimeout(() => {
        copyLinkBtn.innerHTML = "<span>🔗</span> SALIN LINK";
      }, 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = linkToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showSuccess("Link berhasil disalin!");
        copyLinkBtn.innerHTML = "<span>✅</span> TERSALIN!";
        setTimeout(() => {
          copyLinkBtn.innerHTML = "<span>🔗</span> SALIN LINK";
        }, 2000);
      } catch (err) {
        showError("Gagal menyalin link");
      }
      document.body.removeChild(textArea);
    }
  });
}

function initCountdown(deadlineData) {
  const deadlineText = deadlineData.deadline;
  const deadlineTime = deadlineData.time;

  const months = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  const [day, monthName, year] = deadlineText.split(" ");
  const month = months[monthName];
  const isoDate = `${year}-${month}-${day.padStart(2, "0")}`;

  const deadline = new Date(`${isoDate}T${deadlineTime}`).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance < 0) {
      document.getElementById("countdown").innerHTML =
        '<p style="color: #e74c3c; font-weight: bold;">Pendaftaran Ditutup</p>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(
      2,
      "0"
    );
    document.getElementById("minutes").textContent = String(minutes).padStart(
      2,
      "0"
    );
    document.getElementById("seconds").textContent = String(seconds).padStart(
      2,
      "0"
    );
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const faqItem = button.parentElement;
    const wasActive = faqItem.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("active");
      item.querySelector(".faq-icon").textContent = "+";
    });

    if (!wasActive) {
      faqItem.classList.add("active");
      button.querySelector(".faq-icon").textContent = "−";
    }
  });
});

const shareData = {
  title: "Open Recruitment ASLAB",
  text: "🎓 Open Recruitment Asisten Laboratorium! Kesempatan emas untuk mengembangkan skill dan pengalaman. Daftar sekarang!",
  url: window.location.href,
};

document.getElementById("shareWA")?.addEventListener("click", () => {
  if (!rateLimiter.isAllowed("share", 10, 60000)) {
    showError("Terlalu banyak percobaan share.");
    return;
  }
  const text = encodeURIComponent(shareData.text + " " + shareData.url);
  window.open(`https://wa.me/?text=${text}`, "_blank");
});

document.getElementById("shareTelegram")?.addEventListener("click", () => {
  if (!rateLimiter.isAllowed("share", 10, 60000)) {
    showError("Terlalu banyak percobaan share.");
    return;
  }
  const text = encodeURIComponent(shareData.text);
  const url = encodeURIComponent(shareData.url);
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
});

document.getElementById("shareTwitter")?.addEventListener("click", () => {
  if (!rateLimiter.isAllowed("share", 10, 60000)) {
    showError("Terlalu banyak percobaan share.");
    return;
  }
  const text = encodeURIComponent(shareData.text);
  const url = encodeURIComponent(shareData.url);
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    "_blank"
  );
});

document.getElementById("shareFB")?.addEventListener("click", () => {
  if (!rateLimiter.isAllowed("share", 10, 60000)) {
    showError("Terlalu banyak percobaan share.");
    return;
  }
  const url = encodeURIComponent(shareData.url);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
});

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showError('Untuk mengunduh, gunakan tombol "SIMPAN QR"');
  });
});

window.addEventListener("beforeprint", () => {
  const watermark = document.createElement("div");
  watermark.id = "print-watermark";
  watermark.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 72px;
    color: rgba(0, 0, 0, 0.1);
    pointer-events: none;
    z-index: 9999;
    font-weight: bold;
  `;
  watermark.textContent = "ASLAB UNPAM";
  document.body.appendChild(watermark);
});

window.addEventListener("afterprint", () => {
  const watermark = document.getElementById("print-watermark");
  if (watermark) watermark.remove();
});

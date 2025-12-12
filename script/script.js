const StorageManager = {
  dbName: "AslabRecruitmentDB",
  dbVersion: 1,
  storeName: "userData",
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, {
            keyPath: "id",
          });
          objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  },

  async saveData(key, value) {
    try {
      if (!this.db) await this.init();

      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const data = {
        id: key,
        value: value,
        timestamp: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("IndexedDB error, fallback to localStorage:", error);
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async getData(key) {
    try {
      if (!this.db) await this.init();

      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () =>
          resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("IndexedDB error, fallback to localStorage:", error);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  },

  async getAllData() {
    try {
      if (!this.db) await this.init();

      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("IndexedDB error:", error);
      return [];
    }
  },

  async clearData(key) {
    try {
      if (!this.db) await this.init();

      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("IndexedDB error:", error);
      localStorage.removeItem(key);
    }
  },
};

const NotificationManager = {
  permission: "default",
  enabled: false,
  notificationsSent: [],

  async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("Browser tidak support notifikasi");
      return false;
    }

    if (Notification.permission === "granted") {
      this.permission = "granted";
      this.enabled = true;
      await StorageManager.saveData("notificationPermission", "granted");
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      this.enabled = permission === "granted";
      await StorageManager.saveData("notificationPermission", permission);

      if (permission === "granted") {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SCHEDULE_NOTIFICATION',
            payload: {
              title: "🎉 Notifikasi Aktif!",
              body: "Anda akan mendapat pengingat countdown deadline pendaftaran ASLAB walaupun browser ditutup!",
              delay: 1000
            }
          });
        } else {
          this.sendNotification(
            "🎉 Notifikasi Aktif!",
            "Anda akan mendapat pengingat countdown deadline pendaftaran ASLAB"
          );
        }
      }

      return permission === "granted";
    }

    return false;
  },

  async checkPermission() {
    if ("Notification" in window) {
      this.permission = Notification.permission;
      this.enabled = this.permission === "granted";

      const savedPermission = await StorageManager.getData(
        "notificationPermission"
      );
      if (savedPermission === "granted" && this.permission !== "granted") {
        this.enabled = false;
      }
    }
    return this.enabled;
  },

  sendNotification(title, body, options = {}) {
    if (!this.enabled || this.permission !== "granted") return;

    const safeTitle = String(title).substring(0, 100);
    const safeBody = String(body).substring(0, 500);

    const notificationKey = `${safeTitle}-${safeBody}`;
    const lastSent = this.notificationsSent.find((n) => n.key === notificationKey);

    if (lastSent && Date.now() - lastSent.timestamp < 3600000) {
      return;
    }

    const defaultOptions = {
      icon: "./images/aslab_logo.webp",
      badge: "./images/favicon.ico",
      requireInteraction: false,
      vibrate: [200, 100, 200],
      ...options,
    };

    try {
      const notification = new Notification(safeTitle, {
        body: safeBody,
        ...defaultOptions,
      });

      this.notificationsSent.push({
        key: notificationKey,
        timestamp: Date.now(),
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      console.warn("Error sending notification:", error);
    }
  },

  async sendCountdownNotification(daysLeft) {
    if (!this.enabled) return;

    const notificationConfig = [
      { days: 7, title: "⚠️ 1 Minggu Lagi!", message: "Pendaftaran ASLAB ditutup dalam 7 hari" },
      { days: 3, title: "🔔 3 Hari Lagi!", message: "Segera daftar! Hanya 3 hari tersisa" },
      { days: 1, title: "⏰ Besok Terakhir!", message: "Ini hari terakhir pendaftaran ASLAB!" },
      { days: 0, title: "🚨 Hari Ini Deadline!", message: "Pendaftaran ASLAB ditutup hari ini!" },
    ];

    const config = notificationConfig.find((c) => c.days === daysLeft);
    if (config) {
      const lastNotification = await StorageManager.getData(
        `notification_day_${daysLeft}`
      );
      const today = new Date().toDateString();

      if (!lastNotification || lastNotification !== today) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SCHEDULE_NOTIFICATION',
            payload: {
              title: config.title,
              body: config.message,
              delay: 0
            }
          });
        } else {
          this.sendNotification(config.title, config.message, {
            requireInteraction: daysLeft <= 1,
          });
        }
        await StorageManager.saveData(`notification_day_${daysLeft}`, today);
      }
    }
  },
};

const ServiceWorkerManager = {
  registration: null,
  
  async register() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './'
      });

      console.log('✅ Service Worker registered:', this.registration.scope);

      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        console.log('🔄 Service Worker update found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🆕 New Service Worker available');
          }
        });
      });

      if ('periodicSync' in this.registration) {
        try {
          await this.registration.periodicSync.register('check-deadline', {
            minInterval: 6 * 60 * 60 * 1000
          });
          console.log('✅ Periodic background sync registered');
        } catch (error) {
          console.warn('Periodic sync not available:', error);
        }
      }

      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from SW:', event.data);
        
        if (event.data.type === 'COUNTDOWN_UPDATE') {
          console.log('Countdown update:', event.data.daysLeft);
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  },

  async checkForUpdates() {
    if (this.registration) {
      await this.registration.update();
    }
  },

  async unregister() {
    if (this.registration) {
      await this.registration.unregister();
      console.log('Service Worker unregistered');
    }
  },

  async sendMessage(message) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }
};


const sanitizeHTML = (str) => {
  if (!str) return '';
  
  const text = String(str).substring(0, 10000);
  
  const temp = document.createElement("div");
  temp.textContent = text;
  
  let sanitized = temp.innerHTML;
  
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  return sanitized;
};

const isValidURL = (url) => {
  try {
    if (!url || typeof url !== 'string') return false;
    
    const lowerUrl = url.toLowerCase().trim();
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.some(proto => lowerUrl.startsWith(proto))) {
      return false;
    }
    
    const urlObj = new URL(url);
    
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return false;
    }
    
    const hostname = urlObj.hostname.toLowerCase();
    const privateHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (privateHosts.includes(hostname)) {
      console.warn('Private/localhost URLs not allowed');
      return false;
    }
    
    return true;
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

(async function init() {
  const swRegistered = await ServiceWorkerManager.register();
  
  if (swRegistered) {
    console.log('🎉 Service Worker aktif - Notifikasi akan tetap muncul walaupun browser ditutup!');
  }

  await StorageManager.init();
  await NotificationManager.checkPermission();

  const visitCount = (await StorageManager.getData("visitCount")) || 0;
  await StorageManager.saveData("visitCount", visitCount + 1);
  await StorageManager.saveData("lastVisit", new Date().toISOString());

  console.log(`👋 Welcome! Visit ke-${visitCount + 1}`);

  if (visitCount === 0) {
    setTimeout(async () => {
      const notifModal = document.createElement("div");
      notifModal.className = "notification-modal";
      notifModal.innerHTML = `
        <div class="notification-modal-content">
          <div class="notification-modal-icon">🔔</div>
          <h3>Aktifkan Notifikasi?</h3>
          <p>Dapatkan pengingat otomatis saat deadline pendaftaran ASLAB semakin dekat!</p>
          <div class="notification-modal-buttons">
            <button id="allowNotification" class="btn-allow">✅ Izinkan</button>
            <button id="denyNotification" class="btn-deny">❌ Tidak Sekarang</button>
          </div>
        </div>
      `;
      document.body.appendChild(notifModal);

      setTimeout(() => notifModal.classList.add("show"), 100);

      document.getElementById("allowNotification").addEventListener("click", async () => {
        const allowed = await NotificationManager.requestPermission();
        notifModal.classList.remove("show");
        setTimeout(() => notifModal.remove(), 300);
        if (allowed) {
          showSuccess("✅ Notifikasi berhasil diaktifkan!");
        }
      });

      document.getElementById("denyNotification").addEventListener("click", () => {
        notifModal.classList.remove("show");
        setTimeout(() => notifModal.remove(), 300);
        StorageManager.saveData("notificationDenied", true);
      });
    }, 3000);
  }
})();

toggleLoading(true);

fetch("config.json")
  .then((response) => {
    if (!response.ok) throw new Error("Gagal memuat konfigurasi");
    return response.json();
  })
  .then(async (data) => {
    await StorageManager.saveData("lastConfigLoad", new Date().toISOString());
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

      const safeUrl = isValidURL(url) ? url : '#';
      
      footerCapt.innerHTML += `
                    <a href="${sanitizeHTML(safeUrl)}" target="_blank" rel="noopener noreferrer" style="color:white; text-decoration:none;">
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

      const safeWaLink = isValidURL(waLink) ? sanitizeHTML(waLink) : '#';
      
      contactList.innerHTML += `
                    <div class="contact-item">
                        <strong>${safeName}</strong><br>
                        <a href="${safeWaLink}" target="_blank" rel="noopener noreferrer" style="color:white; text-decoration:none;">
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
      if (registerBtn && isValidURL(data.text_to_qr)) {
        registerBtn.href = data.text_to_qr;
      } else {
        console.error('Invalid registration URL');
        if (registerBtn) registerBtn.href = '#';
      }
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

  const downloadCount = (await StorageManager.getData("qrDownloadCount")) || 0;
  await StorageManager.saveData("qrDownloadCount", downloadCount + 1);
  await StorageManager.saveData("lastQRDownload", new Date().toISOString());

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

  async function updateCountdown() {
    const now = new Date().getTime();
    const distance = deadline - now;

    const daysLeft = Math.floor(distance / (1000 * 60 * 60 * 24));

    if (daysLeft >= 0 && daysLeft <= 7) {
      await NotificationManager.sendCountdownNotification(daysLeft);
    }

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
  title: sanitizeHTML("Open Recruitment ASLAB"),
  text: sanitizeHTML("🎓 Open Recruitment Asisten Laboratorium! Kesempatan emas untuk mengembangkan skill dan pengalaman. Daftar sekarang!"),
  url: window.location.origin + window.location.pathname,
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

async function updateStorageInfo() {
  const storageInfo = document.getElementById("storageInfo");
  if (!storageInfo) return;

  try {
    const visitCount = await StorageManager.getData("visitCount");
    const lastVisit = await StorageManager.getData("lastVisit");
    const downloadCount = await StorageManager.getData("qrDownloadCount");
    const notificationPerm = await StorageManager.getData("notificationPermission");

    let lastVisitText = "Belum ada";
    if (lastVisit) {
      try {
        const date = new Date(lastVisit);
        lastVisitText = date.toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        lastVisitText = "Invalid date";
      }
    }

    const safeVisitCount = sanitizeHTML(String(visitCount || 0));
    const safeLastVisit = sanitizeHTML(lastVisitText);
    const safeDownloadCount = sanitizeHTML(String(downloadCount || 0));
    const safeNotificationStatus = notificationPerm === "granted" ? "✅ Aktif" : "❌ Nonaktif";

    const details = `
      Kunjungan: ${safeVisitCount} kali<br>
      Terakhir: ${safeLastVisit}<br>
      Download QR: ${safeDownloadCount} kali<br>
      Notifikasi: ${safeNotificationStatus}
    `;

    const storageDetails = document.getElementById("storageDetails");
    if (storageDetails) {
      storageDetails.innerHTML = details;
    }
  } catch (error) {
    console.warn("Error updating storage info:", error);
  }
}

let clickCount = 0;
let clickTimer = null;
document.addEventListener("click", (e) => {
  if (e.clientX < 100 && e.clientY > window.innerHeight - 100) {
    clickCount++;
    clearTimeout(clickTimer);
    
    if (clickCount === 3) {
      const storageInfo = document.getElementById("storageInfo");
      if (storageInfo.style.display === "none") {
        storageInfo.style.display = "block";
        updateStorageInfo();
        setTimeout(() => storageInfo.classList.add("show"), 10);
      } else {
        storageInfo.classList.remove("show");
        setTimeout(() => storageInfo.style.display = "none", 300);
      }
      clickCount = 0;
    }
    
    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 500);
  }
});

setInterval(async () => {
  if (NotificationManager.enabled) {
    const daysElement = document.getElementById("days");
    if (daysElement) {
      const daysLeft = parseInt(daysElement.textContent);
      if (!isNaN(daysLeft) && daysLeft >= 0 && daysLeft <= 7) {
        await NotificationManager.sendCountdownNotification(daysLeft);
      }
    }
  }
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_DEADLINE'
    });
  }
}, 5 * 60 * 1000);

setInterval(async () => {
  await ServiceWorkerManager.checkForUpdates();
}, 60 * 60 * 1000);

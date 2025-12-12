# 🚀 Open Recruitment ASLAB UNPAM 2025

[![Deploy Status](https://github.com/unpamtiaslab/opreq/actions/workflows/deploy.yml/badge.svg)](https://github.com/unpamtiaslab/opreq/actions/workflows/deploy.yml)
[![SEO Check](https://github.com/unpamtiaslab/opreq/actions/workflows/seo-check.yml/badge.svg)](https://github.com/unpamtiaslab/opreq/actions/workflows/seo-check.yml)
[![Countdown](https://github.com/unpamtiaslab/opreq/actions/workflows/countdown.yml/badge.svg)](https://github.com/unpamtiaslab/opreq/actions/workflows/countdown.yml)

> Website rekrutmen Asisten Laboratorium TI UNPAM dengan fitur modern, aman, dan SEO-optimized

## 🌐 Live Demo

**URL:** [https://unpamtiaslab.github.io/opreq/](https://unpamtiaslab.github.io/opreq/)

---

## ✨ Features

### 🔒 Security
- ✅ XSS Protection (HTML sanitization)
- ✅ URL Validation (whitelist protocols)
- ✅ Rate Limiting (spam prevention)
- ✅ CSP Headers (Content Security Policy)
- ✅ Safe External Links (noopener/noreferrer)
- ✅ Input Sanitization & Output Encoding

### 🎨 UI/UX
- ✅ Modern gradient design
- ✅ Smooth animations (10+ animations)
- ✅ Loading states & error handling
- ✅ Success/error toast notifications
- ✅ Mobile responsive (100%)
- ✅ Interactive hover effects

### 🚀 Functionality
- ✅ Dynamic content from `config.json`
- ✅ QR Code generator (auto-load)
- ✅ Download QR (3 fallback methods)
- ✅ Copy link to clipboard
- ✅ Real-time countdown timer
- ✅ FAQ accordion
- ✅ Social share buttons (WA, Telegram, Twitter, FB)
- ✅ Print watermark protection
- ✅ Right-click image protection

### 📊 SEO & Marketing
- ✅ 25+ meta tags (SEO, OG, Twitter)
- ✅ JSON-LD structured data (Event schema)
- ✅ sitemap.xml & robots.txt
- ✅ Canonical URLs
- ✅ Geographic meta tags
- ✅ Social media preview cards

### 🤖 Automation (GitHub Actions)
- ✅ Auto-update sitemap (daily)
- ✅ Auto-deploy to GitHub Pages
- ✅ SEO health monitoring (weekly)
- ✅ Countdown status check (hourly)
- ✅ Manual workflow triggers

---

## 📁 Project Structure

```
opreq/
├── index.html              # Main HTML with meta tags
├── config.json             # Dynamic content configuration
├── sitemap.xml             # SEO sitemap (auto-updated)
├── robots.txt              # Search engine rules
├── script/
│   └── script.js           # Security + features
├── style/
│   └── style.css           # Modern styling
├── images/
│   ├── favicon.ico
│   ├── aslab_logo.webp
│   └── filkom.webp
├── .github/
│   └── workflows/
│       ├── deploy.yml      # Auto deploy workflow
│       ├── seo-check.yml   # SEO monitoring
│       └── countdown.yml   # Deadline checker
├── README.md               # This file
├── SEO_GUIDE.md           # SEO documentation
├── GITHUB_ACTIONS.md      # Automation guide
└── SECURITY_AUDIT.md      # Security report
```

---

## 🛠️ Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/unpamtiaslab/opreq.git
cd opreq

# Open with live server (recommended)
# VS Code: Install "Live Server" extension
# Then: Right-click index.html → "Open with Live Server"

# Or open directly in browser
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

### Configuration

Edit `config.json` to update content:

```json
{
  "countdown_deadline": {
    "date": "19 Desember 2025",
    "time": "23:59:59"
  },
  "persyaratan": [...],
  "benefit": [...],
  "timeline": [...],
  "contacts": [...],
  "footer_text": [...],
  "text_to_qr": "https://forms.google.com/..."
}
```

---

## 🚀 Deployment

### GitHub Pages (Automated)

1. **Fork/Clone** repository
2. **Push** to your GitHub repo
3. **Enable** GitHub Pages:
   - Settings → Pages
   - Source: **GitHub Actions**
4. **Done!** Workflows akan auto-deploy

### Manual Deploy

```bash
# Commit changes
git add .
git commit -m "Update content"
git push origin main

# GitHub Actions akan auto-deploy dalam 2-3 menit
```

---

## 🤖 GitHub Actions

### Available Workflows:

#### 1. **Auto Update and Deploy**
- **Trigger:** Push, Daily (00:00 UTC), Manual
- **Function:** Update sitemap → Deploy to Pages

#### 2. **SEO Monitor**
- **Trigger:** Weekly (Monday), Manual
- **Function:** Check SEO health → Generate report

#### 3. **Countdown Update**
- **Trigger:** Hourly, Manual
- **Function:** Check deadline → Update status

### Manual Trigger:
```
Actions → Select Workflow → Run workflow
```

**Documentation:** See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md)

---

## 📊 SEO Optimization

### Metrics:
- ✅ **Title:** 58 chars (optimal)
- ✅ **Description:** 159 chars (optimal)
- ✅ **Keywords:** 15+ targeted keywords
- ✅ **Meta Tags:** 25+ tags
- ✅ **Structured Data:** JSON-LD Event schema
- ✅ **Social Cards:** OG + Twitter

### Submit to Search Engines:

**Google Search Console:**
```
1. https://search.google.com/search-console
2. Add property: https://unpamtiaslab.github.io/opreq/
3. Submit sitemap.xml
```

**Bing Webmaster:**
```
1. https://www.bing.com/webmasters
2. Import from Google (easier)
```

**Documentation:** See [SEO_GUIDE.md](SEO_GUIDE.md)

---

## 🔒 Security

### Security Score: **A+** (97/100)

- ✅ XSS Protection
- ✅ URL Validation
- ✅ Rate Limiting
- ✅ CSP Headers
- ✅ Input Sanitization
- ✅ Output Encoding
- ✅ Secure Links
- ✅ Error Handling

**Documentation:** See [SECURITY_AUDIT.md](SECURITY_AUDIT.md)

---

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS, Android)

---

## 🎯 Performance

- **Load Time:** < 1.5s
- **File Size:** < 100KB (excl. images)
- **PageSpeed Score:** 95+ (target)
- **Mobile Friendly:** ✅ 100%

---

## 📝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Contact

**ASLAB TI UNPAM**

- 📱 Instagram: [@aslabti_unpam](https://instagram.com/aslabti_unpam)
- 🌐 Website: [aslab.octavianaanugrah.com](https://aslab.octavianaanugrah.com)
- 📧 Email: Via contact persons in website

**Contact Persons:**
- MARSEL: 0856-9236-9200
- NATHAN: 0851-7672-7250
- SYAEFUL: 0813-1985-1597

---

## 📄 License

This project is for internal use by ASLAB TI UNPAM.

---

## 🙏 Acknowledgments

- Design inspiration: Modern web design trends
- Icons: Emoji (native)
- QR Generator: [api.qrserver.com](https://api.qrserver.com)
- Hosting: GitHub Pages
- Automation: GitHub Actions

---

## 📊 Project Stats

![GitHub last commit](https://img.shields.io/github/last-commit/unpamtiaslab/opreq)
![GitHub repo size](https://img.shields.io/github/repo-size/unpamtiaslab/opreq)
![GitHub](https://img.shields.io/github/license/unpamtiaslab/opreq)

---

**Made with ❤️ by ASLAB TI UNPAM**

*Last Updated: December 10, 2025*

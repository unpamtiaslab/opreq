# 🎓 Open Recruitment ASLAB - Website Poster

Website poster interaktif untuk Open Recruitment Asisten Laboratorium dengan desain modern dan fitur keamanan yang ditingkatkan.

## ✨ Fitur Utama

### 🔒 Keamanan
- **XSS Protection**: Sanitasi HTML untuk semua input dari config.json
- **URL Validation**: Validasi URL untuk mencegah phishing
- **CSP (Content Security Policy)**: Header keamanan untuk membatasi resource yang dimuat
- **Safe External Links**: Semua link eksternal menggunakan `rel="noopener noreferrer"` untuk mencegah tabnabbing
- **Input Encoding**: Semua parameter URL di-encode dengan benar

### 🎨 Design & UI/UX
- **Modern Gradient Design**: Gradient warna yang menarik dan profesional
- **Smooth Animations**: Animasi entrance, hover effects, dan transisi yang halus
- **Loading States**: Indikator loading untuk QR code dan operasi async
- **Error Handling**: Pesan error dan success yang user-friendly
- **Responsive Design**: Layout yang menyesuaikan dengan berbagai ukuran layar
- **Interactive Elements**: Hover effects pada cards, buttons, dan list items

### 🚀 Fitur Fungsional
1. **QR Code Generator**: Generate QR code otomatis dari link pendaftaran
2. **Download QR**: Download QR code dengan 3 fallback methods:
   - Fetch API dengan blob download
   - Canvas export dengan data URL
   - Manual download via new tab
3. **Copy Link**: Salin link pendaftaran ke clipboard dengan satu klik
4. **Real-time Feedback**: Notifikasi success/error untuk semua aksi
5. **Dynamic Content**: Semua konten dimuat dari config.json

## 📁 Struktur File

```
opreq/
├── index.html          # HTML utama
├── script.js           # JavaScript dengan security utilities
├── style.css           # Styling modern dengan animations
├── config.json         # Konfigurasi konten
├── README.md          # Dokumentasi ini
└── images/            # Folder untuk gambar
    ├── favicon.ico
    ├── filkom.webp
    └── aslab_logo.webp
```

## 🛡️ Perbaikan Keamanan

### Sebelum:
❌ XSS vulnerable - Data langsung ke innerHTML  
❌ Tidak ada validasi URL  
❌ Link eksternal tanpa security attributes  
❌ Tidak ada CSP  
❌ Context menu disabled (bad UX)  

### Sesudah:
✅ Sanitasi HTML untuk semua input  
✅ Validasi URL dengan whitelist protocol  
✅ rel="noopener noreferrer" pada semua link eksternal  
✅ Content Security Policy header  
✅ Context menu diaktifkan kembali  
✅ URL encoding untuk semua parameter  

## 🎯 Cara Penggunaan

### 1. Buka File
Cukup double-click `index.html` atau buka dengan browser:

```bash
# Atau gunakan live server (recommended)
# Dengan Python
python -m http.server 8000

# Dengan Node.js
npx http-server

# Lalu buka: http://localhost:8000
```

### 2. Konfigurasi Konten
Edit `config.json` untuk mengubah konten:

```json
{
  "persyaratan": ["Item 1", "Item 2"],
  "benefit": ["Item 1", "Item 2"],
  "timeline": [
    {
      "icon": "📝",
      "title": "Judul",
      "date": "Tanggal"
    }
  ],
  "contacts": [
    {
      "name": "Nama",
      "phone": "08xx-xxxx-xxxx",
      "whatsapp": "https://wa.me/"
    }
  ],
  "footer_text": [
    {
      "icon": "📱",
      "text": "instagram_username"
    }
  ],
  "text_to_qr": "https://link-pendaftaran.com"
}
```

### 3. Fitur Interaktif

#### Download QR Code
- Klik tombol **"SIMPAN QR"**
- QR akan otomatis terdownload sebagai `qr_aslab_pendaftaran.png`
- Jika gagal, akan ada fallback method otomatis

#### Copy Link Pendaftaran
- Klik tombol **"SALIN LINK"**
- Link akan disalin ke clipboard
- Notifikasi success akan muncul

## 🎨 Customisasi

### Warna
Edit CSS variables di `style.css`:

```css
:root {
    --primary-color: #1e3c72;
    --secondary-color: #2a5298;
    --accent-color: #667eea;
    --accent-secondary: #764ba2;
    --success-color: #27ae60;
    --error-color: #e74c3c;
    /* ... */
}
```

### Animasi
Sesuaikan durasi dan easing:

```css
:root {
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

## 📱 Responsive Breakpoints

- **Desktop**: > 768px - Grid 2 kolom
- **Mobile**: ≤ 768px - Stack layout 1 kolom

## 🔧 Browser Support

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Opera (Latest)

## 📝 Best Practices

1. **Selalu gunakan HTTPS** saat deploy production
2. **Validasi data** di `config.json` sebelum deploy
3. **Test di multiple browsers** sebelum launch
4. **Backup config.json** sebelum edit
5. **Gunakan live server** untuk development (bukan file://)

## 🚀 Deployment

### GitHub Pages
```bash
git add .
git commit -m "Deploy poster ASLAB"
git push origin main
```

### Netlify/Vercel
- Drag & drop folder ke dashboard
- Atau connect dengan Git repository

## 📊 Performance

- ⚡ Fast loading dengan minimal dependencies
- 🎯 Optimized animations dengan GPU acceleration
- 💾 Lightweight - Total size < 100KB (excluding images)
- 🔄 Lazy loading untuk QR code image

## 🐛 Troubleshooting

### QR Code tidak muncul
- Check koneksi internet (API eksternal)
- Pastikan URL di config.json valid
- Check browser console untuk error

### Copy Link tidak bekerja
- Browser mungkin tidak support Clipboard API
- Gunakan HTTPS atau localhost (bukan file://)

### Animasi patah-patah
- Check hardware acceleration browser
- Reduce animation di sistem operasi mungkin aktif

## 📄 License

Free to use untuk keperluan internal ASLAB.

## 👨‍💻 Maintainer

ASLAB - Asisten Laboratorium

---

**Made with ❤️ from ASLAB TI Unpam**

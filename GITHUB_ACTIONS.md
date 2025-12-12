# 🤖 GitHub Actions - Automation Guide
## Open Recruitment ASLAB UNPAM

---

## 📋 Workflows yang Tersedia

### 1. **🚀 Auto Update and Deploy** (`deploy.yml`)

**Trigger:**
- ✅ Push ke branch `main` atau `master`
- ✅ Scheduled daily (00:00 UTC / 07:00 WIB)
- ✅ Manual trigger via GitHub UI

**Fungsi:**
1. Auto-update `sitemap.xml` dengan tanggal terkini
2. Commit perubahan otomatis
3. Deploy ke GitHub Pages
4. Notifikasi sukses deployment

**Cara Manual Trigger:**
```
1. Go to: GitHub Repository → Actions
2. Select: "Auto Update and Deploy"
3. Click: "Run workflow"
4. Select branch: main
5. Click: "Run workflow" button
```

---

### 2. **🔍 SEO Monitor** (`seo-check.yml`)

**Trigger:**
- ✅ Scheduled weekly (Setiap Senin 00:00 UTC)
- ✅ Manual trigger

**Fungsi:**
1. Validate `sitemap.xml` (XML syntax check)
2. Check `robots.txt` exists
3. Verify meta tags (description, OG, Twitter)
4. Check JSON-LD structured data
5. Generate SEO health report

**Output:**
- 📊 SEO Report artifact (downloadable)
- ✅ Pass/Fail status for each check

**View Report:**
```
1. Actions → SEO Monitor → Latest run
2. Scroll to "Artifacts" section
3. Download: "seo-report"
```

---

### 3. **⏰ Countdown Update** (`countdown.yml`)

**Trigger:**
- ✅ Scheduled hourly (every hour)
- ✅ Manual trigger

**Fungsi:**
1. Check deadline dari `config.json`
2. Calculate waktu tersisa
3. Create status file jika deadline lewat
4. Auto-commit status update

**Status File:**
- `DEADLINE_STATUS.txt` (dibuat jika deadline lewat)

---

## 🛠️ Setup Instructions

### Prerequisites:
```bash
✅ GitHub repository sudah ada
✅ GitHub Pages aktif (Settings → Pages → Source: GitHub Actions)
✅ Repository settings: Actions enabled
```

### Step 1: Enable GitHub Pages

```bash
1. Go to: Repository → Settings → Pages
2. Source: Select "GitHub Actions"
3. Save
```

### Step 2: Push Workflows

```bash
# Struktur folder yang diperlukan
.github/
  workflows/
    deploy.yml          # Auto deploy
    seo-check.yml       # SEO monitor
    countdown.yml       # Countdown check

# Push ke repository
git add .github/
git commit -m "Add GitHub Actions workflows"
git push origin main
```

### Step 3: Verify Actions

```bash
1. Go to: Repository → Actions tab
2. You should see 3 workflows:
   - Auto Update and Deploy
   - SEO Monitor
   - Countdown Update
```

---

## 📅 Schedule Details

### Daily Updates (deploy.yml)
```yaml
- cron: '0 0 * * *'  # 00:00 UTC = 07:00 WIB
```
**Purpose:** Update sitemap lastmod date

### Weekly SEO Check (seo-check.yml)
```yaml
- cron: '0 0 * * 1'  # Every Monday 00:00 UTC
```
**Purpose:** Monitor SEO health

### Hourly Countdown (countdown.yml)
```yaml
- cron: '0 * * * *'  # Every hour
```
**Purpose:** Check if deadline passed

---

## 🎯 Workflow Permissions

Required permissions (already configured):
```yaml
permissions:
  contents: write      # For committing updates
  pages: write         # For deploying to Pages
  id-token: write      # For GitHub Pages auth
```

---

## 🔔 Monitoring & Notifications

### Check Workflow Status:
```
Repository → Actions → Select workflow → View runs
```

### Status Badges (Add to README):
```markdown
![Deploy Status](https://github.com/unpamtiaslab/opreq/actions/workflows/deploy.yml/badge.svg)
![SEO Check](https://github.com/unpamtiaslab/opreq/actions/workflows/seo-check.yml/badge.svg)
![Countdown](https://github.com/unpamtiaslab/opreq/actions/workflows/countdown.yml/badge.svg)
```

---

## 🚨 Troubleshooting

### Issue: Workflow tidak jalan
**Solution:**
```bash
1. Check: Settings → Actions → General
2. Ensure: "Allow all actions" is selected
3. Ensure: Workflow permissions = "Read and write"
```

### Issue: Deploy gagal
**Solution:**
```bash
1. Check: Settings → Pages → Source = "GitHub Actions"
2. Check: Branch is "main" or "master"
3. Check: Workflow permissions include "pages: write"
```

### Issue: Commit gagal (permission denied)
**Solution:**
```bash
# Workflow sudah menggunakan GITHUB_TOKEN
# Pastikan workflow permissions include "contents: write"
```

### Issue: Sitemap tidak update
**Solution:**
```bash
# Manual trigger workflow:
1. Actions → Auto Update and Deploy
2. Run workflow
3. Check commit history
```

---

## 🎨 Customization

### Update Schedule:

**Deploy lebih sering (setiap 6 jam):**
```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

**SEO Check lebih sering (setiap hari):**
```yaml
schedule:
  - cron: '0 0 * * *'  # Daily
```

**Countdown setiap 30 menit:**
```yaml
schedule:
  - cron: '*/30 * * * *'  # Every 30 minutes
```

### Cron Schedule Reference:
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *

Examples:
'0 0 * * *'     # Daily at midnight UTC
'0 */6 * * *'   # Every 6 hours
'0 0 * * 1'     # Every Monday
'*/30 * * * *'  # Every 30 minutes
```

---

## 📊 Workflow Features

### 1. Deploy Workflow Features:
```
✅ Auto-update sitemap lastmod
✅ Smart commit (only if changed)
✅ Skip CI on auto-commits
✅ Deploy to GitHub Pages
✅ Success notification
```

### 2. SEO Check Features:
```
✅ XML validation
✅ Meta tags verification
✅ Structured data check
✅ Generate health report
✅ Upload report artifact
```

### 3. Countdown Features:
```
✅ Parse config.json deadline
✅ Calculate time remaining
✅ Auto-create status file
✅ Commit status updates
```

---

## 🎯 Best Practices

### 1. Commit Messages:
```bash
# Auto-commits include [skip ci] to prevent loops
git commit -m "Auto-update sitemap [skip ci]"
```

### 2. Manual Updates:
```bash
# Update config.json deadline:
1. Edit config.json
2. Push changes
3. Workflow auto-deploys
```

### 3. Testing:
```bash
# Test workflow locally before push:
# Use 'act' tool (https://github.com/nektos/act)
act -j update-sitemap
```

---

## 📈 Performance Impact

### Resource Usage:
```
Deploy Workflow:    ~2-3 minutes
SEO Check:          ~1 minute
Countdown Check:    ~30 seconds

Total monthly Actions minutes:
- Deploy: 30 days × 3 min = 90 min
- SEO: 4 weeks × 1 min = 4 min
- Countdown: 30 days × 24 × 0.5 min = 360 min
Total: ~454 minutes/month

GitHub Free tier: 2,000 minutes/month ✅
Usage: ~23% of free quota
```

---

## 🔐 Security

### Tokens & Secrets:
```
✅ GITHUB_TOKEN (auto-provided by GitHub)
✅ No manual secrets needed
✅ Minimal permissions (contents, pages only)
```

### Security Best Practices:
```
✅ Use checkout@v4 (latest)
✅ Pin action versions
✅ Minimal permissions
✅ No sensitive data in workflows
```

---

## 📱 Mobile Testing

After deployment, test:
```
1. ✅ Mobile responsive
2. ✅ Meta tags (view source)
3. ✅ Sitemap accessible: /sitemap.xml
4. ✅ Robots accessible: /robots.txt
```

---

## 🎓 Advanced Usage

### Conditional Deployment:
```yaml
# Deploy only on working hours
- cron: '0 9-17 * * 1-5'  # Mon-Fri, 9AM-5PM UTC
```

### Multi-Environment:
```yaml
# Deploy to staging first
jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    # ... deploy to staging
  
  deploy-production:
    if: github.ref == 'refs/heads/main'
    # ... deploy to production
```

### Slack Notifications:
```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    text: "✅ Deployment successful!"
```

---

## 📞 Support

### Logs & Debugging:
```
1. Actions → Select workflow → Select run
2. Click on job name
3. Expand steps to view logs
4. Download logs if needed
```

### Common Commands:
```bash
# Trigger deploy manually via CLI
gh workflow run deploy.yml

# List workflow runs
gh run list

# View logs
gh run view [RUN_ID] --log
```

---

## ✅ Setup Checklist

Before deployment:
- [x] Workflows created in `.github/workflows/`
- [ ] Push workflows to repository
- [ ] Enable GitHub Actions (Settings → Actions)
- [ ] Set Pages source to "GitHub Actions"
- [ ] Set workflow permissions (Read and write)
- [ ] Test manual trigger
- [ ] Verify first scheduled run
- [ ] Add status badges to README (optional)
- [ ] Monitor Actions tab regularly

---

**🎉 GITHUB ACTIONS READY!**

Workflows akan berjalan otomatis sesuai schedule atau manual trigger!

---

*Last Updated: December 10, 2025*  
*Version: 1.0 - GitHub Actions Automation*

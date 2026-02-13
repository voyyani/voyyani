# Google Search Console - Quick Start

## ⚡ 5-Minute Setup

### 1. Go to Google Search Console
🔗 https://search.google.com/search-console/

### 2. Add Property
Choose **"URL prefix"**: `https://voyani.tech`

### 3. Verify Ownership (Choose ONE method)

#### Method A: HTML Meta Tag (Easiest)
1. Google gives you a code like: `ABC123XYZ...`
2. Add to your `.env`:
   ```bash
   VITE_GOOGLE_VERIFICATION=ABC123XYZ
   ```
3. Deploy and verify

#### Method B: HTML File Upload
1. Download `google1234567890abcdef.html` from Google
2. Put in `public/` folder
3. Deploy and verify

### 4. Submit Sitemap
In GSC, go to **Sitemaps** and submit:
```
https://voyani.tech/sitemap.xml
```

### 5. Request Indexing
1. Go to **URL Inspection**
2. Enter: `https://voyani.tech`
3. Click **"Request Indexing"**

## ✅ Done!

Your site will appear in Google Search within 1-7 days.

---

## 📊 What to Monitor

**Weekly (First Month)**:
- Coverage: Check for indexed pages
- Performance: Track impressions

**Monthly (Ongoing)**:
- Top queries bringing traffic
- Average position for key terms
- Core Web Vitals status
- Mobile usability issues

---

## 🎯 Your SEO Status

✅ **Sitemap**: `public/sitemap.xml` (5 URLs)  
✅ **Robots.txt**: `public/robots.txt` (configured)  
✅ **Meta Tags**: SEO.jsx (comprehensive)  
✅ **Structured Data**: Person + Website schemas  
✅ **Mobile Friendly**: Fully responsive  
✅ **Performance**: 222 KB gzipped  
✅ **HTTPS**: Required for GSC  

**Ready to verify!** 🚀

---

## 📈 Expected Results

| Timeframe | Indexed Pages | Impressions/Month | Clicks/Month |
|-----------|---------------|-------------------|--------------|
| Week 1-2  | 1-2           | 10-50            | 1-5          |
| Month 1-3 | 3-5           | 100-300          | 10-30        |
| Month 4-6 | 5-10          | 500-1000         | 50-100       |

---

## 📚 Full Guide

See [GOOGLE_SEARCH_CONSOLE_SETUP.md](./GOOGLE_SEARCH_CONSOLE_SETUP.md) for detailed instructions.

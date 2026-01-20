# Image Optimization Guide

## ✅ Completed: ImageWithFallback Component

The `ImageWithFallback` component has been updated with production-ready features:

### Features Implemented:
- ✅ **Picture element** with WebP/AVIF support
- ✅ **Lazy loading** by default (can override with `priority` prop)
- ✅ **Aspect ratio preservation** (prevents CLS)
- ✅ **Loading skeletons** for better UX
- ✅ **Graceful error handling** with fallback UI
- ✅ **Responsive images** with `sizes` attribute

### Usage Example:
```jsx
<ImageWithFallback
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={false} // Set to true for above-the-fold images
/>
```

---

## 📝 Manual Image Optimization (Recommended)

Since automated image optimization plugins can be unreliable, here's the manual approach:

### 1. Online Tools (Free & Reliable)

#### **Squoosh** (Recommended)
- URL: https://squoosh.app/
- Features:
  - WebP/AVIF conversion
  - Side-by-side comparison
  - Quality adjustment
  - Batch processing via CLI

#### **TinyPNG**
- URL: https://tinypng.com/
- Best for: PNG optimization
- Compression: 50-80% reduction

### 2. Command Line Tools

#### **Sharp** (Node.js)
```bash
npm install --save-dev sharp

# Create conversion script
```

**scripts/optimize-images.js:**
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = './src/assets/original';
const outputDir = './src/assets/optimized';

async function optimizeImage(inputPath, outputPath) {
  const filename = path.parse(inputPath).name;
  
  // Generate WebP
  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(path.join(outputPath, `${filename}.webp`));
  
  // Generate AVIF
  await sharp(inputPath)
    .avif({ quality: 70 })
    .toFile(path.join(outputPath, `${filename}.avif`));
  
  // Optimize original
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(inputPath)
      .jpeg({ quality: 80, progressive: true })
      .toFile(path.join(outputPath, `${filename}${ext}`));
  } else if (ext === '.png') {
    await sharp(inputPath)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(outputPath, `${filename}${ext}`));
  }
  
  console.log(`✓ Optimized: ${filename}`);
}

// Process all images
async function processAll() {
  const files = fs.readdirSync(sourceDir);
  
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      await optimizeImage(
        path.join(sourceDir, file),
        outputDir
      );
    }
  }
  
  console.log('✓ All images optimized!');
}

processAll();
```

**Add to package.json:**
```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js"
  }
}
```

---

## 🎯 Optimization Targets

### File Size Goals:
| Image Type | Original | WebP | AVIF | Reduction |
|------------|----------|------|------|-----------|
| Hero images | 500KB | 150KB | 100KB | 70-80% |
| Project screenshots | 300KB | 100KB | 60KB | 70-80% |
| Icons/logos | 50KB | 15KB | 10KB | 70-80% |

### Quality Settings:
- **JPEG:** 80 quality (progressive)
- **PNG:** 80 quality (9 compression)
- **WebP:** 80 quality
- **AVIF:** 70 quality (better compression)

---

## 📁 Recommended Folder Structure

```
src/assets/
  ├── original/          # Source images (not in git)
  ├── optimized/         # Optimized images (in git)
  │   ├── hero/
  │   │   ├── banner.jpg
  │   │   ├── banner.webp
  │   │   └── banner.avif
  │   └── projects/
  │       ├── project1.jpg
  │       ├── project1.webp
  │       └── project1.avif
  └── icons/             # SVG icons (already optimized)
```

**.gitignore:**
```
src/assets/original/
```

---

## 🚀 Responsive Images

### Sizes Attribute Examples:

```jsx
// Full-width on mobile, 50% on desktop
sizes="(max-width: 768px) 100vw, 50vw"

// Fixed widths
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"

// Hero image
sizes="100vw"

// Thumbnail
sizes="(max-width: 768px) 50vw, 25vw"
```

---

## 🎨 Image Guidelines

### 1. **Hero Images**
- Dimensions: 1920x1080 (16:9)
- Format: JPEG → WebP → AVIF
- Quality: 80
- Expected size: 100-150KB (WebP)

### 2. **Project Screenshots**
- Dimensions: 1200x900 (4:3)
- Format: PNG → WebP → AVIF
- Quality: 80
- Expected size: 60-100KB (WebP)

### 3. **Profile Photo**
- Dimensions: 400x400 (1:1)
- Format: JPEG → WebP → AVIF
- Quality: 90 (higher for face)
- Expected size: 30-50KB (WebP)

### 4. **Icons**
- Format: SVG (preferred)
- Or: PNG at 2x resolution
- Dimensions: 64x64 or 128x128

---

## ⚡ Performance Tips

### 1. **Critical Images (Above the fold)**
```jsx
<ImageWithFallback
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority={true}  // Eager loading
  loading="eager"
/>
```

### 2. **Lazy Images (Below the fold)**
```jsx
<ImageWithFallback
  src="/project.jpg"
  alt="Project"
  width={800}
  height={600}
  loading="lazy"  // Default
/>
```

### 3. **Use Appropriate Sizes**
```jsx
// Don't load 4K image for thumbnail!
<ImageWithFallback
  src="/thumbnail-small.jpg"  // Use appropriately sized image
  width={400}
  height={300}
/>
```

---

## 🔍 Testing

### Check Image Optimization:
1. Open DevTools → Network tab
2. Filter by "Img"
3. Verify:
   - WebP/AVIF being served (modern browsers)
   - File sizes are reasonable
   - Lazy loading working

### Lighthouse Audit:
```bash
npm run build
npm run preview

# In Chrome DevTools → Lighthouse
# Check "Properly size images" section
```

---

## 📊 Expected Impact

With proper image optimization:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total image size | 2MB | 400KB | 80% |
| LCP (Largest Contentful Paint) | 3.5s | 1.2s | 66% |
| Total page weight | 600KB | 250KB | 58% |
| Lighthouse Performance | 72 | 88+ | +16 |

---

## ✅ Checklist

- [ ] Install Sharp for image processing
- [ ] Create optimization script
- [ ] Optimize all existing images
- [ ] Set up folder structure
- [ ] Update .gitignore
- [ ] Test with Lighthouse
- [ ] Verify WebP/AVIF delivery
- [ ] Check lazy loading works
- [ ] Measure performance improvement

---

## 🔗 Resources

- [Squoosh](https://squoosh.app/) - Image compression tool
- [Sharp](https://sharp.pixelplumbing.com/) - Node.js image processing
- [TinyPNG](https://tinypng.com/) - PNG compression
- [WebP](https://developers.google.com/speed/webp) - WebP format guide
- [AVIF](https://jakearchibald.com/2020/avif-has-landed/) - AVIF format guide

---

**Next Steps:** See [ROADMAP.md](./ROADMAP.md) for Task 1.7 - Code Splitting

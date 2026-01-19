# Scroll Animation System Documentation

## Overview
A comprehensive scroll animation system with Intersection Observer API, performance optimizations, and accessibility support.

## Components & Hooks

### 1. useScrollAnimation Hook
Main hook for triggering animations when elements enter viewport.

#### Usage
```jsx
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function MyComponent() {
  const { ref, isVisible, scrollDirection, hasAnimated } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      Content animates when visible
    </div>
  );
}
```

#### Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | number | 0.1 | Percentage of element visible (0-1) to trigger |
| `rootMargin` | string | '0px' | Margin around viewport for early triggering |
| `triggerOnce` | boolean | true | Animate only once or on every intersection |
| `enableScrollDirection` | boolean | false | Track scroll direction ('up' or 'down') |

#### Returns
| Property | Type | Description |
|----------|------|-------------|
| `ref` | React.Ref | Attach to element you want to observe |
| `isVisible` | boolean | Whether element is currently visible |
| `scrollDirection` | string\|null | 'up', 'down', or null |
| `hasAnimated` | boolean | Whether element has animated at least once |

### 2. useScrollProgress Hook
Tracks overall page scroll progress as a percentage.

#### Usage
```jsx
import { useScrollProgress } from '../hooks/useScrollAnimation';

function ScrollIndicator() {
  const progress = useScrollProgress();

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-blue-500"
      style={{ width: `${progress}%` }}
    />
  );
}
```

### 3. useSmoothScroll Hook
Enables smooth scrolling to sections by ID.

#### Usage
```jsx
import { useSmoothScroll } from '../hooks/useScrollAnimation';

function Navigation() {
  const scrollToSection = useSmoothScroll();

  return (
    <button onClick={() => scrollToSection('about')}>
      Go to About
    </button>
  );
}
```

### 4. BackToTop Component
Animated button that appears when user scrolls down, with circular progress indicator.

#### Features
- ✅ Shows after scrolling 400px
- ✅ Circular progress indicator showing scroll percentage
- ✅ Smooth scroll to top on click
- ✅ Hover animations
- ✅ Responsive design

#### Usage
```jsx
import BackToTop from './components/BackToTop';

function App() {
  return (
    <>
      {/* Your content */}
      <BackToTop />
    </>
  );
}
```

### 5. ScrollProgressIndicator Component
Horizontal bar at top of page showing scroll progress.

#### Usage
```jsx
import ScrollProgressIndicator from './components/ScrollProgressIndicator';

function App() {
  return (
    <>
      <ScrollProgressIndicator />
      {/* Your content */}
    </>
  );
}
```

## Common Animation Patterns

### 1. Fade In on Scroll
```jsx
function FadeInSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      Content fades in
    </section>
  );
}
```

### 2. Slide Up on Scroll
```jsx
function SlideUpSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-20'
      }`}
    >
      Content slides up
    </section>
  );
}
```

### 3. Stagger Children Animation
```jsx
function StaggeredList() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <ul ref={ref}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={`transition-all duration-500 ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-10'
          }`}
          style={{
            transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
          }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### 4. Scale on Scroll
```jsx
function ScaleCard() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-90'
      }`}
    >
      Card scales up
    </div>
  );
}
```

### 5. With Framer Motion (Advanced)
```jsx
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function AdvancedAnimation() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      Advanced motion animation
    </motion.div>
  );
}
```

## Performance Optimizations

### Built-in Optimizations
1. **Throttled scroll events** - Uses `requestAnimationFrame`
2. **Intersection Observer** - More efficient than scroll listeners
3. **Passive event listeners** - Better scroll performance
4. **Cleanup on unmount** - Prevents memory leaks

### Tips for Best Performance
1. **Use triggerOnce** when animations don't need to repeat
2. **Appropriate threshold** - Don't use too small values
3. **Limit animations** - Don't animate too many elements at once
4. **CSS transforms** - Use translate/scale instead of top/left
5. **will-change** - Add for elements with complex animations

```css
.animated-element {
  will-change: transform, opacity;
}
```

## Accessibility Features

### Respects User Preferences
The system automatically respects `prefers-reduced-motion`:

```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Animations disabled, elements shown immediately
  setIsVisible(true);
}
```

### Manual Implementation
Add to your CSS for manual control:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Keyboard Navigation
All interactive elements (BackToTop button) are keyboard accessible:
- Tab to focus
- Enter/Space to activate

## Browser Support

### Intersection Observer
- ✅ Chrome 51+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 15+

### Polyfill (if needed)
```bash
npm install intersection-observer
```

```javascript
// Add to main.jsx
import 'intersection-observer';
```

## Testing

### Test Visibility
```jsx
import { render } from '@testing-library/react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

test('element becomes visible on intersection', () => {
  // Mock IntersectionObserver
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;

  // Test your component
});
```

## Troubleshooting

### Animations Not Triggering

1. **Check ref is attached:**
```jsx
// ✅ Correct
<div ref={ref}>Content</div>

// ❌ Wrong
<div>Content</div>
```

2. **Verify threshold:**
```jsx
// Element must be 50% visible
const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });
```

3. **Check CSS:**
```css
/* Ensure transitions are defined */
.animated {
  transition: all 0.5s ease;
}
```

### Performance Issues

1. **Too many observers:**
   - Limit number of animated elements per page
   - Use triggerOnce: true for one-time animations

2. **Heavy animations:**
   - Use transform/opacity only
   - Avoid animating width/height/position

3. **Memory leaks:**
   - Ensure cleanup functions run
   - Check component unmounting properly

## Examples in Your Portfolio

### Hero Section
```jsx
// Already using Framer Motion
// Can add scroll-based variants
```

### Skills Section
```jsx
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function Skills() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} id="skills" className="py-20">
      {/* Animate skill bars when visible */}
    </section>
  );
}
```

### Projects Section
```jsx
function Projects() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} id="projects">
      {projects.map((project, index) => (
        <ProjectCard 
          key={project.id}
          project={project}
          delay={isVisible ? index * 100 : 0}
        />
      ))}
    </section>
  );
}
```

## Advanced Features

### Parallax Effect
```jsx
function ParallaxSection() {
  const { ref } = useScrollAnimation();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={ref} style={{ transform: `translateY(${offset}px)` }}>
      Parallax content
    </div>
  );
}
```

### Scroll-Linked Navigation
```jsx
function Navbar() {
  const { scrollDirection } = useScrollAnimation({
    enableScrollDirection: true
  });

  return (
    <nav className={`fixed top-0 transition-transform ${
      scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
    }`}>
      Navigation hides on scroll down
    </nav>
  );
}
```

## Best Practices

1. ✅ **Use appropriate thresholds** (0.1 - 0.3 for most cases)
2. ✅ **triggerOnce for static content**
3. ✅ **Respect prefers-reduced-motion**
4. ✅ **Test on real devices**
5. ✅ **Limit concurrent animations**
6. ✅ **Use CSS transforms over position**
7. ✅ **Add loading states**
8. ✅ **Test with slow connections**

## Resources

- [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web.dev: Animations](https://web.dev/animations/)
- [Can I Use: Intersection Observer](https://caniuse.com/intersectionobserver)

---

**Created:** January 18, 2026  
**Last Updated:** January 18, 2026

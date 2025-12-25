# 002 - Hero Slider Implementation

**Date:** 2025-12-25  
**Status:** ✅ Completed  

---

## User Request

Redesign the Hero section of `src/pages/Home.tsx` to be a dynamic slider/carousel matching a specific reference design (centered content, circular arrows).

---

## Specification

### Technical Approach
- **Component:** Embla Carousel (`src/components/ui/carousel.tsx`)
- **Centered Layout:** `flex flex-col items-center justify-center text-center`
- **Navigation:** Custom circular white buttons (`size-14 rounded-full`)
- **Height Enforcement:** Inline `style={{ height: '600px' }}` for robust layout

### Design Choices
1. **Centered Content:** Text and buttons are strictly centered.
2. **Typography:** Huge bold title (`text-4xl md:text-6xl`) with drop shadow for readability.
3. **Navigation:** White circular buttons with Chevron icons (updated from Arrows). Text labels hidden via `text-[0px]`.
4. **Indicators:** Active slide uses a "Ring" style (white dot with transparent ring), inactive are semi-transparent.
4. **Overlay:** `bg-black/40` uniformly applied for text contrast.

---

## Implementation Details

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/Home.tsx` | Implemented centered carousel design, custom arrow styling, text logic |
| `src/index.css` | Added helper classes (though inline styles were preferred for fixes) |

### Key Code Patterns

**Centered Carousel Item:**
```tsx
<CarouselItem ... style={{ flexBasis: '100%' }}>
  <div className="relative w-full flex items-center justify-center" style={{ height: '600px' }}>
    {/* Content */}
  </div>
</CarouselItem>
```

**Circular Navigation Arrows:**
```tsx
<CarouselPrevious className="... rounded-full [&_span]:hidden text-[0px]" />
```

---

## Known Issues & Fixes
- **Pill-shaped arrows:** Caused by visible "Previous slide" text. Fixed by adding `text-[0px]` to button classes.
- **Collapsed Height:** `h-[600px]` class was ineffective. Fixed by using inline `style={{ height: '600px' }}`.
- **Text Visibility:** Improved by centering and adding drop shadows + background overlay.

---

*Last reviewed: 2025-12-25*

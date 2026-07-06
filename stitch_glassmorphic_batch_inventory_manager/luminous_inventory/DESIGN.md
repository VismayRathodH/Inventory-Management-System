---
name: Luminous Inventory
colors:
  surface: '#fff8f6'
  surface-dim: '#eed5cb'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#ffe9e2'
  surface-container-high: '#fde3d9'
  surface-container-highest: '#f7ddd3'
  on-surface: '#261813'
  on-surface-variant: '#594137'
  inverse-surface: '#3c2d27'
  inverse-on-surface: '#ffede7'
  outline: '#8d7165'
  outline-variant: '#e1bfb2'
  surface-tint: '#a43e00'
  primary: '#a43e00'
  on-primary: '#ffffff'
  primary-container: '#ff6d1f'
  on-primary-container: '#5b1f00'
  inverse-primary: '#ffb596'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006591'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a4e9'
  on-tertiary-container: '#003650'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#fff8f6'
  on-background: '#261813'
  surface-variant: '#f7ddd3'
typography:
  display-lg:
    fontFamily: manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: hankenGrotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: hankenGrotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: hankenGrotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: hankenGrotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-desktop: 32px
  container-padding-mobile: 16px
  gutter: 24px
  glass-padding: 20px
---

## Brand & Style
The design system focuses on a high-end, modern interpretation of an inventory management suite. By merging the efficiency of professional software with the aesthetic depth of **Glassmorphism**, it creates an interface that feels both sophisticated and lightweight. The target audience includes modern logistics managers and boutique e-commerce operators who value clarity and a premium workspace.

The style leverages frosted-glass surfaces, vibrant accent colors, and soft background blurs to reduce visual weight while maintaining clear hierarchy. The emotional response is one of precision, "airy" organization, and energetic focus.

## Colors
The palette centers on a warm, inviting foundation. The **Primary Orange (#FF6D1F)** is the engine of the UI, used exclusively for critical actions, notifications, and status highlights to ensure they pop against the soft background.

The **Background (#FAF3E1)** provides a stable, matte canvas. Surfaces utilize a semi-transparent **Glass Base (#F5E7C6 at 40% opacity)** which allows the background warmth to bleed through. The **Deep Charcoal (#222222)** ensures that data and typography remain grounded and highly legible, contrasting sharply with the ethereal glass elements.

## Typography
We employ a dual-sans-serif system. **Manrope** is used for headlines and data displays to provide a balanced, modern, and structural feel. Its geometric nature complements the glass shapes. **Hanken Grotesk** is used for body text and labels; its sharp, contemporary terminals ensure that even at 40% surface opacity, information remains crisp and professional.

For inventory counts and numerical data, use `label-md` with tabular figures to ensure columns align perfectly in tables and lists.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for dashboard views to maintain a structured, cockpit-like feel. 

- **Desktop:** 12-column grid with a fixed sidebar (280px). 32px outer margins.
- **Tablet:** 8-column grid with a collapsible sidebar. 24px margins.
- **Mobile:** 4-column grid. Single-column stacked glass cards. 16px margins.

Spacing is governed by an 8px base unit. Because glassmorphism relies on "breathing room" to showcase background blurs, margins between cards are generous (24px) to prevent the UI from feeling cluttered or muddy.

## Elevation & Depth
Depth is not achieved through heavy shadows, but through **optical transparency and refraction**. 

1.  **Base Level:** The cream background.
2.  **Mid Level (Cards/Panels):** `backdrop-filter: blur(12px)` with a 1px solid white border at 60% opacity (inner glow effect). This creates the "sheet of glass" appearance.
3.  **High Level (Modals/Popovers):** `backdrop-filter: blur(24px)` with a slightly more pronounced drop shadow (10% opacity black, 20px blur) to simulate higher physical elevation above the glass panels.

Avoid stacking more than three layers of glass to prevent excessive color distortion.

## Shapes
A **Rounded (0.5rem)** base is used for the majority of UI elements to soften the technical nature of inventory data. For larger glass containers, `rounded-lg` (1rem) is preferred to emphasize the "molded glass" aesthetic. Buttons should utilize `rounded-xl` (1.5rem) to differentiate them as interactive touchpoints within the more rectangular grid of the dashboard.

## Components
- **Buttons:** Primary buttons use a solid #FF6D1F fill with white text. Secondary buttons are "ghost glass" (transparent with the 1px white glow border).
- **Glass Cards:** The primary container for inventory items. Must include the backdrop blur and semi-transparent beige fill.
- **Input Fields:** Semi-transparent white (10% opacity) with a bottom-only 2px border that turns #FF6D1F on focus.
- **Status Chips:** High-saturation pills (e.g., Green for "In Stock", Primary Orange for "Low Stock"). The pill should have a 20% opacity background of its own color to maintain the glass theme.
- **Data Tables:** Row separators are 1px semi-transparent lines. The table header should be slightly more opaque glass (60%) than the body rows (40%) to anchor the data columns.
- **Inventory Metrics:** Large numerical displays using `display-lg` Manrope, placed inside a heavily blurred glass widget.
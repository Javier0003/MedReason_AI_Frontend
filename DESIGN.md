---
name: MedReason_AI
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001f26'
  on-tertiary-container: '#0090a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for a high-stakes medical environment where clarity, speed of cognition, and trust are paramount. The brand personality is **Clinical, Visionary, and Reliable**. It balances the traditional authority of healthcare with the cutting-edge precision of artificial intelligence.

The visual style is **Corporate / Modern** with a **Glassmorphic** layer reserved specifically for AI-driven insights. This distinction allows users to instantly differentiate between raw medical data and machine-learned interpretations. The overall aesthetic is "Tech-Forward Healthcare"—utilizing generous whitespace to reduce cognitive load while maintaining a structured, professional density suitable for complex data management.

## Colors

The palette is anchored in **Deep Navy (#0F172A)**, used for primary navigation and deep-tier text to establish authority. **Medical Blue (#3B82F6)** serves as the functional primary color for actions, links, and active states, providing a familiar healthcare signal. 

**Healthcare Cyan (#06B6D4)** is the signature color for AI features, highlighting predictive text, smart suggestions, and automated data visualizations. Surfaces primarily use **White (#FFFFFF)** and a very light **Neutral Gray (#F8FAFC)** to ensure the interface feels sterile and organized. Success, warning, and error states should utilize standard medical semantic hues but with slightly increased saturation to remain legible against the deep navy backgrounds.

## Typography

The design system utilizes **Inter** for all UI elements due to its exceptional legibility in data-heavy contexts and its neutral, professional tone. Headlines use a tighter letter-spacing and heavier weights to command attention, while body copy remains spacious to ensure readability of patient records and clinical notes.

A monospaced font (JetBrains Mono) is introduced sparingly for numerical data strings, such as patient IDs and laboratory values, ensuring vertical alignment in tables and facilitating quick scanning of numeric fluctuations.

## Layout & Spacing

The layout follows a **Fixed Grid** system for desktop, centered within a maximum container width of 1440px to prevent excessive eye travel. A 12-column structure is used with 24px gutters.

The primary navigation is a persistent **Side Navigation Bar** (260px) on the left, which collapses to an icon-only rail on smaller viewports. Spacing follows a strict 4px base unit. Data-heavy tables and forms utilize "md" (16px) padding for high density, while dashboard overviews use "xl" (32px) padding to create a more breathable, executive feel.

## Elevation & Depth

This design system uses a combination of **Tonal Layers** and **Ambient Shadows** to define hierarchy.
- **Level 0 (Background):** The base neutral gray (#F8FAFC).
- **Level 1 (Cards/Surface):** White surfaces with a very soft, diffused shadow (0px 4px 20px rgba(15, 23, 42, 0.05)).
- **Level 2 (Modals/Popovers):** Higher contrast shadows (0px 12px 32px rgba(15, 23, 42, 0.12)) with a 1px border in a lighter neutral.
- **AI Layers:** For AI-generated insights or "Smart Cards," a **Glassmorphic** effect is applied using a 12px backdrop blur and a semi-transparent Healthcare Cyan border (15% opacity). This creates a "hovering" effect that suggests the content is being generated or layered over the static record.

## Shapes

The shape language is defined by **large, friendly rounded corners** to soften the clinical nature of the data. 
- Standard components like inputs and buttons use a **0.5rem (8px)** radius.
- Data cards and primary containers use a **1rem (16px)** radius.
- Status badges and AI-suggestion chips are **Pill-shaped** to distinguish them from actionable buttons and static data containers.

## Components

### Side Navigation
The sidebar uses the Deep Navy (#0F172A) background. Active states are indicated by a Medical Blue vertical bar on the left and a subtle background highlight. Icons should be "Outlined" style for clarity.

### Data Cards
Cards are the primary container for patient vitals and AI insights. They feature a white background, 16px border-radius, and the Level 1 ambient shadow. AI-enhanced cards include a subtle Healthcare Cyan glow or a glassmorphic header.

### Buttons
- **Primary:** Medical Blue fill, White text.
- **Secondary:** Transparent fill, Medical Blue 1px border.
- **AI Action:** Healthcare Cyan fill, White text, often accompanied by a "Sparkle" icon.

### Data Tables & Status Badges
Tables use a 1px horizontal-only border style to maintain a clean horizontal flow. Status badges utilize a "Soft" style: a light tinted background with dark text (e.g., a "Stable" badge uses a light emerald background with dark emerald text).

### Input Fields
Inputs use a white background with a 1px border (Neutral-300). On focus, the border transitions to Medical Blue with a subtle 2px outer glow. Labels are always positioned above the field in `label-sm` weight.

### AI Assistant Overlay
A persistent, floating action button (FAB) or a docked bottom-right panel using the glassmorphic style for quick natural language queries of the medical database.
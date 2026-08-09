---
name: MedReason_AI
colors:
  surface: '#f3f4f7'
  surface-dim: '#e2e8f0'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8fafc'
  surface-container: '#f1f5f9'
  surface-container-high: '#e9edf3'
  surface-container-highest: '#e2e8f0'
  on-surface: '#0f172a'
  on-surface-variant: '#475569'
  inverse-surface: '#0f1729'
  inverse-on-surface: '#f8fafc'
  outline: '#94a3b8'
  outline-variant: '#cbd5e1'
  surface-tint: '#1565d8'
  primary: '#1565d8'
  on-primary: '#ffffff'
  primary-container: '#0f1729'
  on-primary-container: '#bfdbfe'
  inverse-primary: '#60a5fa'
  secondary: '#3b82f6'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#06b6d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#0e7490'
  on-tertiary-container: '#cffafe'
  error: '#dc2626'
  on-error: '#ffffff'
  error-container: '#fee2e2'
  on-error-container: '#b91c1c'
  primary-fixed: '#dbeafe'
  primary-fixed-dim: '#bfdbfe'
  on-primary-fixed: '#0f1729'
  on-primary-fixed-variant: '#1e40af'
  secondary-fixed: '#dbeafe'
  secondary-fixed-dim: '#bfdbfe'
  on-secondary-fixed: '#0f172a'
  on-secondary-fixed-variant: '#1e40af'
  tertiary-fixed: '#cffafe'
  tertiary-fixed-dim: '#a5f3fc'
  on-tertiary-fixed: '#164e63'
  on-tertiary-fixed-variant: '#155e75'
  background: '#f3f4f7'
  on-background: '#0f172a'
  surface-variant: '#f1f5f9'
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
  sm: 0.375rem
  DEFAULT: 0.5rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
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
  sidebar-width: 200px
---

## Brand & Style

MedReason AI is a clinical AI-assisted diagnosis platform for medical professionals. The design system is engineered for a high-stakes medical environment where clarity, speed of cognition, and trust are paramount. The brand personality is **Clinical, Visionary, and Reliable**. It balances the traditional authority of healthcare with the cutting-edge precision of artificial intelligence.

The visual style is **Corporate / Modern** with a clean, data-dense layout. The overall aesthetic is "Tech-Forward Healthcare"—utilizing generous whitespace to reduce cognitive load while maintaining a structured, professional density suitable for complex data management.

## Colors

The palette is anchored in **Deep Navy (#0F1729)**, used for the persistent side navigation and dark text (#0F172A) to establish authority. **Medical Blue (#1565D8)** is the functional primary color for actions, links, active states, and primary buttons.

Surfaces primarily use **White (#FFFFFF)** and light neutral grays (#F3F4F7, #FAFAFA) to keep the interface sterile and organized. Risk levels follow standard medical semantic hues: **Emerald (#10B981)** for low risk, **Amber (#F59E0B)** for medium risk, and **Rose/Red (#DC2626)** for high risk, all rendered as soft tinted badges.

## Typography

The design system utilizes **Inter** for all UI elements due to its exceptional legibility in data-heavy contexts and its neutral, professional tone. Headlines use a tighter letter-spacing and heavier weights (extrabold, tracking-tight) to command attention, while body copy remains spacious to ensure readability of patient records and clinical notes.

A monospaced font (**JetBrains Mono**) is loaded and available for numerical data strings, such as patient IDs and laboratory values, ensuring vertical alignment in tables and facilitating quick scanning of numeric fluctuations.

## Layout & Spacing

The primary navigation is a persistent **Side Navigation Bar** (200px wide) on the left with a Deep Navy (#0F1729) background. It is fixed to the viewport and the main content area is offset accordingly. Active nav items use a Medical Blue fill; inactive items use translucent white text with a hover state.

Spacing follows a strict 4px base unit. Data-heavy tables and forms utilize 16px (md) padding for high density, while dashboard overviews use larger padding (xl / 32px) to create a more breathable, executive feel.

## Elevation & Depth

This design system uses a combination of **Tonal Layers** and **Soft Shadows** to define hierarchy.
- **Level 0 (Background):** Light neutral gray (#F3F4F7).
- **Level 1 (Cards/Surface):** White surfaces with a very soft, diffused shadow (`0 2px 12px rgba(15, 23, 42, 0.04)`) and a 1px border (`slate-200/80`).
- **Level 2 (Modals/Popovers):** Higher contrast shadows with a `slate-900/40` + backdrop-blur overlay behind the modal, and a white `rounded-2xl` card.

## Shapes

The shape language is defined by **large, friendly rounded corners** to soften the clinical nature of the data.
- Standard components like inputs and buttons use **0.5rem (8px)** radius (`rounded-lg`).
- Data cards and primary containers use **1rem (16px)** radius (`rounded-2xl`).
- Status badges use a "Soft" style: a light tinted background with darker text (e.g., a low-risk badge uses a light emerald background with dark emerald text).

## Components

### Side Navigation
The sidebar uses the Deep Navy (#0F1729) background with the MedReason AI logo block at the top. Active states use a Medical Blue fill (`bg-[#1565d8]`). At the bottom, there are links to Support and Sign Out. Icons use Font Awesome "Solid" style.

### Data Cards
Cards are the primary container for metrics, patient vitals and AI insights. They feature a white background, 16px border-radius, and the Level 1 soft shadow. Metric cards combine a label in uppercase tracking, a large bold value, and an icon tile.

### Buttons
- **Primary:** Medical Blue fill (#1565D8), White text, rounded-lg. Hover darkens to #0F56BD.
- **Secondary:** Transparent/white fill, 1px slate border.
- **Danger/Delete:** Red-tinted border and text (e.g., `border-red-200` / `text-red-500`).
- **Export:** Emerald fill (used in the historial screen).

### Data Tables & Status Badges
Tables use a 1px horizontal-only border style to maintain a clean horizontal flow. Column headers use uppercase, bold, tracking-wide text in slate-400. Rows are clickable and highlight on hover. Status badges use a "Soft" style: a light tinted background with dark text.

### Input Fields
Inputs use a white/slate-50 background with a 1px border (slate-200). On focus, the border transitions to Medical Blue with a subtle 2px glow (`focus:ring-[#1565d8]/20`). Labels use uppercase tracking and are positioned above the field.

### Chat / AI Assistant
The consultation detail screen includes a "Clinical Insight AI" chat panel (right side) that accepts follow-up questions. The AI-generated diagnosis is rendered with **react-markdown**, showing a list of diagnoses with probability, risk level, explanation, alarm signs, and recommendations.

### Modal Dialogs
Modals (new consultation, new/edit patient, new/edit user) use a fixed overlay with `slate-900/40` + `backdrop-blur`, a white `rounded-2xl` card with a header bar, form body, and a footer with Cancel / primary action buttons.

# Design System - StadiumOS Narrative

This document outlines the cinematic enterprise design system specifications for **StadiumOS/ArenaOS**, retrieved directly from Stitch.

---

## Brand & Style
The design system is engineered for the high-stakes, high-velocity environment of a global sporting event. It targets elite stadium operators, logistics directors, and security commanders who require immediate cognitive clarity amidst massive data streams.

The aesthetic is **Cinematic Enterprise**, a fusion of Glassmorphism and high-fidelity technical interfaces. It draws inspiration from spatial computing (Apple Vision Pro) and performance-driven cockpits (Tesla). The UI should feel like an "overlay on reality"—transparent, depth-aware, and luminous. Every element is designed to feel physical yet ethereal, using light as a functional signifier for real-time AI activity.

---

## Design Theme Variables

### Color Palette (DARK Mode)
* **Background:** `#141218`
* **Primary / Accent Tint:** `#cfbcff` (Active state text/buttons)
* **Primary Container:** `#6750a4`
* **On Primary:** `#381e72`
* **Secondary:** `#cdc0e9`
* **Secondary Container:** `#4d4465`
* **Tertiary:** `#e7c365` (Warm accent warning)
* **Surface Void:** `#141218`
* **Surface Bright:** `#3b383e`
* **Surface Containers (Layering):**
  * `Lowest:` `#0f0d13`
  * `Low:` `#1d1b20`
  * `Default:` `#211f24`
  * `High:` `#2b292f`
  * `Highest:` `#36343a`
* **Outline / Borders:** `#948e9c`
* **Outline Variant:** `#494551`

---

## Typography Specs
* **Display XL:**
  * FontFamily: `Geist`
  * FontSize: `64px`
  * FontWeight: `700`
  * LetterSpacing: `-0.04em`
* **Headline LG:**
  * FontFamily: `Geist`
  * FontSize: `32px`
  * FontWeight: `600`
  * LetterSpacing: `-0.02em`
* **Body MD:**
  * FontFamily: `Geist`
  * FontSize: `16px`
  * FontWeight: `400`
* **Label Mono (Machine Readout):**
  * FontFamily: `JetBrains Mono`
  * FontSize: `12px`
  * FontWeight: `500`
  * LetterSpacing: `0.05em` (uppercase fallback)

---

## Elevation & Depth (Z-axis Layering)
1. **Base Layer:** The solid `#050816` background.
2. **Glass Tier (Mid):** `20px` backdrop-blur, 60% opacity fill, 1px translucent border. Used for cards and widgets.
3. **Floating Tier (High):** `40px` backdrop-blur, 80% opacity fill, 1.5px border with a subtle top-down linear gradient (White to Transparent) to simulate a light source hitting the top edge.
4. **Active / AI Glow:** Elements that are "AI-active" or "In-Focus" use a soft colored outer glow (spread: 2px, blur: 15px) matching the primary gradient.

---

## Component Guidelines
* **Magnetic Buttons:** Use a subtle hover effect where the button follows the cursor within a 10px radius. Backgrounds should be the Electric Blue gradient with a "shimmer" animation.
* **Glass Cards:** Always feature a 1px border and `backdrop-filter: blur(20px)`. Content inside should have a 24px inner padding.
* **Glowing Indicators:** For real-time status (e.g., Gate Security), use a pulse animation: a 4px solid dot surrounded by two concentric circles that expand and fade.
* **Sidebar Navigation:** Use a vertical "pill" indicator for the active state that slides smoothly between items. Icons should be thin-stroke (1.5pt) and glow slightly when active.
* **Input Fields:** Bottom-border only or very subtle ghost-outlines. On focus, the border should animate into the primary gradient from the center outwards.
* **AI Pulse:** Any element processing data should have a subtle "breathing" opacity animation (0.8 to 1.0) to signify live background activity.

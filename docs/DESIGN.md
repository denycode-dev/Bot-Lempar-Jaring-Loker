# AutoApply — Design System

> Read by AI coding agents before generating or editing UI. Follow the tokens and philosophy
> strictly. Do not invent colors, spacing, radii, or type values that aren't defined here — ask
> or extend this file instead.
>
> **Source of truth:** the AutoApply logo (loop + checkmark, shadcn *zinc* palette, blue accent, Inter).
> Values marked **(suggested)** are not derived from the logo — they are sensible defaults to confirm.
>
> **Stack:** Next.js + TypeScript + Tailwind CSS + shadcn/ui (Lucide icons). Tokens below map to
> shadcn CSS variables, so Tailwind classes like `bg-background`, `text-muted-foreground`, `bg-brand` just work.

## Logo & Brand Assets

| Logo part | Maps to token | Rule |
|-----------|---------------|------|
| Ring (loop) | `foreground` | The process / automation. Neutral, never blue. |
| Checkmark + arrowhead | `brand` | The only blue in the logo = "application sent". Same meaning in UI. |
| Wordmark "auto" | `foreground` | Semibold 600, letter-spacing −0.03em |
| Wordmark "apply" | `muted-foreground` | Same weight, muted color |
| Tile | `card` + `border` | Rounded square, radius = 25% of tile size |

| Use | File (`public/…`) |
|-----|-------------------|
| Header, light / dark theme | `brand/header-light.svg` / `brand/header-dark.svg` |
| Hero / large logo | `brand/logo-light.svg` / `brand/logo-dark.svg` |
| Avatar, sidebar, social | `brand/icon-light.svg` / `brand/icon-dark.svg` |
| Favicon | `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` |
| PWA | `pwa-192.png`, `pwa-512.png` (from `app-icon.svg`, full-bleed) |

- Switch variant by theme: `<img class="dark:hidden">` + `<img class="hidden dark:block">`.
- Minimum size: header logo height ≥ 24px; below that use the icon only (≤ 24px → `favicon.svg`).
- Clear space around the logo ≥ ¼ of the icon height. Never recolor, stretch, add shadows, or re-typeset the wordmark.

## Color Tokens

Light is default; dark via `.dark` class. Names = shadcn variables (`--brand*` are added).

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background` | `#FFFFFF` | `#09090B` | Page background |
| `foreground` | `#09090B` | `#FAFAFA` | Body text, headings, logo ring |
| `card` / `popover` | `#FFFFFF` | `#18181B` | Cards, dialogs, popovers. Dark = one step above background (matches logo tile) |
| `primary` | `#18181B` | `#FAFAFA` | Default filled button, selected states (neutral, shadcn standard) |
| `primary-foreground` | `#FAFAFA` | `#18181B` | Text on `primary` |
| `secondary` / `muted` / `accent` | `#F4F4F5` | `#27272A` | Subtle fills: hover rows, tabs, inputs bg, skeletons |
| `muted-foreground` | `#71717A` | `#A1A1AA` | Secondary text, helper text, wordmark "apply" |
| `border` | `#E4E4E7` | `#27272A` | Dividers, card borders, logo tile border |
| `input` | `#D4D4D8` | `#3F3F46` | Form control borders |
| `brand` | `#2563EB` | `#60A5FA` | **Accent.** Checkmarks, "sent" status, links, focus ring, the one automation CTA |
| `brand-hover` | `#1D4ED8` | `#93C5FD` | Hover/pressed for `brand` elements |
| `brand-foreground` | `#FFFFFF` | `#09090B` | Text/icon on a filled `brand` background |
| `brand-subtle` | `#EFF6FF` | `rgba(96,165,250,0.12)` | Tinted background behind brand text/icons (badges, highlights) |
| `ring` | = `brand` | = `brand` | `focus-visible` ring |
| `success` (suggested) | `#15803D` | `#4ADE80` | System success, "interview scheduled" |
| `warning` (suggested) | `#B45309` | `#FBBF24` | Non-blocking alerts, expiring session |
| `destructive` (suggested) | `#DC2626` | `#F87171` | Errors, delete, failed submission |

Contrast notes (verified): `muted-foreground` is 4.83:1 on `background` but **4.4:1 on `secondary`** — on
`secondary`/`muted` fills use `#52525B` (light) instead. `brand` on `brand-subtle` = 4.75:1 (OK for text).

```css
/* globals.css — Tailwind v4 + shadcn */
:root {
  --background:#FFFFFF; --foreground:#09090B; --card:#FFFFFF; --card-foreground:#09090B;
  --popover:#FFFFFF; --popover-foreground:#09090B;
  --primary:#18181B; --primary-foreground:#FAFAFA;
  --secondary:#F4F4F5; --secondary-foreground:#18181B; --muted:#F4F4F5; --muted-foreground:#71717A;
  --accent:#F4F4F5; --accent-foreground:#18181B;
  --border:#E4E4E7; --input:#D4D4D8; --ring:#2563EB;
  --brand:#2563EB; --brand-hover:#1D4ED8; --brand-foreground:#FFFFFF; --brand-subtle:#EFF6FF;
  --success:#15803D; --warning:#B45309; --destructive:#DC2626;
  --radius:0.625rem;
}
.dark {
  --background:#09090B; --foreground:#FAFAFA; --card:#18181B; --card-foreground:#FAFAFA;
  --popover:#18181B; --popover-foreground:#FAFAFA;
  --primary:#FAFAFA; --primary-foreground:#18181B;
  --secondary:#27272A; --secondary-foreground:#FAFAFA; --muted:#27272A; --muted-foreground:#A1A1AA;
  --accent:#27272A; --accent-foreground:#FAFAFA;
  --border:#27272A; --input:#3F3F46; --ring:#60A5FA;
  --brand:#60A5FA; --brand-hover:#93C5FD; --brand-foreground:#09090B; --brand-subtle:rgba(96,165,250,0.12);
  --success:#4ADE80; --warning:#FBBF24; --destructive:#F87171;
}
@theme inline {
  --color-brand: var(--brand); --color-brand-hover: var(--brand-hover);
  --color-brand-foreground: var(--brand-foreground); --color-brand-subtle: var(--brand-subtle);
  --color-success: var(--success); --color-warning: var(--warning);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

## Typography

- **Font (headings + body):** `Inter` via `next/font/google` (same family as the logo wordmark), fallback `ui-sans-serif, system-ui, sans-serif`.
- **Mono (suggested):** `ui-monospace, SFMono-Regular, Menlo, monospace` — only for IDs, logs, code.
- Headings: weight 600, letter-spacing `-0.025em` (wordmark uses −0.03em). Body: 400, normal tracking.
- Numbers in tables, stats, and counters: `tabular-nums`.
- Weights allowed: **400, 500, 600 only.**

| Role | Size / Tailwind | Weight | Line-height |
|------|-----------------|--------|-------------|
| Display (hero, md+) | 48px `text-5xl` | 600 | 48px |
| H1 | 36px `text-4xl` | 600 | 40px |
| H2 | 30px `text-3xl` | 600 | 36px |
| H3 | 24px `text-2xl` | 600 | 32px |
| H4 / card title | 18px `text-lg` | 600 | 28px |
| Body | 16px `text-base` | 400 | 24px |
| Small / table cell | 14px `text-sm` | 400 | 20px |
| Label / button | 14px `text-sm` | 500 | 20px |
| Caption | 12px `text-xs` | 500 | 16px |

## Spacing

- Base unit: `4px` (Tailwind default). Scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`.
- Page container: `max-w-6xl`, horizontal padding 16px (mobile) / 24px (md+). Section vertical gap 64px (mobile 48px).
- Card padding 24px; form field gap 16px; label-to-input gap 8px.

## Components

- **Radius** (`--radius: 10px`): `sm` 6px (badges, small chips) · `md` 8px (buttons, inputs) · `lg` 10px · `xl` 14px (cards, dialogs).
  Icon tiles / avatars / app icons: **radius = 25% of size** (as in the logo). Status pills: `rounded-full`.
- **Elevation:** border first, shadow second. Inputs/outline buttons `shadow-xs` (`0 1px 2px rgba(0,0,0,.05)`);
  cards `shadow-sm`; popovers/dropdowns `shadow-md`. **Dark mode: no shadows** — use `card` surface + `border`.
- **Icons:** Lucide only. Stroke 2 (same chunky, round-capped feel as the logo glyph), `stroke-linecap: round`. Sizes 16 / 20 / 24.
- **Buttons** (height 36px default, 32px sm, 40px lg):
  - `default` — `primary` fill. Standard action.
  - `brand` — `brand` fill, `brand-foreground` text. **Max one per view**, reserved for the action that *starts* automation (e.g. "Mulai AutoApply").
  - `secondary` — `secondary` fill · `outline` — `border` + `shadow-xs` · `ghost` — no fill, hover `accent` · `destructive` — only for irreversible actions.
- **Inputs:** 36px high, `rounded-md`, `input` border, `background` fill. Focus: `ring-2 ring-ring ring-offset-2 ring-offset-background`.
  Error: `destructive` border + 14px `destructive` helper text with an icon (never color alone).
- **Cards:** `rounded-xl border bg-card`, `shadow-sm` (light only). Header = H4 + `muted-foreground` description.
- **Application status badges** (`rounded-full`, 12px/500, icon + label):

  | Status | Style |
  |--------|-------|
  | Queued / Draft | `secondary` bg, `muted-foreground` text (use `#52525B` on this bg) |
  | Processing | `brand-subtle` bg, `brand` text, spinning loop icon |
  | Sent (Terkirim) | `brand-subtle` bg, `brand` text, **check icon** (mirrors the logo) |
  | Interview | `success` text on `success` @10% bg |
  | Rejected | `secondary` bg, `muted-foreground` — neutral, not red |
  | Failed (system/submit error) | `destructive` text on `destructive` @10% bg |

- **Dialogs:** overlay `rgba(0,0,0,0.5)` (light) / `rgba(0,0,0,0.7)` (dark), `rounded-xl`, `max-w-lg`, footer buttons right-aligned, primary action last.

## Motion (suggested)

- Fast (hover, toggle, focus): `150ms`, `cubic-bezier(0.4, 0, 0.2, 1)`.
- Standard (dialog, dropdown, tab, toast): `200ms`, same easing; page/route transitions ≤ `300ms`.
- **Signature — "running":** the loop ring rotates `360deg`, `1s linear infinite` (Processing state, button loading, skeleton-free loading).
- **Signature — "done":** checkmark draws in via `stroke-dashoffset`, `250ms ease-out`, once.
- Respect `prefers-reduced-motion`: replace spin with a static ring + pulsing opacity, remove draw-in.

---

## Design Philosophy

**Overall vibe:** Quiet, monochrome, tool-like — a shadcn-clean interface where blue appears only
where automation does something or finishes. The product works in the background; the UI stays calm, dense-enough, and trustworthy.

**Usage guidelines:**
- Zinc neutrals carry ~90–95% of every screen. `brand` is a signal, not a decoration — if blue is everywhere, it means nothing.
- Blue = **"done / sent / automated"**. Checkmark = completed, loop = running. Use these two metaphors consistently; don't reuse them for unrelated meanings.
- One `brand` filled button per view, only for starting/confirming automation. Everything else uses `default`, `secondary`, `outline`, or `ghost`.
- Links and focus rings use `brand`; body links are underlined on hover and always underlined inside running text.
- Hierarchy comes from weight (600 vs 400), size, and `muted-foreground` — not from extra colors.
- Surfaces: separate with `border` first; add a surface step (`secondary` / dark `card`) only to group content, never both a heavy shadow and a border.

**Accessibility:**
- All text ≥ 4.5:1 contrast (WCAG AA); large text and UI icons ≥ 3:1. Check any new pairing — see the contrast notes above.
- `border` (`#E4E4E7`) is a decorative separator only (1.27:1). Never rely on it as the sole cue for an interactive control: inputs need a visible label and a focus ring.
- Every interactive element has a visible `focus-visible` ring (brand). Touch targets ≥ 40×40px on mobile.
- Never convey status by color alone — pair with an icon and text label.
- Honor `prefers-reduced-motion` and `prefers-color-scheme` (default to system theme, allow manual override).

**Do:**
- Use Lucide icons at stroke 2 with round caps so they match the logo glyph.
- Use the 25% radius rule for any square tile (avatar, app icon, feature icon).
- Pair a check icon with every "Sent" status; pair the spinning loop with every "Processing" state.
- Keep headings semibold with tight tracking, and `tabular-nums` for counts, dates, and stats.
- Provide every surface in both themes; in dark mode, elevate with `card` (`#18181B`) instead of shadows.
- Use the "apply"-style muted text (`muted-foreground`) for secondary information next to a strong primary label (mirrors the wordmark).

**Don't:**
- Don't use blue for large fills, section backgrounds, gradients, or decorative illustrations.
- Don't put more than one `brand` filled button on a screen, or make a neutral action (Cancel, Back) blue.
- Don't introduce other accent hues (purple, green, orange) beyond the semantic `success` / `warning` / `destructive`.
- Don't use red for "Rejected" — rejection is normal in job hunting; reserve `destructive` for system failures and irreversible actions.
- Don't use font weights outside 400/500/600, or a second typeface.
- Don't add drop shadows to flat/inline elements, or any shadow in dark mode.
- Don't recolor, outline, or re-typeset the logo; don't place the light logo on dark backgrounds (or vice versa).
- Don't hardcode hex values in components — always use the tokens (`bg-brand`, `text-muted-foreground`, …).

---

*This file guides an LLM; it does not enforce anything like a linter. Review generated UI by eye,
especially right after adopting or changing this file.*

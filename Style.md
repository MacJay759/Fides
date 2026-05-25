# Fides — Style Guide
**Version:** 2.0  
**Stack:** HTML5 · Tailwind CSS (CDN) · Vanilla JS  
**Fonts:** Geist · Geist Mono  
**Grid:** 4pt base unit  
**Shadows:** None — strokes only  
**Modes:** Light · Dark

---

## 1. Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
:root {
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Geist Mono', 'Courier New', monospace;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

/* Rule: all financial data uses mono */
.mono,
.amount,
.inv-num,
.date-val,
.ref-val {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
```

---

## 2. 4pt Spacing Scale

All spacing, padding, margin, gap, and sizing values snap to multiples of 4px.

```css
:root {
  --sp-1:  4px;
  --sp-2:  8px;
  --sp-3:  12px;
  --sp-4:  16px;
  --sp-5:  20px;
  --sp-6:  24px;
  --sp-7:  28px;
  --sp-8:  32px;
  --sp-9:  36px;
  --sp-10: 40px;
  --sp-11: 44px;
  --sp-12: 48px;
  --sp-14: 56px;
  --sp-16: 64px;
  --sp-20: 80px;
  --sp-24: 96px;
}
```

**Key layout measurements:**
| Element | Value |
|---|---|
| Sidebar width (desktop) | 240px |
| Sidebar width (tablet — icon rail) | 64px |
| Page content padding (desktop) | 32px |
| Page content padding (mobile) | 16px |
| Page header height | 60px |
| Table row height | 52px |
| Input height | 36px |
| Button height (md) | 36px |
| Button height (sm) | 28px |
| Card padding | 20px |
| Card padding (compact) | 16px |
| Gap between stat cards | 12px |
| Section gap | 24px |
| Mobile bottom nav height | 56px |
| Min touch target | 44px |

---

## 3. Color System

### CSS Custom Properties — Light Mode (`:root`)

```css
:root {
  /* ── Brand ───────────────────────────────── */
  --orange-50:   #FFF7ED;
  --orange-100:  #FFEDD5;
  --orange-200:  #FED7AA;
  --orange-400:  #FB923C;
  --orange-500:  #F97316;   /* Primary CTA, active nav, focus ring */
  --orange-600:  #EA580C;   /* Button hover */
  --orange-700:  #C2410C;   /* Button active/pressed */

  /* ── Neutrals ────────────────────────────── */
  --neutral-0:    #FFFFFF;
  --neutral-50:   #F7F7F7;   /* Sidebar bg (light) */
  --neutral-100:  #F0F0F0;
  --neutral-150:  #EBEBEB;   /* Default border */
  --neutral-200:  #E0E0E0;   /* Stronger border / divider */
  --neutral-300:  #C8C8C8;
  --neutral-400:  #A0A0A0;
  --neutral-500:  #6B6B6B;   /* Muted text */
  --neutral-600:  #4A4A4A;
  --neutral-700:  #2E2E2E;
  --neutral-800:  #1A1A1A;
  --neutral-900:  #111111;
  --neutral-950:  #0A0A0A;   /* Page bg (dark mode) */

  /* ── Semantic — Light ────────────────────── */
  --bg-page:        var(--neutral-0);
  --bg-sidebar:     var(--neutral-50);
  --bg-surface:     var(--neutral-50);
  --bg-subtle:      var(--neutral-100);

  --border-default: var(--neutral-150);
  --border-strong:  var(--neutral-200);
  --border-focus:   var(--orange-500);

  --text-primary:   var(--neutral-950);
  --text-secondary: var(--neutral-500);
  --text-tertiary:  #9B9B9B;
  --text-disabled:  #C0C0C0;
  --text-on-orange: #FFFFFF;

  /* ── Status — intentionally low saturation ─ */
  --status-draft-bg:     #F5F5F5;
  --status-draft-text:   #737373;
  --status-draft-border: #E5E5E5;

  --status-sent-bg:      #F0F4FF;
  --status-sent-text:    #3B6FD4;
  --status-sent-border:  #DBEAFE;

  --status-viewed-bg:    #F5F2FF;
  --status-viewed-text:  #7C5CBF;
  --status-viewed-border:#E9D5FF;

  --status-overdue-bg:   #FFF1F2;
  --status-overdue-text: #D94F5C;
  --status-overdue-border:#FECDD3;

  --status-paid-bg:      #F0FBF5;
  --status-paid-text:    #2D8A5E;
  --status-paid-border:  #BBF7D0;

  --status-void-bg:      #FEFCE8;
  --status-void-text:    #A16207;
  --status-void-border:  #FEF08A;

  --status-partial-bg:   #F0FAFA;
  --status-partial-text: #0D7A7A;
  --status-partial-border:#99F6E4;

  /* ── Feedback ────────────────────────────── */
  --color-success: #2D8A5E;
  --color-warning: #A16207;
  --color-danger:  #D94F5C;
  --color-info:    #3B6FD4;

  /* ── Radii ───────────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   10px;
  --radius-xl:   12px;
  --radius-full: 9999px;

  /* ── Transitions ─────────────────────────── */
  --ease-fast:   80ms ease;
  --ease-base:   120ms ease-out;
  --ease-slow:   200ms ease-out;
}
```

### Dark Mode — `.dark` class on `<html>`

```css
.dark {
  --bg-page:        #0A0A0A;
  --bg-sidebar:     #080808;
  --bg-surface:     #111111;
  --bg-subtle:      #161616;

  --border-default: #1E1E1E;
  --border-strong:  #2A2A2A;
  --border-focus:   var(--orange-500);

  --text-primary:   #F5F5F5;
  --text-secondary: #888888;
  --text-tertiary:  #555555;
  --text-disabled:  #333333;

  /* Status — darkened backgrounds */
  --status-draft-bg:      #1A1A1A;
  --status-draft-text:    #888888;
  --status-draft-border:  #2A2A2A;

  --status-sent-bg:       #0D1526;
  --status-sent-text:     #6B9FE4;
  --status-sent-border:   #1E3A5F;

  --status-viewed-bg:     #140D26;
  --status-viewed-text:   #A78BDB;
  --status-viewed-border: #2D1A4F;

  --status-overdue-bg:    #200A0D;
  --status-overdue-text:  #F08090;
  --status-overdue-border:#4A1520;

  --status-paid-bg:       #091A12;
  --status-paid-text:     #4CB87A;
  --status-paid-border:   #14472E;

  --status-void-bg:       #1A1500;
  --status-void-text:     #D4A030;
  --status-void-border:   #3D2F00;

  --status-partial-bg:    #091818;
  --status-partial-text:  #2EBDBD;
  --status-partial-border:#0D3535;
}
```

### Dark Mode Toggle (JS)

```js
// js/theme.js
const THEME_KEY = 'fides_theme';

function getTheme() {
  return localStorage.getItem(THEME_KEY)
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// Call on every page load before any render
applyTheme(getTheme());

export { getTheme, applyTheme, toggleTheme };
```

---

## 4. Typography Scale

```css
/* Display — invoice totals, empty state headlines */
.text-display {
  font-size: 32px; line-height: 36px;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: -0.02em;
}

/* Page title */
.text-title {
  font-size: 20px; line-height: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Section heading */
.text-heading {
  font-size: 15px; line-height: 20px;
  font-weight: 600;
}

/* Body — default UI text */
.text-body {
  font-size: 14px; line-height: 20px;
  font-weight: 400;
}

/* Body medium — slightly emphasized */
.text-body-md {
  font-size: 14px; line-height: 20px;
  font-weight: 500;
}

/* Small — sub-labels, hints, table sub-rows */
.text-small {
  font-size: 13px; line-height: 16px;
  font-weight: 400;
}

/* Caption — timestamps, section labels, table headers */
.text-caption {
  font-size: 12px; line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Micro — purely structural labels, not content */
.text-micro {
  font-size: 11px; line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* Stat number — KPI cards */
.text-stat {
  font-family: var(--font-mono);
  font-size: 24px; line-height: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* Amount — table cells */
.text-amount {
  font-family: var(--font-mono);
  font-size: 14px; line-height: 20px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* Amount large — invoice total */
.text-amount-lg {
  font-family: var(--font-mono);
  font-size: 22px; line-height: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

---

## 5. Base CSS (app.css)

```css
/* ── Reset ─────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { height: 100%; }

body {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 20px;
  color: var(--text-primary);
  background: var(--bg-page);
  -webkit-font-smoothing: antialiased;
  height: 100%;
}

/* ── No shadows — only borders ─────────────── */
* { box-shadow: none !important; }

/* ── Focus ─────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--orange-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ── Scrollbar ─────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: var(--radius-full);
}

/* ── Selection ─────────────────────────────── */
::selection {
  background: var(--orange-100);
  color: var(--orange-700);
}
.dark ::selection {
  background: rgba(249,115,22,0.2);
  color: var(--orange-400);
}

/* ── Links ─────────────────────────────────── */
a { color: inherit; text-decoration: none; }

/* ── Divider ───────────────────────────────── */
.divider {
  height: 1px;
  background: var(--border-default);
  border: none;
}
```

---

## 6. Layout Shell

```html
<body>
  <div id="app-shell">

    <!-- Sidebar (hidden below 768px) -->
    <aside id="sidebar">
      <!-- see Section 7 -->
    </aside>

    <!-- Content area -->
    <div id="content-wrap">

      <!-- Sticky page header -->
      <header id="page-header">
        <!-- see Section 8 -->
      </header>

      <!-- Scrollable page body -->
      <main id="page-body">
        <!-- Page content -->
      </main>

    </div>

  </div>

  <!-- Mobile bottom nav (visible below 768px) -->
  <nav id="mobile-nav">
    <!-- see Section 9.3 -->
  </nav>
</body>
```

```css
#app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

#sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  overflow-y: auto;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
}

#content-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#page-header {
  height: 60px;
  padding: 0 var(--sp-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-page);
  flex-shrink: 0;
}

#page-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-8);
}

/* Tablet */
@media (max-width: 1023px) {
  #sidebar { width: 64px; min-width: 64px; }
  .sidebar-label { display: none; }
  .sidebar-section-label { display: none; }
}

/* Mobile */
@media (max-width: 767px) {
  #sidebar { display: none; }
  #mobile-nav { display: flex; }
  #page-body { padding: var(--sp-4); padding-bottom: calc(56px + var(--sp-4)); }
  #page-header { padding: 0 var(--sp-4); }
}
```

---

## 7. Sidebar Component

```css
/* Sidebar structure */
.sidebar-logo-area {
  height: 60px;
  padding: 0 var(--sp-4);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
}

.sidebar-logo-mark {
  width: 28px;
  height: 28px;
  background: var(--orange-500);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.sidebar-wordmark {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Search in sidebar */
.sidebar-search {
  margin: var(--sp-3) var(--sp-3) var(--sp-2);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: text;
  transition: border-color var(--ease-base);
}
.sidebar-search:hover { border-color: var(--border-strong); }
.sidebar-search input {
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
  width: 100%;
}
.sidebar-search input::placeholder { color: var(--text-tertiary); }
.sidebar-search-shortcut {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: 1px 5px;
  white-space: nowrap;
}

/* Nav area */
.sidebar-nav {
  flex: 1;
  padding: var(--sp-2) var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

/* Section label */
.sidebar-section-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  padding: var(--sp-3) var(--sp-2) var(--sp-1);
  margin-top: var(--sp-2);
}

/* Nav item */
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-2);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--ease-fast), background var(--ease-fast);
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  text-decoration: none;
  height: 36px;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.nav-item.active {
  color: var(--text-primary);
  font-weight: 500;
  background: var(--bg-subtle);
}

/* Orange left border on active item */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: -12px; /* extends to sidebar edge */
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--orange-500);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

/* Nav icon */
.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: inherit;
}

/* Sidebar footer */
.sidebar-footer {
  padding: var(--sp-3);
  border-top: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-shrink: 0;
}

.sidebar-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--orange-100);
  color: var(--orange-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.dark .sidebar-avatar {
  background: rgba(249,115,22,0.15);
  color: var(--orange-400);
}

.sidebar-user-name  { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.sidebar-user-email { font-size: 11px; color: var(--text-tertiary); }

/* Tablet: icon-only rail */
@media (max-width: 1023px) {
  .sidebar-wordmark   { display: none; }
  .sidebar-search     { padding: var(--sp-2); justify-content: center; }
  .sidebar-search span,
  .sidebar-search input,
  .sidebar-search-shortcut { display: none; }
  .nav-item           { justify-content: center; padding: var(--sp-2); }
  .sidebar-user-name,
  .sidebar-user-email { display: none; }
  .nav-item.active::before { left: -8px; }
}
```

---

## 8. Page Header

```css
.page-header-left {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: 13px;
  color: var(--text-tertiary);
}
.breadcrumb-sep { color: var(--border-strong); }
.breadcrumb-current { color: var(--text-primary); font-weight: 500; }

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
```

---

## 9. Component Library

### 9.1 Buttons

```css
/* Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  font-family: var(--font-sans);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--ease-base), color var(--ease-base), border-color var(--ease-base);
  white-space: nowrap;
  text-decoration: none;
  outline: none;
}
.btn:active { transform: scale(0.98); }

/* Sizes — all heights on 4pt grid */
.btn-sm  { height: 28px; padding: 0 var(--sp-3); font-size: 13px; }
.btn-md  { height: 36px; padding: 0 var(--sp-4); font-size: 14px; }
.btn-lg  { height: 40px; padding: 0 var(--sp-5); font-size: 14px; }

/* Primary — Orange fill */
.btn-primary {
  background: var(--orange-500);
  color: white;
  border-color: var(--orange-500);
}
.btn-primary:hover  { background: var(--orange-600); border-color: var(--orange-600); }
.btn-primary:active { background: var(--orange-700); border-color: var(--orange-700); }

/* Secondary — neutral outlined */
.btn-secondary {
  background: var(--bg-page);
  color: var(--text-primary);
  border-color: var(--border-default);
}
.btn-secondary:hover { background: var(--bg-surface); border-color: var(--border-strong); }

/* Ghost — no border */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.btn-ghost:hover { background: var(--bg-subtle); color: var(--text-primary); }

/* Danger outlined */
.btn-danger {
  background: var(--bg-page);
  color: var(--color-danger);
  border-color: var(--status-overdue-border);
}
.btn-danger:hover { background: var(--status-overdue-bg); }

/* Icon-only */
.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: var(--radius-md);
}
.btn-icon.btn-sm { width: 28px; height: 28px; }
```

### 9.2 Cards

```css
.card {
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--sp-5);
}

/* No hover by default — only apply card-interactive where needed */
.card-interactive {
  cursor: pointer;
  transition: border-color var(--ease-base);
}
.card-interactive:hover { border-color: var(--border-strong); }

/* Compact variant */
.card-sm { padding: var(--sp-4); border-radius: var(--radius-lg); }
```

### 9.3 Stat Card

```html
<div class="stat-card">
  <p class="stat-label">Total Outstanding</p>
  <p class="stat-value">₦ 840,000</p>
  <div class="stat-trend stat-trend-up">
    <svg>...</svg>
    <span>3 invoices</span>
  </div>
</div>
```

```css
.stat-card {
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  border-right: 1px solid var(--border-default);
}
.stat-card:last-child { border-right: none; }

/* On mobile, border-right becomes border-bottom */
@media (max-width: 767px) {
  .stat-card { border-right: none; border-bottom: 1px solid var(--border-default); }
  .stat-card:last-child { border-bottom: none; }
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: 12px;
  font-weight: 500;
}
.stat-trend-up   { color: var(--color-success); }
.stat-trend-down { color: var(--color-danger); }
.stat-trend-neutral { color: var(--text-tertiary); }

/* Stats strip container */
.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background: var(--bg-page);
  overflow: hidden;
}

@media (max-width: 767px) {
  .stats-strip { grid-template-columns: repeat(2, 1fr); }
}
```

### 9.4 Status Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  height: 20px;
  padding: 0 var(--sp-2);
  border-radius: var(--radius-full);
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  font-family: var(--font-sans);
}

/* Dot */
.badge::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.badge-draft   { background:var(--status-draft-bg);   color:var(--status-draft-text);   border-color:var(--status-draft-border);   }
.badge-sent    { background:var(--status-sent-bg);    color:var(--status-sent-text);    border-color:var(--status-sent-border);    }
.badge-viewed  { background:var(--status-viewed-bg);  color:var(--status-viewed-text);  border-color:var(--status-viewed-border);  }
.badge-overdue { background:var(--status-overdue-bg); color:var(--status-overdue-text); border-color:var(--status-overdue-border); }
.badge-paid    { background:var(--status-paid-bg);    color:var(--status-paid-text);    border-color:var(--status-paid-border);    }
.badge-void    { background:var(--status-void-bg);    color:var(--status-void-text);    border-color:var(--status-void-border);    }
.badge-partial { background:var(--status-partial-bg); color:var(--status-partial-text); border-color:var(--status-partial-border); }
```

### 9.5 Form Inputs

```css
.field { display: flex; flex-direction: column; gap: var(--sp-1); }

.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.input {
  height: 36px;
  padding: 0 var(--sp-3);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--ease-base);
  width: 100%;
}
.input::placeholder { color: var(--text-tertiary); }
.input:hover  { border-color: var(--border-strong); }
.input:focus  { border-color: var(--border-focus); }

.textarea {
  height: auto;
  min-height: 80px;
  padding: var(--sp-2) var(--sp-3);
  resize: vertical;
  line-height: 20px;
}

.input-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.input-error { border-color: var(--color-danger); }
.input-error:focus { border-color: var(--color-danger); }

.hint   { font-size: 12px; color: var(--text-tertiary); }
.error-msg { font-size: 12px; color: var(--color-danger); }

/* Input with icon prefix */
.input-wrap { position: relative; }
.input-wrap .input  { padding-left: var(--sp-9); }
.input-prefix-icon {
  position: absolute;
  left: var(--sp-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
  width: 16px;
  height: 16px;
}

/* Select */
.select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239B9B9B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--sp-3) center;
  padding-right: var(--sp-8);
  cursor: pointer;
}
```

### 9.6 Data Table

```css
.table-container {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background: var(--bg-page);
  overflow: hidden;
}

/* Mobile: horizontal scroll */
.table-scroll { overflow-x: auto; }

.table { width: 100%; border-collapse: collapse; }

.table thead tr {
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-surface);
}

.table th {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  padding: var(--sp-3) var(--sp-4);
  text-align: left;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.table th.right { text-align: right; }

.table td {
  height: 52px;
  padding: 0 var(--sp-4);
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-default);
  vertical-align: middle;
}
.table td.right { text-align: right; }
.table tbody tr:last-child td { border-bottom: none; }

.table tbody tr { transition: background var(--ease-fast); }
.table tbody tr:hover { background: var(--bg-surface); }

/* Row actions — visible on hover only */
.row-actions { opacity: 0; transition: opacity var(--ease-fast); }
.table tbody tr:hover .row-actions { opacity: 1; }

/* Client cell */
.cell-client {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.cell-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.cell-client-name  { font-size: 14px; font-weight: 500; line-height: 18px; }
.cell-client-email { font-size: 12px; color: var(--text-tertiary); line-height: 16px; }

/* Mobile: hide less important columns */
@media (max-width: 767px) {
  .table th.hide-mobile,
  .table td.hide-mobile { display: none; }
}
```

### 9.7 Modal

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: var(--sp-4);
  animation: fadein var(--ease-slow);
}
.dark .modal-backdrop { background: rgba(0,0,0,0.6); }

.modal {
  background: var(--bg-page);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  animation: scalein 150ms ease-out;
}

.modal-header {
  padding: var(--sp-6) var(--sp-6) 0;
}
.modal-title    { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.modal-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: var(--sp-1); }

.modal-body   { padding: var(--sp-5) var(--sp-6); }

.modal-footer {
  padding: 0 var(--sp-6) var(--sp-6);
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-2);
}

@keyframes fadein  { from { opacity:0; } to { opacity:1; } }
@keyframes scalein {
  from { opacity:0; transform:scale(0.97); }
  to   { opacity:1; transform:scale(1);    }
}
```

### 9.8 Toast

```css
#toast-container {
  position: fixed;
  bottom: var(--sp-6);
  right: var(--sp-6);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  pointer-events: none;
}

@media (max-width: 767px) {
  #toast-container {
    bottom: calc(56px + var(--sp-4));
    left: var(--sp-4);
    right: var(--sp-4);
  }
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  height: 40px;
  padding: 0 var(--sp-4);
  background: var(--neutral-900);
  color: #F5F5F5;
  border: 1px solid var(--neutral-800);
  border-radius: var(--radius-lg);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-sans);
  pointer-events: all;
  animation: toastin var(--ease-slow);
  white-space: nowrap;
}
.dark .toast {
  background: var(--neutral-800);
  border-color: var(--neutral-700);
}

.toast-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.toast-success .toast-dot { background: #4ADE80; }
.toast-error   .toast-dot { background: #F87171; }
.toast-warning .toast-dot { background: #FCD34D; }
.toast-info    .toast-dot { background: #60A5FA; }

@keyframes toastin {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0);   }
}
```

### 9.9 Dropdown Menu

```css
.dropdown { position: relative; display: inline-block; }

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + var(--sp-1));
  background: var(--bg-page);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  min-width: 176px;
  z-index: 30;
  padding: var(--sp-1);
  animation: scalein 100ms ease-out;
  transform-origin: top right;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: 32px;
  padding: 0 var(--sp-3);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: var(--font-sans);
  color: var(--text-primary);
  cursor: pointer;
  transition: background var(--ease-fast);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}
.dropdown-item:hover { background: var(--bg-subtle); }
.dropdown-item-danger { color: var(--color-danger); }
.dropdown-item-danger:hover { background: var(--status-overdue-bg); }

.dropdown-divider {
  height: 1px;
  background: var(--border-default);
  margin: var(--sp-1) 0;
}
```

### 9.10 Tabs / Segmented Control

```css
.tabs {
  display: inline-flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 3px;
  gap: 2px;
}

.tab {
  height: 28px;
  padding: 0 var(--sp-3);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border: none;
  background: transparent;
  transition: color var(--ease-base), background var(--ease-base);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--font-sans);
}
.tab:hover { color: var(--text-primary); }

.tab.active {
  background: var(--bg-page);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

/* Count inside tab */
.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  min-width: 16px;
  padding: 0 4px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  color: var(--text-tertiary);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 500;
}
.tab.active .tab-count {
  background: var(--orange-50);
  border-color: var(--orange-200);
  color: var(--orange-600);
}
.dark .tab.active .tab-count {
  background: rgba(249,115,22,0.1);
  border-color: rgba(249,115,22,0.2);
  color: var(--orange-400);
}
```

### 9.11 Mobile Bottom Nav

```css
#mobile-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 56px;
  background: var(--bg-page);
  border-top: 1px solid var(--border-default);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 40;
  justify-content: space-around;
  align-items: center;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  height: 100%;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--ease-fast);
  border: none;
  background: transparent;
  text-decoration: none;
}
.mobile-nav-item:hover { color: var(--text-secondary); }
.mobile-nav-item.active { color: var(--orange-500); }

@media (max-width: 767px) {
  #mobile-nav { display: flex; }
}
```

---

## 10. Invoice Document Styles

The invoice is a document. It uses its own isolated styles under `.invoice-document`. Always white background — this is printed material, not a screen.

```css
.invoice-document {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 20px;
  color: #111111;
  background: #FFFFFF;
  width: 794px;
  min-height: 1123px;
  padding: 56px 60px;
  box-sizing: border-box;
}

/* All data uses mono */
.invoice-document .mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.invoice-document .doc-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #9B9B9B;
}

/* Line items table */
.invoice-document table { width: 100%; border-collapse: collapse; }
.invoice-document th {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: #9B9B9B;
  border-bottom: 1px solid #EBEBEB;
  padding: 0 0 var(--sp-3);
  text-align: left;
}
.invoice-document th:last-child { text-align: right; }
.invoice-document td {
  padding: var(--sp-3) 0;
  border-bottom: 1px solid #F0F0F0;
  vertical-align: top;
}
.invoice-document td:last-child {
  text-align: right;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
.invoice-document tbody tr:last-child td { border-bottom: none; }

/* Totals */
.invoice-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--sp-2);
  margin-top: var(--sp-6);
  padding-top: var(--sp-6);
  border-top: 1px solid #EBEBEB;
}
.invoice-totals-row {
  display: flex;
  gap: var(--sp-12);
  font-size: 14px;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
.invoice-totals-label { color: #9B9B9B; font-family: var(--font-sans); }
.invoice-totals-total {
  border-top: 1px solid #111111;
  padding-top: var(--sp-3);
  font-size: 16px;
  font-weight: 600;
  margin-top: var(--sp-1);
}
```

---

## 11. Print Stylesheet

```css
/* print.css */
@page { size: A4; margin: 0; }

@media print {
  body * { visibility: hidden; }
  #invoice-print-area,
  #invoice-print-area * { visibility: visible; }
  #invoice-print-area {
    position: fixed;
    inset: 0;
    width: 794px;
  }
  .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

---

## 12. Chart Configuration (Chart.js)

```js
// Apply globally before creating any chart
Chart.defaults.font.family = "'Geist', sans-serif";
Chart.defaults.font.size = 12;

function getChartColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    text:    isDark ? '#555555' : '#9B9B9B',
    grid:    isDark ? '#1E1E1E' : '#F0F0F0',
    line:    '#F97316',
    fill:    isDark ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.06)',
    tooltip: isDark ? '#1A1A1A' : '#111111',
  };
}

function buildAreaChart(ctx, labels, data) {
  const c = getChartColors();
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: c.line,
        borderWidth: 1.5,
        fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
          g.addColorStop(0, c.fill);
          g.addColorStop(1, 'rgba(249,115,22,0)');
          return g;
        },
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: c.line,
        pointHoverBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.tooltip,
          titleColor: '#888888',
          bodyColor: '#F5F5F5',
          titleFont: { family: "'Geist'", size: 12 },
          bodyFont: { family: "'Geist Mono'", size: 14, weight: '600' },
          padding: { top: 8, right: 12, bottom: 8, left: 12 },
          cornerRadius: 8,
          displayColors: false,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: c.text, font: { family: "'Geist'", size: 12 } }
        },
        y: {
          grid: { color: c.grid, drawBorder: false },
          border: { display: false },
          ticks: { color: c.text, font: { family: "'Geist Mono'", size: 12 } }
        }
      }
    }
  });
}
```

---

## 13. Motion

No bounces. No elastic curves. Sub-200ms on everything visible.

```css
/* Page enter */
.page-enter {
  animation: pageenter 120ms ease-out both;
}
@keyframes pageenter {
  from { opacity:0; transform:translateY(4px); }
  to   { opacity:1; transform:translateY(0);   }
}

/* Skeleton loader — no shadow */
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-subtle)  25%,
    var(--bg-surface) 50%,
    var(--bg-subtle)  75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
}
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* Paid checkmark draw */
.check-draw {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: drawcheck 350ms ease-out 80ms forwards;
}
@keyframes drawcheck { to { stroke-dashoffset: 0; } }

/* Subtle overdue pulse */
.badge-overdue {
  animation: pulse 2.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity:1; }
  50%       { opacity:0.7; }
}
```

---

## 14. Page Boilerplate

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fides</title>

  <!-- Theme: apply before page renders to prevent flash -->
  <script>
    const t = localStorage.getItem('fides_theme')
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (t === 'dark') document.documentElement.classList.add('dark');
  </script>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Tailwind (utility helpers) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Chart.js — dashboard pages only -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> -->

  <!-- jsPDF + html2canvas — invoice pages only -->
  <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script> -->
  <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script> -->

  <link rel="stylesheet" href="css/app.css">
  <link rel="stylesheet" media="print" href="css/print.css">
</head>
<body>

  <script type="module">
    import { requireAuth } from './js/router.js';
    requireAuth();
  </script>

  <div id="app-shell">
    <aside id="sidebar"></aside>
    <div id="content-wrap">
      <header id="page-header"></header>
      <main id="page-body" class="page-enter"></main>
    </div>
  </div>

  <nav id="mobile-nav"></nav>
  <div id="toast-container"></div>

  <script type="module" src="./js/page-name.js"></script>
  <script>lucide.createIcons();</script>
</body>
</html>
```

---

## 15. Quick Reference Checklist

Before shipping any screen, verify:

- [ ] All spacing is a multiple of 4px
- [ ] No `box-shadow` used anywhere
- [ ] All borders use `var(--border-default)` or `var(--border-strong)`
- [ ] Orange only on: primary buttons, active nav border, focus ring, chart line, positive trends
- [ ] All monetary values use `.mono` + `font-variant-numeric: tabular-nums`
- [ ] Dark mode tested — no hardcoded hex colors in component CSS (use CSS vars)
- [ ] Touch targets ≥ 44px on mobile
- [ ] Table columns hidden on mobile with `.hide-mobile` where appropriate
- [ ] Theme applied before first paint (script in `<head>`, not `<body>`)
- [ ] Invoice document styles isolated inside `.invoice-document` — never bleeds into app shell

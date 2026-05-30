# RJT Nexus People — Enterprise Design Direction & Redesign Blueprint
## Senior SaaS Design Director Directive
**Target Archetypes:** *Workday, SAP SuccessFactors, Oracle HCM, Visier, Linear, Notion Enterprise*  
**Prohibited Archetypes:** *Power BI, Excel, Generic Admin Templates, Gamer/Neon/Cyberpunk UI*

---

## 1. Complete Design System (SaaS Executive Specs)

The design system transition shifts **RJT Nexus People** away from standard developer-centric dashboards toward a pristine, elite enterprise application. It establishes an authoritative, high-contrast typography hierarchy, light-dominant canvas structures, and surgical execution of high-end details.

### Color Tokens & Semantic Utility
The system follows a strict **80% White / 15% Midnight Navy / 5% Electric & Ice Blue** ratio to convey executive clarity.

| Variable Name | Hex Code | Visual Target | Primary UI Function |
| :--- | :--- | :--- | :--- |
| `--color-canvas` | `#FFFFFF` | Pure white, non-textured | App canvas, card backgrounds, modal wrappers |
| `--color-canvas-subtle` | `#F8FAFC` | Ultra-light neutral grey-blue | App container background, page gutters, inactive tabs |
| `--color-border-light` | `rgba(4,4,74,0.06)` | Ghost-grey hairline | Structural container dividers, card boundaries, table gridlines |
| `--color-border-hover` | `rgba(0,164,255,0.18)` | Subtle sky-blue halo | Interactive borders, focus states, hovering table rows |
| `--color-text-primary` | `#04044A` | Deep Midnight Navy | Primary headings, table metrics, high-weight text, labels |
| `--color-text-secondary` | `#4B5563` | Slate Grey | Sub-labels, helper text, table column headers, metadata |
| `--color-brand-primary` | `#000675` | Deep Royal Navy | Navigation accents, primary action button fills, structural highlights |
| `--color-brand-active` | `#00A4FF` | Electric Azure | Metric trajectory lines, active progress indicators, critical status alerts |
| `--color-brand-accent` | `#00E7F8` | Ice Teal / Aqua | Low-weight accent highlights, secondary telemetry indicators |

### Spacing Grid (The 8px Enterprise Grid)
We strictly enforce a proportional spatial grid. No hardcoded or odd-number values are allowed.
- `4px` (`--space-xs`): Sub-label margins, badge padding vertical.
- `8px` (`--space-sm`): Badge padding horizontal, line-item spacing, icon-to-text gaps.
- `12px` (`--space-md`): List items, tight interactive components, small inputs.
- `16px` (`--space-lg`): Standard card internals, primary sidebar action spacing.
- `24px` (`--space-xl`): Standard container padding, grid gaps, header layout gutters.
- `32px` (`--space-xxl`): Page-level gutters, hero metric gaps, executive risk view margins.

### Typography Hierarchy (Linear & Notion Enterprise Style)
Use a clean sans-serif like **Inter**, **Outfit**, or **SF Pro Display** for optimal metric legibility.

- **App Titles / Massive Stats:** `36px` / `line-height: 1.1` / `font-weight: 600` / Color: `--color-text-primary` / `letter-spacing: -0.03em`
- **Section Headers (H1):** `24px` / `line-height: 1.2` / `font-weight: 600` / Color: `--color-text-primary` / `letter-spacing: -0.02em`
- **Sub-Section Headers (H2):** `18px` / `line-height: 1.3` / `font-weight: 500` / Color: `--color-text-primary`
- **Data Table Metrics:** `16px` / `line-height: 1.4` / `font-weight: 600` / Color: `--color-text-primary` (Monospace for numeric values recommended: `SFMono-Regular` or `JetBrains Mono`)
- **Body & Labels:** `14px` / `line-height: 1.5` / `font-weight: 400` / Color: `--color-text-secondary`
- **Micro-Labels & Captions:** `11px` / `line-height: 1.5` / `font-weight: 500` / Color: `--color-text-secondary` / `letter-spacing: 0.05em` / `text-transform: uppercase`

---

## 2. Layout System (Multi-Layer Workspace Framework)

The layout must mirror modern productivity suites (e.g., Linear, Notion Enterprise). It provides absolute workspace control with clean, silent boundaries, ensuring the user feels focused and in control.

```
+------------------------------------------------------------------------------------+
| SIDEBAR (Width: 260px)       | HEADER (Height: 64px)                               |
|                              | Search, breadcrumbs, user status, quick action      |
|                              +-----------------------------------------------------+
| Logo (RJT Nexus)             | MAIN WORKSPACE (Scrollable canvas, 80% white space)  |
|                              |                                                     |
| Primary Navigation           |  +-----------------------------------------------+  |
| - Risk Center                |  | PRIMARY METRIC HERO                           |  |
| - Knowledge base             |  | 3 large metrics side-by-side                  |  |
| - Operational continuity     |  +-----------------------------------------------+  |
| - Evidence ISO               |  |                                               |  |
|                              |  | +-----------------------+ +-----------------+ |  |
| Global Filters               |  | | WORKFORCE RISK        | | HEATMAP / GRID  | |  |
|                              |  | | Table of exposures    | | Talent concen-  | |  |
| User Profile Summary         |  | |                       | | tration matrix  | |  |
|                              |  | +-----------------------+ +-----------------+ |  |
|                              |  +-----------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

### Layout Specifications:
1. **Sidebar Navigation**:
   - Fixed width of `260px`. Background is pure white (`#FFFFFF`) or ultra-subtle grey (`#F8FAFC`).
   - Boundary: `1px solid rgba(4,4,74,0.06)` on the right. No heavy dark colors.
   - Text elements are lightweight and clean, with a small vertical tag indicating the active menu item.
2. **Main Workspace**:
   - Maximum width constrained to `1400px` for readability, centered with horizontal auto margins.
   - Generous outer padding of `32px` to give dashboard contents room to breathe.
3. **Workspace Headers**:
   - Flat design with zero drop shadows.
   - Clear breadcrumbs (e.g., `Workforce Risk` > `Overview`) in slate-grey typography next to active actions.

---

## 3. Card System (Flat-Canvas Panels)

Cards must look like containers of information, not separate floating boxes. They should integrate seamlessly into the white page.

### Card Anatomy Rules:
- **Background**: Pure `#FFFFFF`.
- **Border**: Precise `1px solid rgba(4,4,74,0.06)`.
- **Corner Radius**: `6px` or `8px` (strict maximum). Rounded gamified shapes (e.g., `16px` or `24px`) are prohibited.
- **Shadow**: Completely flat by default. Hover states can utilize an ultra-subtle shadow: `box-shadow: 0 1px 3px rgba(4,4,74,0.02), 0 8px 24px rgba(4,4,74,0.04)`.
- **Internal Spacing**: `24px` padding on all sides.
- **Header**: Separated by a thin divider line or just a large spacing gap. Title is always in `--color-text-primary` with a small font size (`14px` bold) and uppercase subtitle above it (`11px` letter-spaced slate grey).

---

## 4. Table System (High-Density Executive Grid)

Corporate workforce management requires clean data density. Our tables follow the **Notion/Linear** structural logic: high readability, low line weight, clear numeric alignment.

### Table Specifications:
- **Table Headers**:
  - Background is transparent or subtle (`#F8FAFC`).
  - Height of `40px`.
  - Typography: `11px` bold, `--color-text-secondary`, uppercase, letter-spacing `0.05em`.
  - Border: `1px solid rgba(4,4,74,0.06)` on the bottom.
- **Table Rows**:
  - Height of `56px` to allow cell breathing room.
  - Hover background: Solid `#F8FAFC` or subtle ice-teal hue (`rgba(0,231,248,0.03)`).
  - Borders: `1px solid rgba(4,4,74,0.04)` bottom-border only. Vertical borders are forbidden.
- **Numeric Values**:
  - Monospaced digits aligned to the right.
  - Directional green/red trend indicators are completely clean (no bright green pill backgrounds; instead use a small directional arrow and clean colored text).

---

## 5. Heatmap System (Scientific Risk Matrices)

Standard matrices use bright green, primary orange, and deep red. This cheapens the application. An executive heatmap uses a clean, high-contrast monochrome navy and cyan spectrum to represent severity.

### Heatmap Matrix Rules:
- **Zero Risk State**: Pure `#FFFFFF` background with a subtle dashed boundary.
- **Low Risk State**: `#F8FAFC` background with a tiny `--color-border-light` boundary.
- **Moderate Risk State**: Soft Ice Teal highlight (`rgba(0, 231, 248, 0.15)`) with deep slate text.
- **High Risk State**: Medium Azure highlight (`rgba(0, 164, 255, 0.25)`) with deep navy text.
- **Severe/Concentrated Risk State**: Midnight Navy background (`#04044A`) with pure white text (`#FFFFFF`) or intense Ice Teal text highlights.
- **Grid Layout**: Spacing of `4px` between matrix blocks. Hard borders inside blocks are avoided to let color intensity draw the eye.

---

## 6. Risk Visualization System (Precision Telemetry)

Data visualization must convey mathematical precision, not visual fluff.

### Chart Rules:
- **Lines**: Use clean, `1.5px` or `2px` thick solid lines in `#00A4FF` or `#000675`.
- **Fills**: If using filled charts, use a vertical gradient going from `rgba(0, 164, 255, 0.08)` at the top to `rgba(0, 164, 255, 0)` at the bottom. Avoid thick solid fills.
- **Data Points**: Avoid large circular points on every line intersection. Only show points on hover, or use small `3px` solid dots for critical alerts.
- **Grid Lines**: Thin, horizontal-only grid lines in `rgba(4,4,74,0.03)` (dashed, `3px` dash, `3px` gap).

---

## 7. Workforce Map Visual Concept

Rather than displaying a heavy organizational chart or a basic interactive graph, use a structured, modern layout for organizational mapping.

```
       [CORE ORGANIZATION: EXECUTIVE COMMITTEE]
                         │
        ┌────────────────┴────────────────┐
 [OPERATIONS]                       [TECHNOLOGY]
   (Cyan Accent: Active)              (Navy Accent: Stable)
        │                                 │
 ┌──────┴──────┐                   ┌──────┴──────┐
[Ops A]     [Ops B]             [Dev Ops]     [Core Eng]
 (Low Risk)  (High Risk)         (Critical)    (Vacant Role)
               └─[Mitigation Link]─┘
```

### Visual Architecture:
- **Node Styling**: Small, crisp white blocks with light grey borders (`1px solid rgba(4,4,74,0.06)`). Left border is colored according to department risk levels.
- **Connection Lines**: Right-angled orthogonal lines in slate grey (`rgba(4,4,74,0.15)`).
- **Risk Indicators**: Superimposed inline mini-badges indicating structural redundancy (e.g., `Successor Staged`, `Sole Dependency`).

---

## 8. Dashboard Redesign Blueprint (Structure Map)

The main dashboard is restructured to display executive risk, knowledge management, and continuity indicators, replacing the standard layout.

```
+------------------------------------------------------------------------------------+
| REDESIGN BLUEPRINT — CORE EXECUTIVE CONTROL DASHBOARD                             |
+------------------------------------------------------------------------------------+
|                                                                                    |
| [1. EXECUTIVE SUMMARY SECTION]                                                    |
| Large, spacious header: "Workforce Continuity & Risk Intelligence"                 |
| Subtitle: "Real-time key dependencies, successor readiness, and compliance audit" |
|                                                                                    |
| [2. PRIMARY HERO TELEMETRY (3 Columns - Generous 24px Gaps)]                       |
| +-------------------------+ +-------------------------+ +-------------------------+ |
| | GLOBAL RESILIENCE INDEX | | CRITICAL DEPENDENCIES   | | COMPLIANCE METRIC (ISO) | |
| | 94.2%                   | | 12 At Risk             | | 98.6%                   | |
| | (Trajectory: +1.4% MoM) | | (Mitigation active: 8)  | | (3 pending audits)      | |
| +-------------------------+ +-------------------------+ +-------------------------+ |
|                                                                                    |
| [3. HIGH-IMPACT RISK HEATMAP & KNOWLEDGE REDUNDANCY GRID]                           |
| +-----------------------------------------+ +-------------------------------------+ |
| | A. WORKFORCE RISK HEATMAP (60% Width)   | | B. KNOWLEDGE GAP MATRIX (40% Width) | |
| | Matrix showing structural risk by       | | List of critical functions lack-    | |
| | department and key talent tenure.       | | ing document redundancy or backups.  | |
| | (Minimalist matrix, monochrome navy)     | | (Notion-style simple list with dots)| |
| +-----------------------------------------+ +-------------------------------------+ |
|                                                                                    |
| [4. CRITICAL ACTION PIPELINE (100% Width)]                                        |
| +---------------------------------------------------------------------------------+ |
| | C. OPERATIONAL CONTINUITY WATCHLIST (High-density table)                        | |
| | Displays roles with high flight risk, lack of successors, or active vacancies.  | |
| | - Columns: Role, Key Person, Risk Score, Successor Status, Action Trigger       | |
| +---------------------------------------------------------------------------------+ |
|                                                                                    |
+------------------------------------------------------------------------------------+
```

---

## 9. Premium UI Rules (The Executive Standard)

1. **The 80% Rule**: At least 80% of the viewport's background must be variations of `#FFFFFF` and `#F8FAFC`. Pure dark themes or high-saturation panels are prohibited.
2. **Typography First**: Contrast is achieved through typography size and weight hierarchy, rather than multiple background colors or heavy borders.
3. **Ghost Borders over Drop Shadows**: Use hairline borders (`1px solid rgba(4,4,74,0.06)`) for separation. Drop shadows are allowed only on floating elements like dropdowns and modal dialogues.
4. **No Gamified Badges**: Status badges must be subtle text with a tiny matching dot next to them (e.g., `• Active` in cyan, `• At Risk` in blue), not heavy saturated colored capsules.
5. **Absolute Content Precision**: Keep charts, tables, and lists highly organized. Use standard alignments (numbers right-aligned, text left-aligned, labels top-aligned).

---

## 10. Components to Remove from Current UI

Based on the existing codebase (including `src/components` and `src/pages`), the following styles, concepts, and components must be replaced to align with the new design:

1. **`AnimatedCounter.tsx` (Current Styling)**:
   - *Issue*: Standard flashing or heavily animated numerical counters distract from executive data scanning.
   - *Refactor*: Replace with clean, instant-rendering high-weight monospaced numbers (`SFMono-Regular`).
2. **Heavy Colored Backgrounds in Cards (`src/pages/Dashboard.tsx` & `src/pages/Home.tsx`)**:
   - *Issue*: Any card with a dark navy background or colorful gradient container.
   - *Refactor*: Convert all dashboard cards to pure `#FFFFFF` canvas containers with thin border outlines.
3. **High-Saturation Warning Banners (`src/pages/RankingVulnerabilidade.tsx`)**:
   - *Issue*: Large red, yellow, or green banners or backgrounds highlighting team risk ratings.
   - *Refactor*: Use subtle typography weight, a small colored status dot, or hairline borders with light tinting (`rgba(0, 164, 255, 0.08)`).
4. **Custom Stylized Navigation Pills (`src/components/DashboardLayout.tsx`)**:
   - *Issue*: Heavy circular tab pills, neon active states, or highly styled sidebar hover effects.
   - *Refactor*: Implement a sleek Notion-style navigation list: flat text with a light tint hover effect (`rgba(4,4,74,0.03)`) and a simple vertical bar to indicate the active state.
5. **Gamified Icons and Visual Noise**:
   - *Issue*: 3D effects, heavy gradients, or icons with multiple colors inside charts or tables.
   - *Refactor*: Use lightweight, single-color outlines (`Lucide` icons preferred, styled with `#04044A` or `#4B5563`).

---

> [!NOTE]
> This design direction serves as the visual master document for the next development phase of **RJT Nexus People**. All future frontend changes must adhere to this system.

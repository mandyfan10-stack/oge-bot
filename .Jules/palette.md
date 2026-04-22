## 2024-05-24 - Icon-only button accessibility
**Learning:** Icon-only buttons (like those with Lucide icons for navigation, closing modals, or sending chat messages) are frequently missed in accessibility audits. Sighted users rely on the visual icon to understand the button's action, but screen readers require an `aria-label`. Furthermore, sighted keyboard users need a clear visual focus indicator, which was absent for these elements. Adding an explicit `title` provides a helpful native tooltip as a fallback for users who hover over the icon but are unsure of its meaning.
**Action:** When creating or modifying icon-only buttons, systematically add `aria-label` for screen readers, `title` for hover tooltips, and ensure clear focus indicators (e.g. `focus-visible:ring-2`) are present so keyboard navigation is seamless.

## 2024-05-24 - Custom navigation card keyboard accessibility
**Learning:** Custom interactive elements, like the `.glass-panel` buttons used for the main course and task lists, often lack native focus indicators. While they may have hover states, keyboard users are left without a clear visual cue of their current focus, breaking accessibility.
**Action:** When implementing custom cards or buttons that act as primary navigation, always explicitly add `focus-visible` styles (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]`) to ensure a robust and accessible keyboard navigation experience.

## 2026-04-21 - Dynamically Injected Feedback Accessibility
**Learning:** In a single-page application heavily relying on dynamic DOM updates for task validation feedback, sighted users see the newly appended message, but screen readers are unaware. Elements that appear asynchronously to provide crucial status information must have an `aria-live` region attribute to trigger screen reader announcements.
**Action:** Always add `aria-live="polite"` (or `assertive` for critical errors) to feedback containers, especially when they are dynamically appended or toggled visible, ensuring non-sighted users are promptly informed of their interaction results.

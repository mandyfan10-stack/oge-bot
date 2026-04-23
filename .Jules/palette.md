## 2024-05-24 - Icon-only button accessibility
**Learning:** Icon-only buttons (like those with Lucide icons for navigation, closing modals, or sending chat messages) are frequently missed in accessibility audits. Sighted users rely on the visual icon to understand the button's action, but screen readers require an `aria-label`. Furthermore, sighted keyboard users need a clear visual focus indicator, which was absent for these elements. Adding an explicit `title` provides a helpful native tooltip as a fallback for users who hover over the icon but are unsure of its meaning.
**Action:** When creating or modifying icon-only buttons, systematically add `aria-label` for screen readers, `title` for hover tooltips, and ensure clear focus indicators (e.g. `focus-visible:ring-2`) are present so keyboard navigation is seamless.

## 2024-05-24 - Custom navigation card keyboard accessibility
**Learning:** Custom interactive elements, like the `.glass-panel` buttons used for the main course and task lists, often lack native focus indicators. While they may have hover states, keyboard users are left without a clear visual cue of their current focus, breaking accessibility.
**Action:** When implementing custom cards or buttons that act as primary navigation, always explicitly add `focus-visible` styles (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]`) to ensure a robust and accessible keyboard navigation experience.

## 2026-04-21 - Dynamically Injected Feedback Accessibility
**Learning:** In a single-page application heavily relying on dynamic DOM updates for task validation feedback, sighted users see the newly appended message, but screen readers are unaware. Elements that appear asynchronously to provide crucial status information must have an `aria-live` region attribute to trigger screen reader announcements.
**Action:** Always add `aria-live="polite"` (or `assertive` for critical errors) to feedback containers, especially when they are dynamically appended or toggled visible, ensuring non-sighted users are promptly informed of their interaction results.

## 2026-04-22 - Single-Page App Dynamic Form Accessibility
**Learning:** In SPAs where forms are dynamically rendered and not enclosed in a native `<form>` tag, inputs lose their native "Enter to submit" behavior. Sighted users can click the submit button, but keyboard users are left stranded after typing their input, reducing accessibility and causing friction. Furthermore, dynamic inputs without visible labels require an `aria-label` matching their placeholder for screen readers.
**Action:** When working without native `<form>` tags, always programmatically bind the 'Enter' key on inputs to trigger the main action button (e.g., via `e.key === 'Enter'`). Concurrently, ensure inputs use their `placeholder` text as an `aria-label` if a semantic `<label>` is missing, and explicitly apply `focus-visible` styles to dynamically generated custom buttons.

## 2024-04-24 - Loading states for async action buttons
**Learning:** For async submission buttons (like sending AI chat messages) that might take a long time and temporarily disable interactions, simply dimming the button (`opacity-50`) is not sufficient. A loading spinner provides much better UX by indicating that an operation is actively in progress. This keeps the user informed and prevents them from thinking the UI has frozen.
**Action:** Replace the icon of the button with a spinning loader (`loader-2` with `animate-spin` in Lucide/Tailwind) during the async operation, and restore the original icon in a `finally` block when done. Keep the button opaque to ensure the spinner is visible.

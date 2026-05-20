/**
 * Thin wrapper around window.Telegram.WebApp so the rest of the app
 * doesn't need to know whether it's running inside Telegram.
 *
 * All exports are safe to call from any environment — they no-op
 * (with a debug log) when the WebApp object isn't present.
 */

function tg() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
}

export function initTelegram({ headerColor, backgroundColor } = {}) {
  const wa = tg();
  if (!wa) return;
  try { wa.ready?.(); } catch (err) { console.debug('[telegram] ready failed:', err); }
  try { wa.expand?.(); } catch (err) { console.debug('[telegram] expand failed:', err); }
  try { if (headerColor)     wa.headerColor     = headerColor; }     catch (err) { console.debug('[telegram] headerColor failed:', err); }
  try { if (backgroundColor) wa.backgroundColor = backgroundColor; } catch (err) { console.debug('[telegram] backgroundColor failed:', err); }
}

export function getInitData() {
  return tg()?.initData ?? '';
}

export function hapticSuccess() {
  try { tg()?.HapticFeedback?.notificationOccurred('success'); }
  catch (err) { console.debug('[telegram] haptic success failed:', err); }
}

export function hapticError() {
  try { tg()?.HapticFeedback?.notificationOccurred('error'); }
  catch (err) { console.debug('[telegram] haptic error failed:', err); }
}

export function getTelegramTheme() {
  const wa = tg();
  return {
    colorScheme: wa?.colorScheme ?? 'light',
    themeParams: wa?.themeParams ?? {},
  };
}

export function getUserId() {
  try {
    const initData = tg()?.initData ?? '';
    if (!initData) return null;
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user') ?? 'null');
    return user?.id ? String(user.id) : null;
  } catch {
    return null;
  }
}

export function onThemeChanged(callback) {
  try {
    tg()?.onEvent?.('themeChanged', callback);
    return () => tg()?.offEvent?.('themeChanged', callback);
  } catch {
    return () => {};
  }
}

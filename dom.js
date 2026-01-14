//
//
// Functions for inside browser environment
//
//

const isFirefox = !!window.InternalError;

const isChromeApp = () => !!chrome.runtime.id;

const clearCookies = document.cookie.split(';').forEach(cookie => document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)
      );

const copyToClipboard = (text) => navigator.clipboard.writeText(text);

// alternative to the above
const copyTextToClipboard = async (text) => await navigator.clipboard.writeText(text);

// get dark mode
const darkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Fast 3G is around 1.35, 5 is ok, 10 is good
const getNetworkSpeed = () => navigator.connection.downlink;

const getSelectedTxt = () => window.getSelection().toString();

const isAppleDevice = () => /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const isTabInView = () => !document.hidden; // Not hidden

// Scroll to top of page
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// Scroll to bottom of page
const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

// Scroll to top of an element
const scrollToEl = (el) => el.scrollIntoView({ behavior: "smooth", block: "start" });

// Scroll to elements bottom
const scrollToElbottom = (el) => el.scrollIntoView({ behavior: "smooth", block: "end" });

const hasScrolledToBottom = () => document.documentElement.clientHeight + window.scrollY >= document.documentElement.scrollHeight

// Check if an element is focused
const isFocus = el => el == document.activeElemnt;

const toggleElement = element => element.style.display = (element.style.display === "none" ? "block" : "none")

const urlRedirect = url => location.href = url;

const stripHtml = html => (new DOMParser().parseFromString(html, 'text/html')).body.textContent || ''



/**
 * Fast, in-place DOM diffing with innerHTML fallback.
 * 
 * @param {Node} c - Current DOM node (to be updated)
 * @param {Node} t - Target DOM node (source of truth)
 * @returns {boolean} - Success status
 */
const domDiff = (c, t) => {
  try {
    // 1. Tag/Type mismatch: Replace entirely
    if (c.nodeType !== t.nodeType || c.tagName !== t.tagName) {
      c.replaceWith(t.cloneNode(true));
      return true;
    }

    // 2. Text/Comment nodes: Update content
    if (c.nodeType === 3 || c.nodeType === 8) {
      if (c.textContent !== t.textContent) c.textContent = t.textContent;
      return true;
    }

    // 3. Diff Attributes
    const ca = c.attributes, ta = t.attributes;
    for (let i = ca.length - 1; i >= 0; i--) {
      const n = ca[i].name;
      if (!t.hasAttribute(n)) c.removeAttribute(n);
    }
    for (let i = 0; i < ta.length; i++) {
      const { name: n, value: v } = ta[i];
      if (c.getAttribute(n) !== v) c.setAttribute(n, v);
    }

    // 4. Diff Children
    const cc = Array.from(c.childNodes), tc = Array.from(t.childNodes);
    const ml = Math.max(cc.length, tc.length);

    for (let i = 0; i < ml; i++) {
      if (!cc[i]) c.appendChild(tc[i].cloneNode(true));
      else if (!tc[i]) cc[i].remove();
      else domDiff(cc[i], tc[i]);
    }

    return true;
  } catch (e) {
    // 5. Fallback: If diffing fails (e.g. protected DOM or restricted writes), use innerHTML
    try {
      c.innerHTML = t.innerHTML;
      return true;
    } catch (err) {
      return false;
    }
  }
};

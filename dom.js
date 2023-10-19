//
//
// Functions for inside browser environment
//
//

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


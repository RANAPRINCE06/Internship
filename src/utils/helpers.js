/**
 * Copies a given text to the clipboard.
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
};

/**
 * Downloads a string content as a TXT file in the browser.
 * @param {string} text 
 * @param {string} filename 
 */
export const downloadAsTxt = (text, filename = "translation.txt") => {
  if (!text) return;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formats a Date timestamp to a readable string (e.g., "Jun 5, 2026 at 8:15 AM").
 * @param {number|string|Date} timestamp 
 * @returns {string}
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Unknown Date";

  const optionsDate = { month: 'short', day: 'numeric', year: 'numeric' };
  const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };
  
  return `${date.toLocaleDateString(undefined, optionsDate)} at ${date.toLocaleTimeString(undefined, optionsTime)}`;
};

/**
 * Strips HTML tags from text
 * @param {string} str 
 * @returns {string}
 */
export const stripHtml = (str) => {
  if (!str) return "";
  return str.replace(/<\/?[^>]+(>|$)/g, "");
};

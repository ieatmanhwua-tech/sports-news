export function useFormatters() {
  /**
   * Format ISO UTC string into readable Manila time string
   */
  function formatManilaTime(isoUtcString: string): string {
    if (!isoUtcString) return '';
    try {
      const date = new Date(isoUtcString);
      return new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date) + ' PHT';
    } catch {
      return isoUtcString;
    }
  }

  /**
   * Format date only in Manila time
   */
  function formatManilaDate(isoUtcString: string): string {
    if (!isoUtcString) return '';
    try {
      const date = new Date(isoUtcString);
      return new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return isoUtcString;
    }
  }

  /**
   * Relative time string (e.g. "30 mins ago", "2 hours ago", "Yesterday")
   */
  function formatRelativeTime(isoUtcString: string): string {
    if (!isoUtcString) return '';
    try {
      const then = new Date(isoUtcString).getTime();
      const now = Date.now();
      const diffSecs = Math.floor((now - then) / 1000);

      if (diffSecs < 60) return 'Just now';
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      if (diffSecs < 172800) return 'Yesterday';
      return formatManilaDate(isoUtcString);
    } catch {
      return isoUtcString;
    }
  }

  return {
    formatManilaTime,
    formatManilaDate,
    formatRelativeTime
  };
}

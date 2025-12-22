// Utility functions

/**
 * Groups comments by attemptId for easy lookup
 */
export function groupCommentsByAttempt<T extends { attemptId: string }>(
  comments: T[]
): Record<string, T[]> {
  return comments.reduce((acc, comment) => {
    if (!acc[comment.attemptId]) {
      acc[comment.attemptId] = [];
    }
    acc[comment.attemptId].push(comment);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Detects if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  const windowWithOpera = window as typeof window & { opera?: string };
  const userAgent = navigator.userAgent || navigator.vendor || windowWithOpera.opera || "";
  
  // Check for mobile device patterns in user agent
  // Note: This is a simple check that covers most common mobile devices
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

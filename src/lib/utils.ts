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
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera;
  
  // Check for mobile device patterns in user agent
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

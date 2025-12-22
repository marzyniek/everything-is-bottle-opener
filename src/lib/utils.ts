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

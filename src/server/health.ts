export function shouldExposeHealthDetails() {
  return process.env.HEALTH_DEBUG === "true";
}

export function publicHealthError(message: string) {
  return shouldExposeHealthDetails() ? message : "Health check failed.";
}

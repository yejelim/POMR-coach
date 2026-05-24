export function serializeError(error: unknown) {
  if (!(error instanceof Error)) return { error };

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: "code" in error ? error.code : undefined,
    status: "status" in error ? error.status : undefined,
    clientVersion: "clientVersion" in error ? error.clientVersion : undefined,
  };
}


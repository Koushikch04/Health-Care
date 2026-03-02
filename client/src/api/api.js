const baseURL = import.meta.env.VITE_BACKEND || "http://localhost:8000";
const DEFAULT_REQUEST_TIMEOUT_MS = 12000;

class RequestTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "RequestTimeoutError";
  }
}

const safeParseJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

const fetchWithTimeout = async (
  resource,
  options = {},
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
) => {
  const timeoutController = new AbortController();
  const { signal, ...restOptions } = options;

  if (signal) {
    if (signal.aborted) {
      timeoutController.abort();
    } else {
      signal.addEventListener("abort", () => timeoutController.abort(), {
        once: true,
      });
    }
  }

  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, timeoutMs);

  try {
    return await fetch(resource, {
      ...restOptions,
      signal: timeoutController.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError" && !signal?.aborted) {
      throw new RequestTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchJson = async (
  resource,
  options = {},
  { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, errorMessage } = {},
) => {
  const response = await fetchWithTimeout(resource, options, timeoutMs);

  if (!response.ok) {
    const data = await safeParseJson(response);
    const message =
      data?.msg || data?.message || data?.error || errorMessage || "Request failed";
    throw new Error(message);
  }

  return safeParseJson(response);
};

export { baseURL, DEFAULT_REQUEST_TIMEOUT_MS, fetchWithTimeout, fetchJson };

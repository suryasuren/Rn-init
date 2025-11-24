type AxiosLikeError = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  );
}

export const extractErrorMessage = (err: unknown): string => {
  // JS Error object
  if (err instanceof Error && typeof err.message === "string") {
    return err.message;
  }

  // axios-like error object
  if (isAxiosLikeError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim().length > 0) {
      return msg;
    }
  }

  // string thrown directly
  if (typeof err === "string" && err.trim().length > 0) {
    return err;
  }

  return "Unable to load movie list";
};


export function formatDisplayDate(d?: string | null) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return `${parts[2]}-${parts[1]}-${parts[0]}`; // dd-mm-yyyy
}

export function parseDisplayDateToIso(display?: string | null) {
  if (!display) return null;
  const parts = display.split('-');
  if (parts.length !== 3) return display;
  return `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-mm-dd
}
// Centralized response handler for extracting messages from API responses
// This ensures all messages (success and error) from BE are displayed consistently across the app

/**
 * Extracts success message from API response
 * @param response - The response object from API
 * @returns Success message string or null if not found
 */
export function extractSuccessMessage(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const resObj = response as Record<string, unknown>;

  // Check common success message fields
  if (typeof resObj.message === 'string' && resObj.message) {
    return resObj.message;
  }

  if (typeof resObj.successMessage === 'string' && resObj.successMessage) {
    return resObj.successMessage;
  }

  if (typeof resObj.msg === 'string' && resObj.msg) {
    return resObj.msg;
  }

  return null;
}

/**
 * Extracts error message from various backend response formats
 * @param error - The error object (usually from fetch or axios)
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown): string {
  // If it's already an Error with a message, use it
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an object with common error fields
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;

    // Check common error message fields from BE
    if (typeof errObj.message === 'string' && errObj.message) {
      return errObj.message;
    }

    if (typeof errObj.error === 'string' && errObj.error) {
      return errObj.error;
    }

    if (typeof errObj.errorMessage === 'string' && errObj.errorMessage) {
      return errObj.errorMessage;
    }

    // Handle validation errors array
    if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
      const firstError = errObj.errors[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
      if (typeof firstError === 'object' && firstError && 'message' in firstError) {
        const msg = (firstError as { message?: unknown }).message;
        if (typeof msg === 'string') {
          return msg;
        }
      }
    }

    // If response has a status code, include it
    if (typeof errObj.status === 'number') {
      return `Lỗi từ server (status: ${errObj.status})`;
    }
  }

  // Fallback for unknown error types
  if (typeof error === 'string') {
    return error;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
}

/**
 * Parse error response from fetch API
 * @param response - The fetch Response object
 * @returns Error message extracted from response
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  const text = await response.text().catch(() => '');
  let message = `HTTP error! status: ${response.status}`;

  try {
    const parsed = text ? JSON.parse(text) : undefined;
    if (parsed && typeof parsed === 'object') {
      const errObj = parsed as Record<string, unknown>;

      // Check common error message fields
      if (typeof errObj.message === 'string' && errObj.message) {
        message = errObj.message;
      } else if (typeof errObj.error === 'string' && errObj.error) {
        message = errObj.error;
      } else if (typeof errObj.errorMessage === 'string' && errObj.errorMessage) {
        message = errObj.errorMessage;
      } else if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
        const firstError = errObj.errors[0];
        if (typeof firstError === 'string') {
          message = firstError;
        } else if (typeof firstError === 'object' && firstError && 'message' in firstError) {
          const msg = (firstError as { message?: unknown }).message;
          if (typeof msg === 'string') {
            message = msg;
          }
        }
      }
    }
  } catch (e) {
    // If JSON parsing fails, use the default message
  }

  return message;
}

/**
 * Create a standardized Error object with message from BE
 * @param response - The fetch Response object
 * @returns Error object with extracted message
 */
export async function createErrorFromResponse(response: Response): Promise<Error> {
  const message = await parseErrorResponse(response);
  return new Error(message);
}

/**
 * Helper to show toast with message from API response
 * Automatically extracts and displays success or error messages
 * @param response - API response object
 * @param toast - Toast function from useToast hook
 * @param defaultSuccessMessage - Default message if no message in response
 */
export function showApiResponseToast(
  response: unknown,
  toast: (options: { title?: string; description: string; variant?: 'default' | 'destructive' }) => void,
  defaultSuccessMessage = 'Thao tác thành công'
): void {
  const message = extractSuccessMessage(response);
  toast({
    title: 'Thành công',
    description: message || defaultSuccessMessage,
  });
}

/**
 * Helper to show toast with error message
 * @param error - Error object
 * @param toast - Toast function from useToast hook
 * @param defaultErrorMessage - Default message if no message extracted
 */
export function showApiErrorToast(
  error: unknown,
  toast: (options: { title?: string; description: string; variant?: 'default' | 'destructive' }) => void,
  defaultErrorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.'
): void {
  const message = extractErrorMessage(error);
  toast({
    title: 'Lỗi',
    description: message || defaultErrorMessage,
    variant: 'destructive',
  });
}


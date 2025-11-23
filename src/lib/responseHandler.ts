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

  // If response body is empty, return default message
  if (!text || text.trim() === '') {
    return message;
  }

  try {
    const parsed = text ? JSON.parse(text) : undefined;
    if (parsed && typeof parsed === 'object') {
      const errObj = parsed as Record<string, unknown>;

      // Check common error message fields in order of preference
      if (typeof errObj.message === 'string' && errObj.message.trim()) {
        message = errObj.message.trim();
      } else if (typeof errObj.error === 'string' && errObj.error.trim()) {
        message = errObj.error.trim();
      } else if (typeof errObj.errorMessage === 'string' && errObj.errorMessage.trim()) {
        message = errObj.errorMessage.trim();
      } else if (typeof errObj.detail === 'string' && errObj.detail.trim()) {
        // Spring Boot often uses 'detail' field
        message = errObj.detail.trim();
      } else if (typeof errObj.title === 'string' && errObj.title.trim()) {
        // Spring Boot often uses 'title' field
        message = errObj.title.trim();
      } else if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
        // Handle validation errors array
        const firstError = errObj.errors[0];
        if (typeof firstError === 'string' && firstError.trim()) {
          message = firstError.trim();
        } else if (typeof firstError === 'object' && firstError && 'message' in firstError) {
          const msg = (firstError as { message?: unknown }).message;
          if (typeof msg === 'string' && msg.trim()) {
            message = msg.trim();
          }
        } else if (typeof firstError === 'object' && firstError && 'defaultMessage' in firstError) {
          // Spring validation errors often use 'defaultMessage'
          const msg = (firstError as { defaultMessage?: unknown }).defaultMessage;
          if (typeof msg === 'string' && msg.trim()) {
            message = msg.trim();
          }
        }
      } else if (typeof errObj.path === 'string' && typeof errObj.timestamp === 'string') {
        // Some APIs return structured error with path and timestamp
        // If we have these but no message, keep the default
      }
    } else if (typeof parsed === 'string' && parsed.trim()) {
      // Sometimes backend returns plain string
      message = parsed.trim();
    }
  } catch (e) {
    // If JSON parsing fails but we have text, try to use it as message
    if (text && text.trim() && text.length < 500) {
      // Only use text if it's reasonable length (not HTML error page)
      message = text.trim();
    }
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
 * @param defaultErrorMessage - Default message if no message extracted. If undefined, will use extracted message even if it's generic.
 */
export function showApiErrorToast(
  error: unknown,
  toast: (options: { title?: string; description: string; variant?: 'default' | 'destructive' }) => void,
  defaultErrorMessage?: string
): void {
  const message = extractErrorMessage(error);
  // If message is just "HTTP error! status: XXX" and we have a default, use default
  // Otherwise, use the extracted message (which might be from backend)
  const isGenericMessage = message.startsWith('HTTP error! status:');
  const finalMessage = (isGenericMessage && defaultErrorMessage)
    ? defaultErrorMessage
    : (message || defaultErrorMessage || 'Đã xảy ra lỗi. Vui lòng thử lại.');

  toast({
    title: 'Lỗi',
    description: finalMessage,
    variant: 'destructive',
  });
}

/**
 * Helper to show friendly authentication error toast (for 401/403)
 * Uses default variant instead of destructive for better UX
 * @param error - Error object
 * @param toast - Toast function from useToast hook
 * @param defaultMessage - Default friendly message if no message extracted (optional, will auto-detect based on status)
 */
export function showAuthErrorToast(
  error: unknown,
  toast: (options: { title?: string; description: string; variant?: 'default' | 'destructive' }) => void,
  defaultMessage?: string
): void {
  const message = extractErrorMessage(error);
  // Check if message is from backend (not just "HTTP error! status: XXX")
  const isBackendMessage = message && !message.startsWith('HTTP error! status:');

  // Determine if it's 401 or 403 from the message
  const is401 = message.includes('status: 401') || message.includes('401');
  const is403 = message.includes('status: 403') || message.includes('403');

  // Use backend message if available, otherwise use friendly default based on status
  let finalMessage: string;
  if (isBackendMessage) {
    finalMessage = message;
  } else if (defaultMessage) {
    finalMessage = defaultMessage;
  } else if (is403) {
    finalMessage = 'Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.';
  } else {
    // Default to 401 message
    finalMessage = 'Bạn đã hết thời gian đăng nhập. Vui lòng đăng nhập lại.';
  }

  toast({
    title: 'Thông báo',
    description: finalMessage,
    variant: 'default', // Use default variant instead of destructive for better UX
  });
}


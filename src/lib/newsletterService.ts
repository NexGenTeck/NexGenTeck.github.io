import { supabase } from './supabase';

export type NewsletterResult =
  | { success: true; isDuplicate: false; message: string }
  | { success: false; isDuplicate: true; message: string }
  | { success: false; isDuplicate: false; message: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 150;

const MESSAGES = {
  success: 'Thank you! You have successfully subscribed to the NexGenTeck Newsletter.',
  duplicate: 'This email is already subscribed.',
  invalidFormat: 'Please enter a valid email address.',
  tooLong: 'Email address is too long.',
  networkError: 'Network error. Please check your connection and try again.',
  serverError: 'Something went wrong. Please try again later.',
} as const;

export async function subscribeToNewsletter(rawEmail: string): Promise<NewsletterResult> {
  const email = rawEmail.trim().toLowerCase();

  // Frontend validation to prevent unnecessary Edge Function calls
  if (!email) {
    return { success: false, isDuplicate: false, message: MESSAGES.invalidFormat };
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return { success: false, isDuplicate: false, message: MESSAGES.tooLong };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, isDuplicate: false, message: MESSAGES.invalidFormat };
  }

  try {
    // Invoke the secure Edge Function directly
    const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
      body: { email },
    });

    if (error) {
      console.error('[newsletter] Edge Function error:', error);
      
      // Handle known HTTP statuses returned by the function
      if (error.status === 409) {
        return { success: false, isDuplicate: true, message: MESSAGES.duplicate };
      }
      if (error.status === 400) {
        return { success: false, isDuplicate: false, message: MESSAGES.invalidFormat };
      }
      return { success: false, isDuplicate: false, message: MESSAGES.serverError };
    }

    // Edge Function returns json directly in data
    if (data && data.success) {
      return { success: true, isDuplicate: false, message: data.message || MESSAGES.success };
    }

    if (data && data.isDuplicate) {
      return { success: false, isDuplicate: true, message: data.error || MESSAGES.duplicate };
    }

    return { success: false, isDuplicate: false, message: data?.error || MESSAGES.serverError };

  } catch (err) {
    console.error('[newsletter] Invocation network error:', err);
    return { success: false, isDuplicate: false, message: MESSAGES.networkError };
  }
}

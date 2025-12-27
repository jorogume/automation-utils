// Input validation and fallback email handler
// Validates email format and returns fallback email if needed

let inputConfig = input.config();

// Get inputs
let emailToValidate = inputConfig.emailToValidate || '';
let fallbackEmail = inputConfig.fallbackEmail || '';
let fallbackMessage = inputConfig.fallbackMessage || 'You are receiving this message because the original recipient\'s email address was invalid or unavailable.';

// Email validation regex (RFC 5322 simplified)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Trim whitespace from email
let cleanEmail = emailToValidate.trim();

// Validate email
let isValid = emailRegex.test(cleanEmail);

// Determine final email and message
let finalEmail = isValid ? cleanEmail : (fallbackEmail || ''); // Return empty string if no fallback
let notificationMessage = isValid ? '' : (fallbackEmail ? fallbackMessage : ''); // Only show message if there's a fallback

// Return outputs
output.set('valid', isValid);
output.set('email', finalEmail);
output.set('message', notificationMessage);

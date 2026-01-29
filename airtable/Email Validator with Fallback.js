let config = input.config();
let emailInput = config.emailInput;
let fallbackEmail = config.fallbackEmail;

// Email validation regex (basic but practical)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Normalize if emailInput comes as array
let inputEmail = Array.isArray(emailInput) ? (emailInput[0] ?? '') : (emailInput ?? '');

// Trim whitespace
inputEmail = inputEmail.trim();

// Validate: use fallback if empty OR invalid email format
let validatedEmail = (!inputEmail || !emailRegex.test(inputEmail)) 
    ? fallbackEmail 
    : inputEmail;

output.set('validatedEmail', validatedEmail);

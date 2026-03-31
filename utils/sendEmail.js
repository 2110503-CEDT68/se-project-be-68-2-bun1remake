const nodemailer = require('nodemailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_TIMEOUT_MS = 10000;

function normalizeEnvValue(name) {
  return String(process.env[name] ?? '').trim();
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

function parseTimeoutMs(name, defaultValue) {
  const rawValue = normalizeEnvValue(name);

  if (!rawValue) {
    return defaultValue;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsedValue;
}

function isProductionLikeRuntime() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

function resolveEmailConfig() {
  const config = {
    user: normalizeEnvValue('EMAIL_USER').toLowerCase(),
    pass: normalizeEnvValue('EMAIL_PASS'),
    from: normalizeEnvValue('EMAIL_FROM').toLowerCase(),
    fromName: normalizeEnvValue('EMAIL_FROM_NAME') || 'Hotel Booking',
    connectionTimeout: parseTimeoutMs('EMAIL_CONNECTION_TIMEOUT_MS', DEFAULT_TIMEOUT_MS),
    greetingTimeout: parseTimeoutMs('EMAIL_GREETING_TIMEOUT_MS', DEFAULT_TIMEOUT_MS),
    socketTimeout: parseTimeoutMs('EMAIL_SOCKET_TIMEOUT_MS', DEFAULT_TIMEOUT_MS)
  };

  const problems = [];

  if (!config.user) {
    problems.push('EMAIL_USER is required.');
  } else if (!isValidEmail(config.user)) {
    problems.push('EMAIL_USER must be a valid email address.');
  }

  if (!config.pass) {
    problems.push('EMAIL_PASS is required.');
  }

  if (!config.from) {
    problems.push('EMAIL_FROM is required.');
  } else if (!isValidEmail(config.from)) {
    problems.push('EMAIL_FROM must be a valid email address.');
  }

  if (problems.length > 0 && isProductionLikeRuntime()) {
    throw new Error(`Email configuration invalid: ${problems.join(' ')}`);
  }

  if (problems.length > 0) {
    console.warn('[mail] Email configuration warnings:', problems.join(' '));
  }

  return config;
}

function maskEmail(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const [localPart, domain] = normalizedEmail.split('@');

  if (!localPart || !domain) {
    return 'unknown';
  }

  const prefix = localPart.slice(0, 2);
  return `${prefix}***@${domain}`;
}

function serializeEmailError(error) {
  return {
    name: error?.name || 'Error',
    code: error?.code ?? null,
    responseCode: error?.responseCode ?? null,
    command: error?.command ?? null,
    message: error?.message || 'Unknown email error'
  };
}

const emailConfig = resolveEmailConfig();

if (
  emailConfig.from &&
  emailConfig.user &&
  emailConfig.from !== emailConfig.user
) {
  console.warn(
    `[mail] EMAIL_FROM (${emailConfig.from}) differs from EMAIL_USER. Using EMAIL_USER for Gmail sender consistency.`
  );
}

const senderAddress = emailConfig.user || emailConfig.from || 'no-reply@example.com';
const senderDisplayName = emailConfig.fromName.replace(/"/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  },
  connectionTimeout: emailConfig.connectionTimeout,
  greetingTimeout: emailConfig.greetingTimeout,
  socketTimeout: emailConfig.socketTimeout
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML supported)
 */
const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: `"${senderDisplayName}" <${senderAddress}>`,
    to,
    subject,
    html
  };

  return transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log(
        '[mail] send success',
        JSON.stringify({
          event: 'mail_send_success',
          to: maskEmail(to),
          messageId: info?.messageId || null
        })
      );
      return info;
    })
    .catch((error) => {
      console.error(
        '[mail] send failure',
        JSON.stringify({
          event: 'mail_send_failed',
          to: maskEmail(to),
          error: serializeEmailError(error)
        })
      );
      throw error;
    });
};

module.exports = sendEmail;

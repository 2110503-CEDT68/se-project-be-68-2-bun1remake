const crypto = require('crypto');

function parsePositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function getOtpConfig() {
  return {
    secret: process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp-secret-dev',
    expireMinutes: parsePositiveInteger(process.env.OTP_EXPIRE_MINUTES, 10),
    resendCooldownSeconds: parsePositiveInteger(
      process.env.OTP_RESEND_COOLDOWN_SECONDS,
      60
    ),
    maxAttempts: parsePositiveInteger(process.env.OTP_MAX_ATTEMPTS, 5)
  };
}

function generateOtpCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
}

function normalizeOtpValue(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

function hashOtpCode(value) {
  const { secret } = getOtpConfig();

  return crypto
    .createHmac('sha256', secret)
    .update(String(value))
    .digest('hex');
}

function getOtpExpiryDate(now = new Date()) {
  const expiresAt = new Date(now);
  expiresAt.setMinutes(expiresAt.getMinutes() + getOtpConfig().expireMinutes);
  return expiresAt;
}

function getOtpResendAvailableDate(now = new Date()) {
  const resendAvailableAt = new Date(now);
  resendAvailableAt.setSeconds(
    resendAvailableAt.getSeconds() + getOtpConfig().resendCooldownSeconds
  );
  return resendAvailableAt;
}

module.exports = {
  generateOtpCode,
  getOtpConfig,
  getOtpExpiryDate,
  getOtpResendAvailableDate,
  hashOtpCode,
  normalizeOtpValue
};

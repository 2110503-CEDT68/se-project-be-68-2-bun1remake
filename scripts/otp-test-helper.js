const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '..', 'config', 'config.env'),
  quiet: true
});

const User = require('../models/User');
const { hashOtpCode } = require('../utils/otp');

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);

  if (index === -1 || index === process.argv.length - 1) {
    return null;
  }

  return process.argv[index + 1];
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

async function connectToDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI);
}

async function setOtpState() {
  const email = normalizeEmail(getArgValue('--email'));
  const otp = String(getArgValue('--otp') || '');
  const expiresInSeconds = Number.parseInt(getArgValue('--expire-seconds') || '300', 10);
  const cooldownSeconds = Number.parseInt(getArgValue('--cooldown-seconds') || '0', 10);
  const attempts = Number.parseInt(getArgValue('--attempts') || '0', 10);

  if (!email || !otp) {
    throw new Error('set-otp requires --email and --otp');
  }

  const user = await User.findOne({ email }).select(
    '+currentToken +otpCodeHash +otpExpiresAt +otpResendAvailableAt +otpAttemptCount'
  );

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  user.isVerified = false;
  user.currentToken = null;
  user.otpVerifiedAt = null;
  user.otpCodeHash = hashOtpCode(otp);
  user.otpExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  user.otpResendAvailableAt = new Date(Date.now() + cooldownSeconds * 1000);
  user.otpAttemptCount = attempts;

  await user.save({ validateBeforeSave: false });

  return {
    action: 'set-otp',
    email: user.email,
    otp: otp,
    otpExpiresAt: user.otpExpiresAt.toISOString(),
    otpResendAvailableAt: user.otpResendAvailableAt.toISOString(),
    otpAttemptCount: user.otpAttemptCount
  };
}

async function deleteUser() {
  const email = normalizeEmail(getArgValue('--email'));

  if (!email) {
    throw new Error('delete-user requires --email');
  }

  const result = await User.deleteOne({ email });

  return {
    action: 'delete-user',
    email,
    deletedCount: result.deletedCount
  };
}

async function main() {
  const action = process.argv[2];

  if (!action) {
    throw new Error('Missing action. Use set-otp or delete-user.');
  }

  await connectToDatabase();

  let result;

  if (action === 'set-otp') {
    result = await setOtpState();
  } else if (action === 'delete-user') {
    result = await deleteUser();
  } else {
    throw new Error(`Unknown action: ${action}`);
  }

  console.log(JSON.stringify(result));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => null);
  });

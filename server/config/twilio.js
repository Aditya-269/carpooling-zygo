// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Validate phone number format (E.164)
const isValidPhoneNumber = (number) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(number.replace(/\s+/g, ''));
};

// Create mock client when credentials are missing
const mockClient = {
  messages: {
    create: async () => {
      console.warn('⚠️ SMS sending attempted but Twilio is not configured.');
      return { status: 'mock', sid: 'mock-sid' };
    }
  }
};

// Try initializing Twilio client
let realClient = null;
let twilioInitError = null;

if (accountSid && authToken && twilioPhoneNumber) {
  try {
    realClient = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized successfully');
  } catch (error) {
    twilioInitError = error;
    console.error('❌ Failed to initialize Twilio client:', error.message);
  }
} else {
  console.error('❌ Missing Twilio credentials:', {
    TWILIO_ACCOUNT_SID: !!accountSid,
    TWILIO_AUTH_TOKEN: !!authToken,
    TWILIO_PHONE_NUMBER: !!twilioPhoneNumber
  });
  console.warn('⚠️ SMS functionality is disabled - using mock client');
}

const client = realClient || mockClient;

// Send SMS function
export const sendSMS = async (to, message) => {
  if (!to || !message) {
    throw new Error('Phone number and message are required.');
  }

  const cleanedPhoneNumber = to.replace(/\s+/g, '');
  if (!isValidPhoneNumber(cleanedPhoneNumber)) {
    throw new Error('Invalid phone number format. Must be E.164 format (e.g., +1234567890)');
  }

  if (twilioInitError) {
    throw new Error(`Twilio initialization failed: ${twilioInitError.message}`);
  }

  if (!realClient) {
    console.warn('⚠️ SMS sending attempted but Twilio is not properly configured.');
    return { status: 'mock', sid: 'mock-sid' };
  }

  try {
    console.log('📤 Sending SMS:', {
      to: cleanedPhoneNumber,
      from: twilioPhoneNumber,
      messageLength: message.length
    });

    const result = await realClient.messages.create({
      body: message,
      to: cleanedPhoneNumber,
      from: twilioPhoneNumber
    });

    console.log('✅ SMS sent:', {
      sid: result.sid,
      status: result.status,
      to: result.to
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending SMS:', {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    });

    let enhancedError = new Error(error.message);

    // Friendly error messages based on Twilio codes
    switch (error.code) {
      case 21211:
        enhancedError.message = 'Invalid phone number format';
        break;
      case 21612:
        enhancedError.message = 'Twilio phone number not enabled for this region';
        break;
      case 21408:
        enhancedError.message = 'SMS permission not enabled for this account';
        break;
      case 20003:
        enhancedError.message = 'Authentication failed – check your credentials';
        break;
      default:
        break;
    }

    throw enhancedError;
  }
};

export default client;

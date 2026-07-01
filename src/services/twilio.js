const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = import.meta.env.VITE_TWILIO_VERIFY_SERVICE_SID;

const TWILIO_API_BASE = `https://verify.twilio.com/v2/Services/${VERIFY_SERVICE_SID}`;

const getAuthHeader = () => {
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  return `Basic ${credentials}`;
};

export const sendOtp = async (phoneNumber) => {
  try {
    const response = await fetch(`${TWILIO_API_BASE}/Verifications`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Channel: 'sms',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to send OTP' };
    }
    
    return { success: true, sid: data.sid, status: data.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const verifyOtp = async (phoneNumber, code) => {
  try {
    const response = await fetch(`${TWILIO_API_BASE}/VerificationCheck`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Code: code,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Verification failed' };
    }
    
    return { success: data.status === 'approved', status: data.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const verifyServiceSid = import.meta.env.VITE_TWILIO_VERIFY_SERVICE_SID;

// Check if credentials are valid and not placeholders
const isConfigured = 
  accountSid && 
  authToken && 
  verifyServiceSid && 
  accountSid !== 'your_account_sid_here' && 
  authToken !== 'your_auth_token_here' && 
  verifyServiceSid !== 'your_verify_service_sid_here';

const TWILIO_API_BASE = `https://verify.twilio.com/v2/Services/${verifyServiceSid}`;

const getAuthHeader = () => {
  const credentials = btoa(`${accountSid}:${authToken}`);
  return `Basic ${credentials}`;
};

export const sendOtp = async (phoneNumber) => {
  if (!isConfigured) {
    console.warn('[OTP SIMULATOR] Twilio credentials not configured. Running in Simulation Mode.');
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`mock_otp_${phoneNumber}`, mockOtp);
    
    // Log the simulated OTP in the browser console
    console.log(`%c[OTP SIMULATOR] Simulated OTP for ${phoneNumber} is: ${mockOtp}`, 'color: #00ff00; font-weight: bold; font-size: 14px;');
    
    // Show an alert so the user can easily see it without opening console
    alert(`[OTP Simulator Mode]\nSent simulated OTP code to ${phoneNumber}: ${mockOtp}\n\n(Please look at the browser developer console for details if needed)`);
    
    return { success: true, sid: `mock_sid_${Math.random().toString(36).substring(2, 11)}`, simulated: true };
  }

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
    console.error('Error sending OTP:', error);
    return { success: false, error: error.message };
  }
};

export const verifyOtp = async (phoneNumber, code) => {
  if (!isConfigured) {
    console.warn('[OTP SIMULATOR] Twilio credentials not configured. Running in Simulation Mode.');
    
    const storedOtp = sessionStorage.getItem(`mock_otp_${phoneNumber}`);
    
    if (!storedOtp) {
      return { success: false, status: 'failed', error: 'No OTP sent for this number.' };
    }
    
    if (storedOtp === code) {
      sessionStorage.removeItem(`mock_otp_${phoneNumber}`);
      return { success: true, status: 'approved' };
    } else {
      return { success: false, status: 'pending', error: 'Invalid mock OTP code' };
    }
  }

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
      return { success: false, status: 'failed', error: data.message || 'Verification failed' };
    }
    
    return { success: data.status === 'approved', status: data.status };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, status: 'failed', error: error.message };
  }
};
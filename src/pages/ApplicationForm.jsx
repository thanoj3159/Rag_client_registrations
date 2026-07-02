import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { sendOtp, verifyOtp } from '../Twillo(OTP)';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminName: '',
    adminEmail: '',
    adminMobile: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.adminMobile) {
      setError('Please enter mobile number first');
      return;
    }
    setLoading(true);
    setError('');
    const cleanMobile = formData.adminMobile.replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanMobile}`;
    const result = await sendOtp(fullPhoneNumber);
    setLoading(false);
    if (result.success) {
      setOtpSent(true);
      setError('OTP sent successfully! Check your phone.');
    } else {
      setError(`Failed to send OTP: ${result.error}`);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 6) return;
    setLoading(true);
    setError('');
    const cleanMobile = formData.adminMobile.replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanMobile}`;
    const result = await verifyOtp(fullPhoneNumber, formData.otp);
    setLoading(false);
    if (result.success) {
      setOtpVerified(true);
      setError('OTP verified successfully!');
    } else {
      setError(`Invalid OTP: ${result.error || result.status || 'failed'}`);
      setOtpVerified(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setError('Please verify OTP before submitting');
      return;
    }

    setPaymentLoading(true);
    setError('');

    // Load the Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Failed to load payment gateway. Please check your internet connection.');
      setPaymentLoading(false);
      return;
    }

    // Call backend to create a Razorpay order
    let orderData;
    try {
      const cleanMobile = formData.adminMobile.replace(/\D/g, '');
      const fullPhoneNumber = `${countryCode}${cleanMobile}`;
      const response = await fetch(`https://ragclientregistrations-production.up.railway.app/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.adminName,
            email: formData.adminEmail,
            mobile: fullPhoneNumber,
          }),
        });
      orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || 'Failed to create order');
    } catch (err) {
      setError(`Payment Error: ${err.message}`);
      setPaymentLoading(false);
      return;
    }

    setPaymentLoading(false);

    // Open Razorpay Checkout modal
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Admin Registration',
      description: 'Advance Deposit — ₹1',
      order_id: orderData.order_id,
      prefill: {
        name: formData.adminName,
        email: formData.adminEmail,
        contact: `${countryCode}${formData.adminMobile.replace(/\D/g, '')}`,
      },
      theme: { color: '#00e5ff' },
      handler: async (response) => {
        // Verify the payment on the backend
        try {
          const verifyRes = await fetch('https://ragclientregistrations-production.up.railway.app/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.verified) {
            setPaymentDone(true);
            setError('✅ Payment of ₹1 successful! Registration complete.');
          } else {
            setError('❌ Payment verification failed. Please contact support.');
          }
        } catch {
          setError('❌ Could not verify payment. Please contact support.');
        }
      },
      modal: {
        ondismiss: () => setError('Payment was cancelled. Please try again.'),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="application-page">
      <Navbar />
      
      <div className="form-container">
        <h1 className="form-title">Public Page</h1>
        <h2 className="form-subtitle">Create New Admin</h2>
        
        <form onSubmit={handleSubmit}>
          {/* 1. Enter Admin Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="adminName">1. Enter Admin Name</label>
            <input
              type="text"
              id="adminName"
              name="adminName"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.adminName}
              onChange={handleChange}
              required
            />
          </div>

          {/* 2. Enter Admin Mail Account */}
          <div className="form-group">
            <label className="form-label" htmlFor="adminEmail">2. Enter Admin Email Account</label>
            <input
              type="email"
              id="adminEmail"
              name="adminEmail"
              className="form-input"
              placeholder="e.g. john@company.com"
              value={formData.adminEmail}
              onChange={handleChange}
              required
            />
          </div>

          {/* 3. Admin Mobile Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="adminMobile">3. Admin Mobile Number</label>
            <div className="input-with-button">
              <div className="phone-input-container">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="country-select"
                  disabled={otpSent}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+7">🇷🇺 +7</option>
                </select>
                <input
                  type="tel"
                  id="adminMobile"
                  name="adminMobile"
                  className="form-input"
                  placeholder="e.g. 98765 43210"
                  value={formData.adminMobile}
                  onChange={handleChange}
                  required
                  disabled={otpSent}
                />
              </div>
              <button 
                type="button" 
                className="otp-btn" 
                onClick={handleSendOtp}
                disabled={otpSent || loading}
              >
                {otpSent ? 'OTP Sent' : loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* 4. OTP */}
          <div className="form-group">
            <label className="form-label" htmlFor="otp">4. OTP Verification</label>
            <div className="input-with-button">
              <input
                type="text"
                id="otp"
                name="otp"
                className="form-input"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                disabled={!otpSent || otpVerified}
                maxLength={6}
              />
              <button 
                type="button" 
                className="otp-btn" 
                onClick={handleVerifyOtp}
                disabled={!otpSent || otpVerified || loading || formData.otp.length !== 6}
              >
                {otpVerified ? 'Verified' : loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
            {otpVerified && <span className="otp-success">✓ Verified</span>}
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* 5. Payment for Advance */}
          <div className="payment-card">
            <div className="payment-header">
              <span className="payment-label">Advance Deposit Amount</span>
              <span className="payment-amount">₹1</span>
            </div>
            <p className="payment-note">
              🔒 Refund Guarantee: If the reservation is not responded to/confirmed within 48 hours, the advance payment will be fully refunded.
            </p>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={paymentDone || paymentLoading}>
            {paymentDone ? '✅ Payment Complete' : paymentLoading ? 'Opening Payment...' : 'Confirm & Pay ₹1'}
          </button>
        </form>

        <span className="back-link" onClick={() => navigate('/')}>
          ← Go Back to Home Page
        </span>
      </div>
    </div>
  );
};

export default ApplicationForm;

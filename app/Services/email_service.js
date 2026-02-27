
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const otpStore = new Map();


export async function sendOTPEmail(email, otp) {
  try {
    // Store OTP with expiry (5 minutes)
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { otp, expiryTime });
    
    console.log(`📧 OTP sent to ${email}: ${otp}`);
    console.log(`⏰ OTP expires in 5 minutes`);
    
  
    /*
    const response = await fetch('YOUR_EMAIL_API_ENDPOINT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'GrowWithUs - Email Verification OTP',
        text: `Your OTP is: ${otp}. Valid for 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Your OTP for GrowWithUs registration is:</p>
            <h1 style="color: #3b82f6; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      })
    });
    */
    
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

/**
 * Verify OTP
 */
export function verifyOTP(email, enteredOTP) {
  try {
    const stored = otpStore.get(email);
    
    if (!stored) {
      return { success: false, message: 'OTP not found or expired' };
    }
    
    // Check if OTP expired
    if (Date.now() > stored.expiryTime) {
      otpStore.delete(email);
      return { success: false, message: 'OTP expired. Please request a new one.' };
    }
    
    // Verify OTP
    if (stored.otp === enteredOTP) {
      otpStore.delete(email); // Remove OTP after successful verification
      return { success: true, message: 'Email verified successfully' };
    } else {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Verification failed' };
  }
}

/**
 * Resend OTP
 */
export async function resendOTP(email) {
  try {
    const newOTP = generateOTP();
    return await sendOTPEmail(email, newOTP);
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw new Error('Failed to resend OTP');
  }
}

/**
 * Clear OTP (for cleanup)
 */
export function clearOTP(email) {
  otpStore.delete(email);
}

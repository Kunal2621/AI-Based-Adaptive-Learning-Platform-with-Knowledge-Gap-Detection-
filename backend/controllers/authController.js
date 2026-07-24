const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Transporter Helper Function
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Helper: Generate 6-Digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { fullName, name, email, password, role } = req.body;
    const displayName = fullName || name;

    if (!displayName || !email || !password || !role) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists with this email. Please Login.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    if (user && !user.isVerified) {
      user.name = displayName;
      user.fullName = displayName;
      user.password = hashedPassword;
      user.role = role;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        name: displayName,
        fullName: displayName,
        email,
        password: hashedPassword,
        role,
        otp,
        otpExpires,
        isVerified: false,
      });
    }

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"Knowledge Guru" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email – Knowledge Guru',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 520px; background-color: #ffffff; color: #333333;">
          <h2 style="color: #6b21a8; margin-top: 0; font-size: 22px;">Verify Your Email</h2>
          <p style="font-size: 15px; margin-bottom: 5px;">Hello <strong>${displayName}</strong>,</p>
          <p style="font-size: 15px; margin-top: 0;">Welcome to Knowledge Guru!</p>
          
          <p style="font-size: 14px; color: #555555; margin-top: 15px;">Use the verification code below to complete your request:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <span style="background-color: #f3e8ff; color: #6b21a8; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 28px; border-radius: 8px; border: 1px dashed #6b21a8; display: inline-block;">
              ${otp}
            </span>
          </div>

          <p style="font-size: 14px; color: #444444; font-weight: 500;">This OTP is valid for 10 minutes.</p>
          
          <div style="background-color: #fff8f0; padding: 12px 15px; border-left: 4px solid #f97316; border-radius: 4px; margin: 20px 0;">
            <p style="font-size: 13px; color: #c2410c; margin: 0; line-height: 1.4;">
              <strong>Security Reminder:</strong> Never share this OTP with anyone. Knowledge Guru will never ask for your OTP.
            </p>
          </div>

          <p style="font-size: 13px; color: #666666; margin-bottom: 20px;">If you didn't request this code, you can safely ignore this email.</p>
          <p style="font-size: 14px; color: #333333;">Thank you for choosing Knowledge Guru.</p>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          
          <p style="font-size: 13px; color: #555555; margin: 0;">Best Regards,<br/><strong>Knowledge Guru Team</strong></p>
          <p style="font-size: 13px; color: #6b21a8; margin-top: 5px;">📧 <a href="mailto:support@knowledgeguru.com" style="color: #6b21a8; text-decoration: none;">support@knowledgeguru.com</a></p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete registration.',
    });
  } catch (error) {
    console.error("Register Error / Mail Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. VERIFY OTP
exports.verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide both email and OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const inputOtp = String(otp).trim();
    const dbOtp = String(user.otp).trim();

    if (dbOtp !== inputOtp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      token: generateToken(user._id),
      role: user.role,
      fullName: user.fullName || user.name,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email not verified. Please complete registration verification first.' });
    }

    if (user.role !== role) {
      return res.status(401).json({ message: `Account exists, but not registered as a ${role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const activeName = user.fullName || user.name || "User";

    try {
      const transporter = getTransporter();

      await transporter.sendMail({
        from: `"Knowledge Guru" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Login Successful – Knowledge Guru',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; background-color: #ffffff;">
            <h2 style="color: #6b21a8; margin-top: 0;">Login Successful</h2>
            <p style="color: #333; font-size: 15px;">Hello <strong>${activeName}</strong>,</p>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">Your Knowledge Guru account was successfully logged in.</p>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">If this was you, no further action is needed.</p>
            
            <div style="background-color: #fff5f5; padding: 12px 15px; border-left: 4px solid #e53e3e; margin: 15px 0; border-radius: 4px;">
              <p style="color: #c53030; font-size: 13px; margin: 0; line-height: 1.4;">
                If you did not log in to your account, please change your password immediately and report this activity to our support team.
              </p>
            </div>

            <p style="color: #555; font-size: 14px; margin-bottom: 5px;">
              <strong>Support Email:</strong> <a href="mailto:support@knowledgeguru.com" style="color: #6b21a8; text-decoration: none;">support@knowledgeguru.com</a>
            </p>
            <p style="color: #555; font-size: 14px;">Thank you for using Knowledge Guru.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #777; font-size: 13px; margin: 0;">Best Regards,<br/><strong>Knowledge Guru Team</strong></p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Login Alert Email Error:", mailError.message);
    }

    res.status(200).json({
      _id: user._id,
      name: activeName,
      fullName: activeName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 4. GOOGLE AUTH LOGIN / REGISTER
exports.googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sub, salt);

      user = await User.create({
        name,
        fullName: name,
        email,
        password: hashedPassword,
        role: role || 'Student',
        isVerified: true,
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name || user.fullName,
      fullName: user.name || user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: 'Google Authentication Failed', error: error.message });
  }
};

// 5. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"Knowledge Guru" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request – Knowledge Guru',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; background-color: #ffffff;">
          <h2 style="color: #6b21a8; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #333; font-size: 15px;">Hello <strong>${user.name || user.fullName || 'User'}</strong>,</p>
          <p style="color: #555; font-size: 14px; line-height: 1.5;">We received a request to reset your Knowledge Guru password.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #6b21a8; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #555; font-size: 13px;">This link is valid for <strong>10 minutes</strong> only.</p>
          <p style="color: #777; font-size: 13px;">If you did not request a password reset, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #777; font-size: 13px; margin: 0;">Best Regards,<br/><strong>Knowledge Guru Team</strong></p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

// 6. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please enter a new password' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
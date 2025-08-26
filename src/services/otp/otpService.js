import User from "../../models/user.js";
import OtpUtil from "../../utils/OtpUtil.js";
import MailService from "../mail/mailService.js";

class OTPService {
  static async sendOTP(email, fullName) {
    const otp = OtpUtil.generateOtp();

    await MailService.sendMail(
      email,
      "Your OTP Code - UTE-Shop",
      "otp-email.ejs",
      { fullName, otp }
    );

    return otp;
  }

  // Verify OTP
  static async verifyOTP(email, otp) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      if (!user.otp || !user.otpGeneratedTime) {
        return { success: false, message: "No OTP found" };
      }

      // Check if OTP expired (5 minutes)
      const now = new Date();
      const otpTime = new Date(user.otpGeneratedTime);
      const diffInMinutes = (now - otpTime) / (1000 * 60);

      if (diffInMinutes > 5) {
        return { success: false, message: "OTP expired" };
      }

      if (user.otp !== otp) {
        return { success: false, message: "Invalid OTP" };
      }

      // Clear OTP after successful verification
      user.otp = null;
      user.otpGeneratedTime = null;
      user.isActive = true;
      await user.save();

      return { success: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, message: "Error verifying OTP" };
    }
  }

  // Resend OTP
  static async resendOTP(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      const otp = await this.sendOTP(user.email, user.fullName);

      user.otp = otp;
      user.otpGeneratedTime = new Date();
      await user.save();

      return { success: true, message: "OTP resent successfully" };
    } catch (error) {
      console.error("Error resending OTP:", error);
      return { success: false, message: "Error resending OTP" };
    }
  }
}

export default OTPService;

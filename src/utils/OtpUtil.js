class OtpUtil {
  static generateOtp(length = 6) {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default OtpUtil;

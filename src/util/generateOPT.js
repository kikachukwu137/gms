// utils/generateOTP.js
const generateOTP = (length = 4) => {
    const otp = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    return { otp, otpExpiration };
};


export default generateOTP
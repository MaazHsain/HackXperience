import bcrypt, { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async(req, res) => {
    const {name, email, password, birthdate} = req.body;
    // check if name email password are recieved
    if (!name || !email || !password || !birthdate ){
        return res.json({success: false, message: 'Missing Details'})
    }

    try {
        // search db for user with email
        const existingUser = await userModel.findOne({email});
        // handle if existing user is found
        if (existingUser){
            return res.json({success: false, message: "User already exists"})
        }
        // hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        // create user and store in db
        const user = new userModel({name, email, password:hashedPassword, birthdate});
        await user.save();

        // generate token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        // add token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            // ensure that https is used when in production
            secure: process.env.NODE_ENV === 'production',
            // ensure cookies are sent over https in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            // 7 days validity for cookie
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to GiftFrenz',
            text: `Welcome to GiftFrenz website. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});

    } catch (error) {
        res.json({success: false, message: error.message})
    }
};

export const login = async (req, res)=> {
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: 'Email and password are requried'})
    }

    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success: false, message: 'Invalid email or password'})
        }
        // compare password using bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password)

        // handle if password do not match
        if(!isMatch){
            return res.json({success: false, message: 'Invalid email or password'})
        }

        // generate token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        // add token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            // ensure that https is used when in production
            secure: process.env.NODE_ENV === 'production',
            // ensure cookies are sent over https in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            // 7 days validity for cookie
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true});

    } catch(error) {
        return res.json({ success: false, message: error.message});
    }
};

export const logout = async(req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            // ensure that https is used when in production
            secure: process.env.NODE_ENV === 'production',
            // ensure cookies are sent over https in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({success:true, message: "Logged out"});

    } catch(error){
        return res.json({ success: false, message: error.message});
    }
};

export const sendVerifyOtp = async(req, res) => {
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message:"Account Already Verified"})
        }

        // Generate a 6-digit OTP securely
        const otp = crypto.randomInt(100000, 1000000).toString();

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 10000;


        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }
        await transporter.sendMail(mailOptions);

        res.json({success: true, message: 'Verification OTP Sent on Email'})

    } catch(error){
        return res.json({ success: false, message: error.message});
    }
}

export const verifyEmail = async(req, res) => {
    const {userId, otp} = req.body;

    if(!userId || !otp) {
        return res.json({ success: false, message: 'Missing Details'});
    }
    try {
        const user = await userModel.findById(userId);

        if (!user){
            return res.json({success: false, message:"User not found"})
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: "OTP Expired"})
        }

        // Securely compare OTP
        if (!user.verifyOtp || user.verifyOtp.length !== otp.length) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        const isOtpValid = crypto.timingSafeEqual(Buffer.from(user.verifyOtp), Buffer.from(otp));
        if (!isOtpValid) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save()
        return res.json({success: true, message: "Email Verified Successfully" })

    } catch(error){
        return res.json({ success: false, message: error.message});
    }
}

// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try{
        return res.json({ success: true});
    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}

// Send password reset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email){
        res.json({ success: false, message: "Email is required"});
    }

    try {
        const user = await userModel.findOne({email});

        if (!user) {
            res.json({ success: false, message: "Account with this email does not exist"});
        }

        // Generate a 6-digit OTP securely
        const otp = crypto.randomInt(100000, 1000000).toString();

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Reset Password OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`
        }
        await transporter.sendMail(mailOptions);

        res.json({success: true, message: 'Reset OTP Sent on Email'})

    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}

// Reset User Password
export const resetPassword = async (req, res)=> {
    const {email, otp, newPassword} = req.body;

    if (!email || !otp || !newPassword){
        return res.json({ success: false, message: 'Email, OTP, and new password are required'})
    }

    try{
        const user = await userModel.findOne({email})

        if (!user) {
            res.json({ success: false, message: "Account with this email does not exist"});
        }


        if(user.resetOtpExpireAt < Date.now()){
            res.json({ success: false, message: "OTP Expired"});
        }

        // Securely compare OTP
        if (!user.resetOtp || user.resetOtp.length !== otp.length) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        const isOtpValid = crypto.timingSafeEqual(Buffer.from(user.resetOtp), Buffer.from(otp));
        if (!isOtpValid) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        res.json({success: true, message: 'Password has been reset successfully'})
    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}
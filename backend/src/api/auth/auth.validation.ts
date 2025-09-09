import Joi from "joi";

export const sendOtp = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const verifyOtp = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const sendOtpReset = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const sendOtpChange = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const register = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  name: Joi.string().required(),
  phone: Joi.string().optional(),
});

export const login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const resetPassword = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  password: Joi.string().required().min(8),
});

export const changePassword = Joi.object().keys({
  email: Joi.string().email().required(),
  oldPassword: Joi.string().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().required().min(8),
});

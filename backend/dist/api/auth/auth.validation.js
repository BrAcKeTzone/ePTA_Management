"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.login = exports.register = exports.sendOtpChange = exports.sendOtpReset = exports.verifyOtpForChange = exports.verifyOtpForReset = exports.verifyOtp = exports.sendOtp = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sendOtp = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
});
exports.verifyOtp = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    otp: joi_1.default.string().required(),
});
exports.verifyOtpForReset = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    otp: joi_1.default.string().required(),
});
exports.verifyOtpForChange = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    otp: joi_1.default.string().required(),
});
exports.sendOtpReset = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
});
exports.sendOtpChange = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.register = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required().min(8),
    name: joi_1.default.string().required(),
});
exports.login = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.resetPassword = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    otp: joi_1.default.string().required(),
    password: joi_1.default.string().required().min(8),
});
exports.changePassword = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    oldPassword: joi_1.default.string().required(),
    otp: joi_1.default.string().required(),
    newPassword: joi_1.default.string().required().min(8),
});
//# sourceMappingURL=auth.validation.js.map
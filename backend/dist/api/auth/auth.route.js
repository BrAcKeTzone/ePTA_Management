"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController = __importStar(require("./auth.controller"));
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const authValidation = __importStar(require("./auth.validation"));
router.post("/send-otp", (0, validate_middleware_1.default)(authValidation.sendOtp), authController.sendOtp);
router.post("/verify-otp", (0, validate_middleware_1.default)(authValidation.verifyOtp), authController.verifyOtp);
router.post("/send-otp-reset", (0, validate_middleware_1.default)(authValidation.sendOtpReset), authController.sendOtpForReset);
router.post("/verify-otp-reset", (0, validate_middleware_1.default)(authValidation.verifyOtpForReset), authController.verifyOtpForReset);
router.post("/send-otp-change", (0, validate_middleware_1.default)(authValidation.sendOtpChange), authController.sendOtpForChange);
router.post("/verify-otp-change", (0, validate_middleware_1.default)(authValidation.verifyOtpForChange), authController.verifyOtpForChange);
router.post("/register", (0, validate_middleware_1.default)(authValidation.register), authController.register);
router.post("/login", (0, validate_middleware_1.default)(authValidation.login), authController.login);
router.post("/reset-password", (0, validate_middleware_1.default)(authValidation.resetPassword), authController.resetPassword);
router.post("/change-password", (0, validate_middleware_1.default)(authValidation.changePassword), authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.route.js.map
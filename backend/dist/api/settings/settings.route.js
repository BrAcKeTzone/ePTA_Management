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
const express_1 = require("express");
const settingsController = __importStar(require("./settings.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const settings_validation_1 = require("./settings.validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Note: Role-based authorization middleware should be added here
// For now, all authenticated users can access these routes
// TODO: Add admin-only middleware for settings modification
/**
 * @route   GET /api/settings
 * @desc    Get all system settings
 * @access  Private (Admin only)
 */
router.get("/", settingsController.getSettings);
/**
 * @route   PUT /api/settings
 * @desc    Update system settings
 * @access  Private (Admin only)
 */
router.put("/", (0, validate_middleware_1.default)(settings_validation_1.updateSettingsSchema), settingsController.updateSettings);
/**
 * @route   POST /api/settings/initialize
 * @desc    Initialize default settings (first-time setup)
 * @access  Private (Admin only)
 */
router.post("/initialize", settingsController.initializeSettings);
/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private (Admin only)
 */
router.post("/reset", settingsController.resetToDefaults);
/**
 * @route   GET /api/settings/category/:category
 * @desc    Get settings by category (penalty, contribution, payment, meeting, document, academic, system, notification, all)
 * @access  Private (Admin only)
 */
router.get("/category/:category", (0, validate_middleware_1.default)(settings_validation_1.getSettingsByCategorySchema, "params"), settingsController.getSettingsByCategory);
/**
 * @route   GET /api/settings/documents/categories
 * @desc    Get document categories
 * @access  Private
 */
router.get("/documents/categories", settingsController.getDocumentCategories);
/**
 * @route   POST /api/settings/documents/categories
 * @desc    Add document category
 * @access  Private (Admin only)
 */
router.post("/documents/categories", settingsController.addDocumentCategory);
/**
 * @route   DELETE /api/settings/documents/categories/:category
 * @desc    Remove document category
 * @access  Private (Admin only)
 */
router.delete("/documents/categories/:category", settingsController.removeDocumentCategory);
exports.default = router;
//# sourceMappingURL=settings.route.js.map
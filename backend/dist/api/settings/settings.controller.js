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
exports.initializeSettings = exports.removeDocumentCategory = exports.addDocumentCategory = exports.getDocumentCategories = exports.resetToDefaults = exports.getSettingsByCategory = exports.updateSettings = exports.getSettings = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const settingsService = __importStar(require("./settings.service"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
/**
 * @desc    Get system settings
 * @route   GET /api/settings
 * @access  Private (Admin only)
 */
exports.getSettings = (0, asyncHandler_1.default)(async (req, res) => {
    const settings = await settingsService.getSettings();
    // Parse documentCategories from JSON string to array for response
    const responseSettings = {
        ...settings,
        documentCategories: JSON.parse(settings.documentCategories),
    };
    res
        .status(200)
        .json(new ApiResponse_1.default(200, responseSettings, "System settings retrieved successfully"));
});
/**
 * @desc    Update system settings
 * @route   PUT /api/settings
 * @access  Private (Admin only)
 */
exports.updateSettings = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const updatedSettings = await settingsService.updateSettings(req.body, userId);
    // Parse documentCategories from JSON string to array for response
    const responseSettings = {
        ...updatedSettings,
        documentCategories: JSON.parse(updatedSettings.documentCategories),
    };
    res
        .status(200)
        .json(new ApiResponse_1.default(200, responseSettings, "System settings updated successfully"));
});
/**
 * @desc    Get settings by category
 * @route   GET /api/settings/category/:category
 * @access  Private (Admin only)
 */
exports.getSettingsByCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const { category } = req.params;
    const settings = await settingsService.getSettingsByCategory(category || "all");
    res
        .status(200)
        .json(new ApiResponse_1.default(200, settings, `${category || "All"} settings retrieved successfully`));
});
/**
 * @desc    Reset settings to defaults
 * @route   POST /api/settings/reset
 * @access  Private (Admin only)
 */
exports.resetToDefaults = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const settings = await settingsService.resetToDefaults(userId);
    // Parse documentCategories from JSON string to array for response
    const responseSettings = {
        ...settings,
        documentCategories: JSON.parse(settings.documentCategories),
    };
    res
        .status(200)
        .json(new ApiResponse_1.default(200, responseSettings, "System settings reset to defaults successfully"));
});
/**
 * @desc    Get document categories
 * @route   GET /api/settings/documents/categories
 * @access  Private
 */
exports.getDocumentCategories = (0, asyncHandler_1.default)(async (req, res) => {
    const categories = await settingsService.getDocumentCategories();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { categories }, "Document categories retrieved successfully"));
});
/**
 * @desc    Add document category
 * @route   POST /api/settings/documents/categories
 * @access  Private (Admin only)
 */
exports.addDocumentCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { category } = req.body;
    if (!userId) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    if (!category || typeof category !== "string" || category.trim() === "") {
        throw new ApiError_1.default(400, "Category name is required");
    }
    const categories = await settingsService.addDocumentCategory(category.trim(), userId);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, { categories }, "Document category added successfully"));
});
/**
 * @desc    Remove document category
 * @route   DELETE /api/settings/documents/categories/:category
 * @access  Private (Admin only)
 */
exports.removeDocumentCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { category } = req.params;
    if (!userId) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    if (!category) {
        throw new ApiError_1.default(400, "Category name is required");
    }
    const categories = await settingsService.removeDocumentCategory(category, userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { categories }, "Document category removed successfully"));
});
/**
 * @desc    Initialize default settings (first-time setup)
 * @route   POST /api/settings/initialize
 * @access  Private (Admin only)
 */
exports.initializeSettings = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const settings = await settingsService.initializeSettings(userId);
    // Parse documentCategories from JSON string to array for response
    const responseSettings = {
        ...settings,
        documentCategories: JSON.parse(settings.documentCategories),
    };
    res
        .status(201)
        .json(new ApiResponse_1.default(201, responseSettings, "System settings initialized successfully"));
});
//# sourceMappingURL=settings.controller.js.map
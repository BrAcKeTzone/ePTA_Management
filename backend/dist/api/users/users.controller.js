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
exports.getUserStats = exports.changePassword = exports.deleteUser = exports.updateUserByAdmin = exports.activateUser = exports.deactivateUser = exports.updateUserRole = exports.getAllUsers = exports.updateUserProfile = exports.getUserProfile = exports.getUserById = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const userService = __importStar(require("./users.service"));
// Get user by ID (admin only)
exports.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userService.getUserById(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "User retrieved successfully"));
});
// Get current user profile (self)
exports.getUserProfile = (0, asyncHandler_1.default)(async (req, res) => {
    // Get userId from auth middleware (req.user is set by authenticate middleware)
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "Unauthorized - User ID not found"));
    }
    const user = await userService.getUserProfile(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "Profile retrieved successfully"));
});
// Update user profile (self)
exports.updateUserProfile = (0, asyncHandler_1.default)(async (req, res) => {
    // Get userId from auth middleware
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "Unauthorized - User ID not found"));
    }
    const user = await userService.updateUserProfile(userId, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "Profile updated successfully"));
});
// Get all users with filters (admin only)
exports.getAllUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Users retrieved successfully"));
});
// Update user role (admin only)
exports.updateUserRole = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    const user = await userService.updateUserRole(id, role);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "User role updated successfully"));
});
// Deactivate user (admin only)
exports.deactivateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userService.deactivateUser(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "User deactivated successfully"));
});
// Activate user (admin only)
exports.activateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userService.activateUser(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "User activated successfully"));
});
// Update user by admin (admin only)
exports.updateUserByAdmin = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userService.updateUserByAdmin(id, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "User updated successfully"));
});
// Delete user (admin only)
exports.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    await userService.deleteUser(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { message: "User deleted successfully" }, "User deleted successfully"));
});
// Change password (self)
exports.changePassword = (0, asyncHandler_1.default)(async (req, res) => {
    // Get userId from auth middleware
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "Unauthorized - User ID not found"));
    }
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { message: "Password changed successfully" }, "Password changed successfully"));
});
// Get user statistics (admin only)
exports.getUserStats = (0, asyncHandler_1.default)(async (req, res) => {
    const stats = await userService.getUserStats();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "User statistics retrieved successfully"));
});
//# sourceMappingURL=users.controller.js.map
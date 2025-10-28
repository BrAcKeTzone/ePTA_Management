"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDocumentCategory = exports.addDocumentCategory = exports.getDocumentCategories = exports.resetToDefaults = exports.getSettingsByCategory = exports.initializeSettings = exports.updateSettings = exports.getSettings = void 0;
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const prisma_1 = __importDefault(require("../../configs/prisma"));
const SYSTEM_CONFIG_KEY = "system_config";
// Default document categories
const DEFAULT_DOCUMENT_CATEGORIES = [
    "Minutes",
    "Resolutions",
    "Financial Reports",
    "Project Proposals",
    "Attendance Records",
    "Legal Documents",
    "Communications",
    "Other",
];
/**
 * Get system settings (creates default if not exists)
 */
const getSettings = async () => {
    let settings = await prisma_1.default.settings.findUnique({
        where: { key: SYSTEM_CONFIG_KEY },
        include: {
            updatedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    // If settings don't exist, create with defaults
    if (!settings) {
        // Find first admin to set as updatedBy
        const admin = await prisma_1.default.user.findFirst({
            where: { role: "ADMIN" },
        });
        if (!admin) {
            throw new ApiError_1.default(500, "No admin user found to initialize settings");
        }
        settings = await prisma_1.default.settings.create({
            data: {
                key: SYSTEM_CONFIG_KEY,
                documentCategories: JSON.stringify(DEFAULT_DOCUMENT_CATEGORIES),
                updatedById: admin.id,
            },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
    return settings;
};
exports.getSettings = getSettings;
/**
 * Update system settings
 */
const updateSettings = async (updateData, updatedById) => {
    // Ensure settings exist
    let settings = await prisma_1.default.settings.findUnique({
        where: { key: SYSTEM_CONFIG_KEY },
    });
    // If settings don't exist, create them first
    if (!settings) {
        settings = await prisma_1.default.settings.create({
            data: {
                key: SYSTEM_CONFIG_KEY,
                documentCategories: JSON.stringify(DEFAULT_DOCUMENT_CATEGORIES),
                updatedById,
            },
        });
    }
    // Prepare update data
    const updatePayload = {
        ...updateData,
        updatedById,
    };
    // Convert documentCategories array to JSON string if provided
    if (updateData.documentCategories) {
        if (Array.isArray(updateData.documentCategories)) {
            updatePayload.documentCategories = JSON.stringify(updateData.documentCategories);
        }
        else {
            updatePayload.documentCategories = updateData.documentCategories;
        }
    }
    // Validate penalty rates
    if (updateData.penaltyRatePerAbsence !== undefined &&
        updateData.penaltyRatePerAbsence < 0) {
        throw new ApiError_1.default(400, "Penalty rate per absence cannot be negative");
    }
    if (updateData.penaltyRateLate !== undefined &&
        updateData.penaltyRateLate < 0) {
        throw new ApiError_1.default(400, "Penalty rate for late attendance cannot be negative");
    }
    // Validate contribution amounts
    if (updateData.monthlyContributionAmount !== undefined &&
        updateData.monthlyContributionAmount < 0) {
        throw new ApiError_1.default(400, "Monthly contribution amount cannot be negative");
    }
    if (updateData.projectContributionMinimum !== undefined &&
        updateData.projectContributionMinimum < 0) {
        throw new ApiError_1.default(400, "Project contribution minimum cannot be negative");
    }
    // Validate percentage values
    if (updateData.quorumPercentage !== undefined &&
        (updateData.quorumPercentage < 0 || updateData.quorumPercentage > 100)) {
        throw new ApiError_1.default(400, "Quorum percentage must be between 0 and 100");
    }
    // Update settings
    const updatedSettings = await prisma_1.default.settings.update({
        where: { key: SYSTEM_CONFIG_KEY },
        data: updatePayload,
        include: {
            updatedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    return updatedSettings;
};
exports.updateSettings = updateSettings;
/**
 * Initialize default settings (used during first setup)
 */
const initializeSettings = async (adminId) => {
    // Check if settings already exist
    const existingSettings = await prisma_1.default.settings.findUnique({
        where: { key: SYSTEM_CONFIG_KEY },
    });
    if (existingSettings) {
        return existingSettings;
    }
    // Create default settings
    const settings = await prisma_1.default.settings.create({
        data: {
            key: SYSTEM_CONFIG_KEY,
            documentCategories: JSON.stringify(DEFAULT_DOCUMENT_CATEGORIES),
            updatedById: adminId,
        },
        include: {
            updatedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    return settings;
};
exports.initializeSettings = initializeSettings;
/**
 * Get settings by category
 */
const getSettingsByCategory = async (category) => {
    const settings = await (0, exports.getSettings)();
    // Parse documentCategories from JSON string to array
    const parsedSettings = {
        ...settings,
        documentCategories: JSON.parse(settings.documentCategories),
    };
    switch (category) {
        case "penalty":
            return {
                penaltyRatePerAbsence: parsedSettings.penaltyRatePerAbsence,
                penaltyRateLate: parsedSettings.penaltyRateLate,
                penaltyGracePeriodDays: parsedSettings.penaltyGracePeriodDays,
                enableAutoPenalty: parsedSettings.enableAutoPenalty,
            };
        case "contribution":
            return {
                monthlyContributionAmount: parsedSettings.monthlyContributionAmount,
                projectContributionMinimum: parsedSettings.projectContributionMinimum,
                enableMandatoryContribution: parsedSettings.enableMandatoryContribution,
            };
        case "payment":
            return {
                paymentBasis: parsedSettings.paymentBasis,
                allowPartialPayment: parsedSettings.allowPartialPayment,
                paymentDueDays: parsedSettings.paymentDueDays,
            };
        case "meeting":
            return {
                minimumMeetingsPerYear: parsedSettings.minimumMeetingsPerYear,
                quorumPercentage: parsedSettings.quorumPercentage,
                notificationDaysBeforeMeet: parsedSettings.notificationDaysBeforeMeet,
            };
        case "document":
            return {
                documentCategories: parsedSettings.documentCategories,
            };
        case "academic":
            return {
                currentAcademicYear: parsedSettings.currentAcademicYear,
                academicYearStart: parsedSettings.academicYearStart,
                academicYearEnd: parsedSettings.academicYearEnd,
            };
        case "system":
            return {
                systemName: parsedSettings.systemName,
                systemEmail: parsedSettings.systemEmail,
                systemPhone: parsedSettings.systemPhone,
            };
        case "notification":
            return {
                enableEmailNotifications: parsedSettings.enableEmailNotifications,
                enableSMSNotifications: parsedSettings.enableSMSNotifications,
            };
        case "all":
        default:
            return parsedSettings;
    }
};
exports.getSettingsByCategory = getSettingsByCategory;
/**
 * Reset settings to defaults
 */
const resetToDefaults = async (adminId) => {
    // Delete existing settings
    await prisma_1.default.settings.deleteMany({
        where: { key: SYSTEM_CONFIG_KEY },
    });
    // Create new default settings
    return (0, exports.initializeSettings)(adminId);
};
exports.resetToDefaults = resetToDefaults;
/**
 * Get document categories as array
 */
const getDocumentCategories = async () => {
    const settings = await (0, exports.getSettings)();
    return JSON.parse(settings.documentCategories);
};
exports.getDocumentCategories = getDocumentCategories;
/**
 * Add document category
 */
const addDocumentCategory = async (category, adminId) => {
    const categories = await (0, exports.getDocumentCategories)();
    // Check if category already exists (case-insensitive)
    if (categories.some((cat) => cat.toLowerCase() === category.toLowerCase())) {
        throw new ApiError_1.default(400, "Document category already exists");
    }
    categories.push(category);
    await (0, exports.updateSettings)({ documentCategories: JSON.stringify(categories) }, adminId);
    return categories;
};
exports.addDocumentCategory = addDocumentCategory;
/**
 * Remove document category
 */
const removeDocumentCategory = async (category, adminId) => {
    const categories = await (0, exports.getDocumentCategories)();
    // Find and remove category (case-insensitive)
    const index = categories.findIndex((cat) => cat.toLowerCase() === category.toLowerCase());
    if (index === -1) {
        throw new ApiError_1.default(404, "Document category not found");
    }
    categories.splice(index, 1);
    if (categories.length === 0) {
        throw new ApiError_1.default(400, "At least one document category is required");
    }
    await (0, exports.updateSettings)({ documentCategories: JSON.stringify(categories) }, adminId);
    return categories;
};
exports.removeDocumentCategory = removeDocumentCategory;
//# sourceMappingURL=settings.service.js.map
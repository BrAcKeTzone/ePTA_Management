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
const attendanceController = __importStar(require("./attendance.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const attendance_validation_1 = require("./attendance.validation");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Statistics route (must be before /:id route)
router.get("/stats", (0, validate_middleware_1.default)(attendance_validation_1.attendanceStatsSchema, "query"), attendanceController.getAttendanceStats);
// Parent-specific routes
router.get("/my-attendance", attendanceController.getMyAttendance);
router.get("/my-penalties", attendanceController.getMyPenalties);
// Report route (must be before /:id route)
router.get("/report", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(attendance_validation_1.attendanceReportSchema, "query"), attendanceController.generateAttendanceReport);
// Meeting-specific attendance
router.get("/meeting/:meetingId", attendanceController.getAttendanceByMeeting);
// Record attendance for meeting
router.post("/record", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(attendance_validation_1.recordAttendanceSchema, "body"), attendanceController.recordAttendance);
// Calculate penalties route (admin only)
router.post("/calculate-penalties", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(attendance_validation_1.calculatePenaltiesSchema, "body"), attendanceController.calculatePenalties);
// Bulk record attendance (admin only)
router.post("/bulk", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(attendance_validation_1.bulkRecordAttendanceSchema, "body"), attendanceController.bulkRecordAttendance);
// Get all attendance records with filters
router.get("/", (0, validate_middleware_1.default)(attendance_validation_1.getAttendanceSchema, "query"), attendanceController.getAttendance);
// Record single attendance (admin only)
router.post("/", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(attendance_validation_1.recordAttendanceSchema, "body"), attendanceController.recordAttendance);
// Get attendance by ID
router.get("/:id", attendanceController.getAttendanceById);
// Update attendance (admin only)
router.put("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(attendance_validation_1.updateAttendanceSchema, "body"), attendanceController.updateAttendance);
// Delete attendance (admin only)
router.delete("/:id", (0, auth_middleware_1.authorize)("ADMIN"), attendanceController.deleteAttendance);
exports.default = router;
//# sourceMappingURL=attendance.route.js.map
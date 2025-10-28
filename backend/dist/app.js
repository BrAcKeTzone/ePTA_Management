"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const errors_1 = require("./utils/errors");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api", index_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof errors_1.AuthenticationError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});
exports.default = app;
//# sourceMappingURL=app.js.map
import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/index";
import { AuthenticationError } from "./utils/errors";

const app: Express = express();

// Middleware
app.use(cors());
// Increase payload size limit to handle base64 encoded images
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

export default app;

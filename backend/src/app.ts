import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/index";
import { AuthenticationError } from "./utils/errors";

const app: Express = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

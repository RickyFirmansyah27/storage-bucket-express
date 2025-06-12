import "dotenv/config";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { Logger, httpLogger } from "./helper";
import { routes } from "./routes";
import { ErrorHandler } from "./helper/error-handler";

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8000;

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(ErrorHandler);

routes.forEach(route => {
    app.use(route.path, route.handler);
});


app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, async (): Promise<void> => {
  try {
      Logger.info(`[Express-Service] Server is running on port ${PORT}`);
  } catch (error) {
      if (error instanceof Error) {
          Logger.error(
              `Error starting server: Message: ${error.message} | Stack: ${error.stack}`
          );
      } else {
          Logger.error(`Error starting server: ${String(error)}`);
      }
  }
});
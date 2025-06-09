import { config } from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors'; 
import { Logger } from './helper/logger';
import { ErrorHandler } from './helper/error-handler';
import { routes } from './routes';
import { httpLogger } from './helper/http-logger';
import { serverless } from './helper';

config();

const app = new Hono();
const port = process.env.PORT || 8000;
app.use('*', cors({
  origin: ['*.vercel.app', 'http://localhost:8080'],
  credentials: true,
}));
  
app.use('*', httpLogger);
app.onError(ErrorHandler);
app.route('/api', routes);
app.notFound((c) => c.text('Route not found', 404));

const server = serverless(app);

server.listen(port, async (): Promise<void> => {
  try {
      Logger.info(`[Hono-Service] Server is running on port ${port}`);
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

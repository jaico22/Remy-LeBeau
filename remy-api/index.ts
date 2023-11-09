import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { readdir } from "fs/promises";
import { resolve } from "path";
import { IController, Method } from './Core/IController';
import bodyParser from 'body-parser';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;


app.use(bodyParser.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

registerControllers(app);

async function registerControllers(app: express.Express): Promise<void>
{    
    for await (const file of getFiles('.')) {
        if (file.endsWith('.controller.ts') || file.endsWith('.controller.js')) {
          try {
            const controller = (await import(file)).default as IController;
            controller.Endpoints.forEach((endpoint) => {
                console.log(`Registering: ${endpoint.Path}`)
                if (endpoint.Method === Method.POST){
                    app.post(endpoint.Path, (res, resp) => endpoint.Handler(res, resp));
                }
                else if (endpoint.Method === Method.GET){
                    app.get(endpoint.Path, (res, resp) => endpoint.Handler(res, resp))
                }
                else if (endpoint.Method === Method.PUT){
                    app.put(endpoint.Path, (res, resp) => endpoint.Handler(res, resp))
                }
            })

          } catch (ex) {
            // Ignore exceptions from trying to read typescript files. 
            if (!file.endsWith('.ts'))
                throw ex;
          }
        }
    }
}

async function* getFiles(dir: string) : AsyncGenerator<string, any, undefined> {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name) as string;
      if (dirent.isDirectory()) {
        yield* getFiles(res);
      } else if (res) {
        yield res;
      }
    }
  }
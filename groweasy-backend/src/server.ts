import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`GrowEasy CSV Importer backend listening on port ${env.port}`);
});

import { env } from './config/env.js';
import app from './app.js';

const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

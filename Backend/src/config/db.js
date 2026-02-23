import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
// Solo en desarrollo: .env.local sobreescribe variables (ej. FRONTEND_URL).
// En producción (NODE_ENV=production) no se carga .env.local → no afecta el deploy.
if (process.env.NODE_ENV !== 'production') {
  const backendRoot = path.resolve(path.dirname(__dirname), '..');
  dotenv.config({ path: path.join(backendRoot, '.env.local'), override: true });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
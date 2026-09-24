import * as fs from 'fs';
import * as path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...rest] = trimmed.split('=');
        const v = rest.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v;
        }
      }
    }
  }
} catch (e) {}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, school_id')
    .limit(10);
  console.log('Sample profiles:', profiles);

  const { data: studentUsers } = await supabase.auth.admin.listUsers();
  const students = studentUsers.users.filter(u => u.email?.includes('student') || u.email?.includes('priy.2026'));
  console.log('Sample student auth users (first 5):', students.slice(0, 5).map(u => ({ id: u.id, email: u.email })));
}

main().catch(console.error);

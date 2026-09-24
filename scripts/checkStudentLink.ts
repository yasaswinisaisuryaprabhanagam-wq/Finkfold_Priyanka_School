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
  const { data: studentUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const studentEmails = studentUsers.users.map(u => ({ id: u.id, email: u.email }));
  console.log('Total auth users:', studentEmails.length);
  const demoStudent = studentEmails.find(u => u.email?.includes('student') || u.email?.includes('001'));
  console.log('Demo or 001 student:', demoStudent);

  if (demoStudent) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', demoStudent.id).maybeSingle();
    console.log('Profile:', prof);
    const { data: student } = await supabase.from('students').select('*').or(`parent_phone.eq.${prof?.phone},admission_no.ilike.%001%`).limit(1).maybeSingle();
    console.log('Student:', student);
  }
}

main().catch(console.error);

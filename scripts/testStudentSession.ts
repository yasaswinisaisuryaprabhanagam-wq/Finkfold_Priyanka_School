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
  const { data: userPage } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const demoAuth = userPage.users.find(u => u.email === 'student@priyanka.school');
  console.log('Demo auth:', demoAuth?.id, demoAuth?.email);

  const { data: demoProfile } = await supabase.from('profiles').select('*').eq('id', demoAuth?.id).single();
  console.log('Demo profile:', demoProfile);

  if (demoProfile) {
    const { data: student } = await supabase
      .from('students')
      .select('id, full_name, admission_no, roll_no, class_id, school_id')
      .eq('school_id', demoProfile.school_id)
      .eq('parent_phone', demoProfile.phone)
      .maybeSingle();

    console.log('Resolved student by parent_phone:', student);
  }

  // Also test student with admission email like priy.2026.031@priyanka.school
  const sampleStudentAuth = userPage.users.find(u => u.email === 'priy.2026.031@priyanka.school');
  console.log('Sample student auth:', sampleStudentAuth?.id, sampleStudentAuth?.email);
  if (sampleStudentAuth) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', sampleStudentAuth.id).single();
    console.log('Profile for priy.2026.031:', prof);
    const { data: s } = await supabase.from('students').select('*').eq('admission_no', 'PRIY-2026-031').single();
    console.log('Student PRIY-2026-031:', s?.id, s?.full_name);
  }
}

main().catch(console.error);

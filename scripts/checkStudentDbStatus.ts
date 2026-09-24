import * as fs from 'fs';
import * as path from 'path';

// 1. Load .env.local manually
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
} catch (e) {
  console.warn('Could not load .env.local:', e);
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: schools } = await supabase.from('schools').select('id, name');
  console.log('Schools in DB:', schools);

  const { data: students } = await supabase.from('students').select('id, full_name, admission_no, school_id').limit(3);
  console.log('Sample students:', students);

  const tables = [
    'anonymous_grievance_reports',
    'lost_and_found_items',
    'student_transport_subscriptions',
    'student_leaves_and_od',
    'campus_store_orders',
    'student_elective_bids',
    'digital_outpasses',
    'support_tickets',
    'student_medical_records',
    'student_digital_certificates',
    'external_achievements_dropbox',
    'student_id_photo_submissions',
    'class_timetable_slots',
    'exam_assessments',
    'student_exam_marks'
  ];

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`Table ${t}: count = ${count}, error = ${error?.message || 'none'}`);
  }
}

main().catch(console.error);

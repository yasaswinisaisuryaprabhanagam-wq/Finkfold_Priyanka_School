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
  const { data: stu } = await supabase.from('students').select('id, school_id, full_name').limit(1).single();
  console.log('Testing with student:', stu);

  // Test 1: Transport subscription with onConflict
  const res1 = await supabase.from('student_transport_subscriptions').upsert(
    {
      school_id: stu.school_id,
      student_id: stu.id,
      route_id: 'route-04',
      route_number: 'Route 04',
      stop_id: 's-04-3',
      stop_name: 'Santhi Nagar Circle',
      term_fee: 4800,
      boarding_pass_qr: 'QR-TEST-' + Date.now(),
      opted_out_today: false,
    },
    { onConflict: 'school_id,student_id' }
  );
  console.log('Test 1 (Transport upsert):', res1.error ? res1.error.message : 'SUCCESS');

  // Test 2: Grievance insert
  const res2 = await supabase.from('anonymous_grievance_reports').insert({
    school_id: stu.school_id,
    tracking_token: 'GRV-' + Date.now(),
    category: 'bullying',
    description: 'Bullying reported in corridor',
    urgency: 'high',
    status: 'received'
  });
  console.log('Test 2 (Grievance insert):', res2.error ? res2.error.message : 'SUCCESS');

  // Test 3: Lost and found item claim
  // First insert an item so there's something to claim
  const { data: lfItem, error: lfErr } = await supabase.from('lost_and_found_items').insert({
    school_id: stu.school_id,
    title: 'Blue Water Bottle',
    category: 'bottle',
    description: 'Stainless steel bottle',
    found_location: 'Playground',
    locker_bin: 'Bin 1',
    status: 'available'
  }).select().single();
  console.log('Test 3a (LF item insert):', lfErr ? lfErr.message : 'SUCCESS, ID=' + lfItem?.id);

  if (lfItem) {
    const res3b = await supabase.from('lost_and_found_items').update({
      status: 'claimed_pending',
      claimed_by_student_id: stu.id,
      claimed_by_student_name: stu.full_name,
      claimed_homeroom: '10-A',
      claim_note: 'Lost during games period'
    }).eq('id', lfItem.id);
    console.log('Test 3b (LF item claim update):', res3b.error ? res3b.error.message : 'SUCCESS');
  }

  // Test 4: Support ticket insert
  const res4 = await supabase.from('support_tickets').insert({
    school_id: stu.school_id,
    student_id: stu.id,
    ticket_number: 'TCK-' + Date.now(),
    category: 'Academics',
    subject: 'Need help with timetable',
    description: 'Period 3 clash',
    priority: 'medium',
    status: 'open'
  });
  console.log('Test 4 (Support ticket insert):', res4.error ? res4.error.message : 'SUCCESS');

  // Test 5: Student leaves insert
  const res5 = await supabase.from('student_leaves_and_od').insert({
    school_id: stu.school_id,
    student_id: stu.id,
    leave_type: 'sick_leave',
    start_date: '2026-09-25',
    end_date: '2026-09-26',
    total_days: 2,
    reason: 'Fever and cold',
    status: 'pending'
  });
  console.log('Test 5 (Leaves insert):', res5.error ? res5.error.message : 'SUCCESS');

  // Test 6: Digital outpass insert
  const res6 = await supabase.from('digital_outpasses').insert({
    school_id: stu.school_id,
    student_id: stu.id,
    pass_number: 'OUT-' + Date.now(),
    leave_type: 'medical',
    exit_date_time: '2026-09-25 10:00 AM',
    return_date_time: '2026-09-25 04:00 PM',
    companion_name: 'Parent',
    reason: 'Dental checkup',
    gate_pass_qr: 'QR-OUT-' + Date.now(),
    parent_approval: 'approved',
    warden_approval: 'pending'
  });
  console.log('Test 6 (Digital outpass insert):', res6.error ? res6.error.message : 'SUCCESS');

  // Test 7: Store order insert
  const res7 = await supabase.from('campus_store_orders').insert({
    school_id: stu.school_id,
    student_id: stu.id,
    order_number: 'ORD-' + Date.now(),
    items: [{ id: 'item-1', name: 'Uniform Shirt', price: 450, quantity: 1 }],
    total_amount: 450,
    status: 'packing',
    pickup_pass_qr: 'QR-ORD-' + Date.now(),
    pickup_slot: 'After School (3:30 PM)'
  });
  console.log('Test 7 (Campus store order insert):', res7.error ? res7.error.message : 'SUCCESS');

  // Test 8: Elective bids upsert
  const res8 = await supabase.from('student_elective_bids').upsert({
    school_id: stu.school_id,
    student_id: stu.id,
    first_language: 'Sanskrit',
    second_language: 'Hindi',
    third_language: 'French',
    enrolled_clubs: ['club-robotics'],
    waitlisted_clubs: [],
    event_registrations: {}
  });
  console.log('Test 8 (Electives upsert):', res8.error ? res8.error.message : 'SUCCESS');

  // Test 9: External achievements insert
  const res9 = await supabase.from('external_achievements_dropbox').insert({
    school_id: stu.school_id,
    student_id: stu.id,
    title: 'State Science Olympiad',
    organizing_body: 'AP Science Academy',
    competition_level: 'State',
    event_date: '2026-09-10',
    award_secured: '1st Place Gold Medal',
    proof_document_name: 'science_cert.pdf',
    status: 'pending_principal_approval'
  });
  console.log('Test 9 (External achievements insert):', res9.error ? res9.error.message : 'SUCCESS');

  // Test 10: ID photo submission insert
  const res10 = await supabase.from('student_id_photo_submissions').insert({
    school_id: stu.school_id,
    student_id: stu.id,
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    status: 'pending_review',
    compliance_meta: { background: 'white', face_detected: true }
  });
  console.log('Test 10 (ID photo submission insert):', res10.error ? res10.error.message : 'SUCCESS');

  // Test 11: Student medical records upsert
  const res11 = await supabase.from('student_medical_records').upsert({
    school_id: stu.school_id,
    student_id: stu.id,
    blood_group: 'O +ve',
    emergency_contact_name: 'Sri Goud (Father)',
    emergency_contact_phone: '+91 9440266743',
    known_allergies: ['Peanuts'],
    chronic_conditions: ['Mild asthma'],
    pediatrician_name: 'Dr. K. S. Murthy',
    pediatrician_phone: '+91 98480 91823'
  });
  console.log('Test 11 (Medical records upsert):', res11.error ? res11.error.message : 'SUCCESS');
}

main().catch(console.error);

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
  console.log('--- SEEDING STUDENT PORTAL DATABASE DATA ---');

  // 1. Get Main Campus School & Academic Year
  const { data: school } = await supabase
    .from('schools')
    .select('id, name')
    .eq('slug', 'priyanka-em-school')
    .single();

  const schoolId = school.id;
  console.log('School:', school.name, schoolId);

  const { data: academicYear } = await supabase
    .from('academic_years')
    .select('id, name')
    .eq('school_id', schoolId)
    .limit(1)
    .maybeSingle();

  const academicYearId = academicYear?.id;

  // 2. Get Class 10 (or Class 10-A)
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, section')
    .eq('school_id', schoolId);

  const class10 = classes.find(c => c.name === '10') || classes[0];
  console.log('Target class:', class10?.name, class10?.section, class10?.id);

  // 3. Get Students for Class 10
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, admission_no, roll_no, parent_phone')
    .eq('school_id', schoolId)
    .eq('class_id', class10.id)
    .order('roll_no');

  const mainStudent = students[0];
  console.log('Target student:', mainStudent?.full_name, mainStudent?.admission_no, mainStudent?.id);

  // 4. Get Subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, code')
    .eq('school_id', schoolId);

  console.log('Available subjects:', subjects.map(s => s.name));

  // 5. Get Teachers
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('school_id', schoolId)
    .eq('role', 'teacher');

  console.log('Available teachers:', teachers.length);

  // ── SEED A: LOST AND FOUND ITEMS ──────────────────────────────────────────
  console.log('\n[A] Seeding Lost and Found Items...');
  await supabase.from('lost_and_found_items').delete().eq('school_id', schoolId);
  const lostItems = [
    {
      school_id: schoolId,
      title: 'Navy Blue School Cardigan / Winter Blazer',
      category: 'clothing',
      description: "Size 32 standard uniform woolen blazer with embroidered school badge on left chest pocket. 'Arjun' written in faint ballpoint inside collar tag.",
      found_location: 'Senior Quadrangle / Cricket Pavilion Bench',
      found_date: '2026-09-17',
      locker_bin: 'Bin A-04 (Reception Store)',
      photo_emoji: '🧥',
      status: 'available',
    },
    {
      school_id: schoolId,
      title: 'Milton Insulated Stainless Steel Water Bottle (Black)',
      category: 'bottle',
      description: '750ml black matte vacuum flask with a yellow solar-system sticker on the lid.',
      found_location: 'Physics Laboratory • Table 3',
      found_date: '2026-09-16',
      locker_bin: 'Bin B-12 (Reception Store)',
      photo_emoji: '🍶',
      status: 'available',
    },
    {
      school_id: schoolId,
      title: 'Casio Youth Digital Sports Watch (Grey/Teal)',
      category: 'watch',
      description: 'Water-resistant resin band watch, 12/24hr stopwatch mode, alarm set for 06:30 AM.',
      found_location: 'Basketball Court Bleachers',
      found_date: '2026-09-15',
      locker_bin: 'Locker Safe #02',
      photo_emoji: '⌚',
      status: 'claimed_pending',
      claimed_by_student_id: mainStudent.id,
      claimed_by_student_name: mainStudent.full_name,
      claimed_homeroom: `Class ${class10.name}-${class10.section}`,
      claim_note: 'Lost during sports period on Tuesday.',
    },
    {
      school_id: schoolId,
      title: 'Camlin Geometry Box & Math Formula Journal',
      category: 'books_stationery',
      description: 'Transparent compass box with set squares, protractor, and a 60-page grid formula handbook.',
      found_location: 'Mathematics Wing • Corridor Lockers',
      found_date: '2026-09-14',
      locker_bin: 'Bin C-01',
      photo_emoji: '📐',
      status: 'available',
    },
    {
      school_id: schoolId,
      title: 'Prescription Glasses with Black Matte Frame',
      category: 'accessories',
      description: 'Fastrack anti-glare reading glasses in a hard blue snap case.',
      found_location: 'Library Reading Room #2',
      found_date: '2026-09-13',
      locker_bin: 'Bin A-02 (Reception Desk)',
      photo_emoji: '👓',
      status: 'available',
    },
    {
      school_id: schoolId,
      title: 'Wildcraft Insulated Thermal Lunch Bag',
      category: 'accessories',
      description: 'Olive green lunch tote with steel tiffin boxes and fruit fork inside.',
      found_location: 'Dining Hall • Table 14',
      found_date: '2026-09-12',
      locker_bin: 'Bin D-05',
      photo_emoji: '🍱',
      status: 'available',
    },
  ];

  const { error: lfErr } = await supabase.from('lost_and_found_items').insert(lostItems);
  if (lfErr) console.error('Error inserting lost_and_found_items:', lfErr);
  else console.log('✓ Inserted 6 Lost & Found items with valid UUIDs.');

  // ── SEED B: CLASS TIMETABLE SLOTS ──────────────────────────────────────────
  console.log('\n[B] Seeding Class Timetable Slots (Class 10)...');
  await supabase.from('class_timetable_slots').delete().eq('class_id', class10.id);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periodSchedule = [
    { period: 1, start: '08:30', end: '09:15', room: 'Room 204' },
    { period: 2, start: '09:15', end: '10:00', room: 'Room 204' },
    { period: 3, start: '10:15', end: '11:00', room: 'Room 204' },
    { period: 4, start: '11:00', end: '11:45', room: 'Room 204' },
    { period: 5, start: '12:30', end: '01:15', room: 'Room 204' },
    { period: 6, start: '01:15', end: '02:00', room: 'Lab 1' },
    { period: 7, start: '02:15', end: '03:00', room: 'Tech Lab' },
  ];

  const slotsToInsert: any[] = [];
  days.forEach((day, dIdx) => {
    periodSchedule.forEach((p, pIdx) => {
      const sub = subjects[(dIdx + pIdx) % subjects.length];
      const tchr = teachers[(dIdx + pIdx) % teachers.length];
      slotsToInsert.push({
        school_id: schoolId,
        class_id: class10.id,
        subject_id: sub?.id || null,
        teacher_id: tchr?.id || null,
        day_of_week: day,
        period_number: p.period,
        start_time: p.start,
        end_time: p.end,
        room_number: p.period === 6 ? 'Science Lab 1' : p.period === 7 ? 'Comp Lab' : 'Room 204',
        is_lab_period: p.period >= 6,
      });
    });
  });

  const { error: slotErr } = await supabase.from('class_timetable_slots').insert(slotsToInsert);
  if (slotErr) console.error('Error inserting class_timetable_slots:', slotErr);
  else console.log(`✓ Inserted ${slotsToInsert.length} Timetable slots across 6 days for Class 10.`);

  // ── SEED C: EXAM ASSESSMENTS & STUDENT EXAM MARKS (Weekly, SA, FA) ──────
  console.log('\n[C] Seeding Exam Assessments & Marks...');
  await supabase.from('exam_assessments').delete().eq('school_id', schoolId);

  const assessments = [
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Summative Assessment 1 (SA-1)',
      term: 'Term 1',
      start_date: '2026-09-10',
      end_date: '2026-09-18',
      is_published: true,
      is_board_exam: false,
    },
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Formative Assessment 2 (FA-2)',
      term: 'Term 1',
      start_date: '2026-08-15',
      end_date: '2026-08-20',
      is_published: true,
      is_board_exam: false,
    },
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Formative Assessment 1 (FA-1)',
      term: 'Term 1',
      start_date: '2026-07-08',
      end_date: '2026-07-12',
      is_published: true,
      is_board_exam: false,
    },
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Weekly Chapter Test 1: Real Numbers & Polynomials',
      term: 'Term 1',
      start_date: '2026-07-22',
      end_date: '2026-07-22',
      is_published: true,
      is_board_exam: false,
    },
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Weekly Chapter Test 2: Chemical Reactions & Equations',
      term: 'Term 1',
      start_date: '2026-07-29',
      end_date: '2026-07-29',
      is_published: true,
      is_board_exam: false,
    },
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Weekly Chapter Test 3: Quadratic Equations & AP',
      term: 'Term 1',
      start_date: '2026-08-05',
      end_date: '2026-08-05',
      is_published: true,
      is_board_exam: false,
    },
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Weekly Chapter Test 4: Light Reflection & Refraction',
      term: 'Term 1',
      start_date: '2026-08-12',
      end_date: '2026-08-12',
      is_published: true,
      is_board_exam: false,
    },
    {
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: 'Weekly Chapter Test 5: Life Processes & Respiration',
      term: 'Term 1',
      start_date: '2026-08-26',
      end_date: '2026-08-26',
      is_published: true,
      is_board_exam: false,
    },
  ];

  const { data: createdExams, error: examErr } = await supabase
    .from('exam_assessments')
    .insert(assessments)
    .select();

  if (examErr) console.error('Error inserting exam_assessments:', examErr);
  else console.log(`✓ Inserted ${createdExams.length} Exam Assessments (including 5 Weekly Tests).`);

  if (createdExams && createdExams.length > 0) {
    const marksRows: any[] = [];
    const mainTeacher = teachers[0];

    for (const exam of createdExams) {
      for (const sub of subjects) {
        const isWeekly = exam.name.startsWith('Weekly');
        const maxMarks = isWeekly ? 25 : exam.name.startsWith('Formative') ? 50 : 100;
        const marksObtained = isWeekly ? Math.floor(20 + Math.random() * 5) : Math.floor(maxMarks * 0.85);
        const grade = marksObtained / maxMarks >= 0.9 ? 'A1' : marksObtained / maxMarks >= 0.8 ? 'A2' : 'B1';

        marksRows.push({
          school_id: schoolId,
          exam_id: exam.id,
          student_id: mainStudent.id,
          subject_id: sub.id,
          marks_obtained: marksObtained,
          max_marks: maxMarks,
          grade,
          is_flagged_remedial: marksObtained / maxMarks < 0.75,
          remedial_topic: marksObtained / maxMarks < 0.75 ? `${sub.name} Core Application` : null,
          recorded_by: mainTeacher?.id || null,
        });
      }
    }

    const { error: marksErr } = await supabase.from('student_exam_marks').insert(marksRows);
    if (marksErr) console.error('Error inserting student_exam_marks:', marksErr);
    else console.log(`✓ Inserted ${marksRows.length} Exam Mark records.`);
  }

  // ── SEED D: STUDENT MEDICAL RECORDS ───────────────────────────────────────
  console.log('\n[D] Seeding Student Medical Record...');
  const { data: existingMed } = await supabase
    .from('student_medical_records')
    .select('id')
    .eq('student_id', mainStudent.id)
    .maybeSingle();

  const medData = {
    school_id: schoolId,
    student_id: mainStudent.id,
    blood_group: 'B +ve',
    height_cm: 152,
    weight_kg: 44,
    known_allergies: ['Peanuts & Tree Nuts', 'Penicillin Sensitivity'],
    chronic_conditions: ['Mild seasonal bronchial asthma'],
    pediatrician_name: 'Dr. K. S. Murthy, M.D.',
    pediatrician_phone: '+91 98480 91823',
    emergency_contact_name: 'Sri Sharma garu (Father)',
    emergency_contact_phone: '+91 9848000001',
    updated_at: new Date().toISOString(),
  };

  if (existingMed) {
    await supabase.from('student_medical_records').update(medData).eq('id', existingMed.id);
  } else {
    await supabase.from('student_medical_records').insert(medData);
  }
  console.log('✓ Student Medical Record successfully seeded.');

  // ── SEED E: STUDENT DIGITAL CERTIFICATES ──────────────────────────────────
  console.log('\n[E] Seeding Verifiable Student Digital Certificates...');
  await supabase.from('student_digital_certificates').delete().eq('student_id', mainStudent.id);

  const certs = [
    {
      school_id: schoolId,
      student_id: mainStudent.id,
      certificate_number: 'CERT-2026-MAT-0182',
      title: 'State Mathematics Olympiad • First Class Distinction',
      event_name: 'Andhra Pradesh State Mathematics Olympiad 2026',
      award_rank: 'First Class Distinction (Top 1%)',
      category: 'academic',
      date_issued: '2026-08-15',
      recipient_name: mainStudent.full_name,
      class_grade: `Class ${class10.name}-${class10.section}`,
      qr_verification_hash: 'FINK-VEC-AP-2026-881249A',
      signatory: 'Dr. K. Radhika Devi, Principal',
    },
    {
      school_id: schoolId,
      student_id: mainStudent.id,
      certificate_number: 'CERT-2026-ROB-0044',
      title: 'National AI & Robotics Innovation Showcase Winner',
      event_name: 'CBSE Regional Science & AI Exhibition',
      award_rank: 'Gold Laureate & Best Innovation Trophy',
      category: 'stem',
      date_issued: '2026-07-28',
      recipient_name: mainStudent.full_name,
      class_grade: `Class ${class10.name}-${class10.section}`,
      qr_verification_hash: 'FINK-VEC-CBSE-ROB-99120',
      signatory: 'Prof. S. Ranganathan, Chief Science Officer',
    },
    {
      school_id: schoolId,
      student_id: mainStudent.id,
      certificate_number: 'CERT-2026-SPO-0312',
      title: 'Inter-School Junior Badminton Championship',
      event_name: 'District Sahodaya Sports Meet 2026',
      award_rank: 'Runner Up (Silver Medal)',
      category: 'sports',
      date_issued: '2026-06-20',
      recipient_name: mainStudent.full_name,
      class_grade: `Class ${class10.name}-${class10.section}`,
      qr_verification_hash: 'FINK-VEC-DIST-SPO-77412',
      signatory: 'Coach R. Babu, Director of Physical Education',
    },
  ];

  const { error: certErr } = await supabase.from('student_digital_certificates').insert(certs);
  if (certErr) console.error('Error inserting certificates:', certErr);
  else console.log(`✓ Inserted ${certs.length} Digital Certificates.`);

  // ── SEED F: STUDENT TRANSPORT SUBSCRIPTION ────────────────────────────────
  console.log('\n[F] Seeding Student Transport Subscription...');
  const { data: existingSub } = await supabase
    .from('student_transport_subscriptions')
    .select('id')
    .eq('student_id', mainStudent.id)
    .maybeSingle();

  const subData = {
    school_id: schoolId,
    student_id: mainStudent.id,
    route_id: 'route-04',
    route_number: 'Route 04',
    stop_id: 's-04-3',
    stop_name: 'Santhi Nagar Circle',
    term_fee: 4800,
    boarding_pass_qr: `QR-BUS-MAIN-${mainStudent.admission_no}`,
    opted_out_today: false,
    last_boarded_at: '2026-09-24T08:04:00Z',
    updated_at: new Date().toISOString(),
  };

  if (existingSub) {
    await supabase.from('student_transport_subscriptions').update(subData).eq('id', existingSub.id);
  } else {
    await supabase.from('student_transport_subscriptions').insert(subData);
  }
  console.log('✓ Transport Subscription seeded.');

  // ── SEED G: STUDENT ELECTIVE BIDS ─────────────────────────────────────────
  console.log('\n[G] Seeding Student Elective Bids...');
  const { data: existingBid } = await supabase
    .from('student_elective_bids')
    .select('id')
    .eq('student_id', mainStudent.id)
    .maybeSingle();

  const bidData = {
    school_id: schoolId,
    student_id: mainStudent.id,
    first_language: 'Sanskrit',
    second_language: 'Hindi',
    third_language: 'French',
    enrolled_clubs: ['club-robotics', 'club-astronomy'],
    waitlisted_clubs: ['club-debate'],
    event_registrations: { 'annual-day-skit': 'lead-role', 'science-fair': 'solar-distillation-model' },
    updated_at: new Date().toISOString(),
  };

  if (existingBid) {
    await supabase.from('student_elective_bids').update(bidData).eq('id', existingBid.id);
  } else {
    await supabase.from('student_elective_bids').insert(bidData);
  }
  console.log('✓ Elective Bids seeded.');

  console.log('\n=============================================');
  console.log('🎉 ALL STUDENT PORTAL DATA SEEDED SUCCESSFULLY!');
  console.log('=============================================');
}

main().catch(console.error);

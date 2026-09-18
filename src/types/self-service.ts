// ==============================================================================
// FINKFOLD EdOS — SELF-SERVICE HUB SHARED TYPES & CONSTANTS
// Path: src/types/self-service.ts
// (Kept separate from "use server" action files to satisfy Next.js Server Actions rules)
// ==============================================================================

// ── 1. Smart Transport & Commute ──────────────────────────────────────────────
export interface BusStop {
  id: string;
  name: string;
  pickupTime: string;
  dropTime: string;
  distanceKm: number;
  termFee: number;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentBoarded: number;
  currentGps: { lat: number; lng: number; speedKmH: number; heading: string };
  currentStopIndex: number;
  stops: BusStop[];
}

export interface StudentTransportState {
  isSubscribed: boolean;
  activeRouteId?: string;
  activeStopId?: string;
  boardingPassQr: string;
  optedOutToday: boolean;
  optOutReason?: string;
  lastBoardedAt?: string;
}

export const INITIAL_ROUTES: BusRoute[] = [
  {
    id: "route-04",
    routeNumber: "Route 04",
    routeName: "Santhi Nagar • Current Office • Fathekhan Pet",
    busNumber: "AP 26 TE 4821",
    driverName: "K. Venkateshwarlu",
    driverPhone: "+91 98480 23145",
    capacity: 42,
    currentBoarded: 29,
    currentGps: { lat: 14.4426, lng: 79.9865, speedKmH: 34, heading: "North-West" },
    currentStopIndex: 2,
    stops: [
      { id: "s-04-1", name: "Magunta Layout Water Tank", pickupTime: "07:35 AM", dropTime: "04:30 PM", distanceKm: 4.2, termFee: 3800 },
      { id: "s-04-2", name: "Current Office Junction", pickupTime: "07:48 AM", dropTime: "04:18 PM", distanceKm: 6.8, termFee: 4200 },
      { id: "s-04-3", name: "Santhi Nagar Circle", pickupTime: "08:02 AM", dropTime: "04:05 PM", distanceKm: 8.5, termFee: 4800 },
      { id: "s-04-4", name: "Fathekhan Pet Main School Gate", pickupTime: "08:20 AM", dropTime: "03:50 PM", distanceKm: 11.0, termFee: 5200 },
    ],
  },
  {
    id: "route-07",
    routeNumber: "Route 07",
    routeName: "Trunk Road • VRC Centre • Gandhi Nagar Branch",
    busNumber: "AP 26 TE 9104",
    driverName: "M. Subrahmanyam",
    driverPhone: "+91 94401 77823",
    capacity: 40,
    currentBoarded: 35,
    currentGps: { lat: 14.4501, lng: 79.9922, speedKmH: 28, heading: "South" },
    currentStopIndex: 1,
    stops: [
      { id: "s-07-1", name: "Trunk Road Clock Tower", pickupTime: "07:30 AM", dropTime: "04:35 PM", distanceKm: 5.1, termFee: 4000 },
      { id: "s-07-2", name: "VRC Commercial Centre", pickupTime: "07:45 AM", dropTime: "04:20 PM", distanceKm: 7.4, termFee: 4500 },
      { id: "s-07-3", name: "Atmakur Bus Stand Cross", pickupTime: "08:00 AM", dropTime: "04:05 PM", distanceKm: 9.8, termFee: 5000 },
      { id: "s-07-4", name: "Priyanka Campus Main Gate", pickupTime: "08:20 AM", dropTime: "03:45 PM", distanceKm: 12.5, termFee: 5500 },
    ],
  },
  {
    id: "route-12",
    routeNumber: "Route 12",
    routeName: "Haranathpuram • Vedayapalem • Main Campus",
    busNumber: "AP 26 TE 3319",
    driverName: "P. Ramaniah",
    driverPhone: "+91 98492 65431",
    capacity: 45,
    currentBoarded: 18,
    currentGps: { lat: 14.4289, lng: 79.9741, speedKmH: 42, heading: "North" },
    currentStopIndex: 0,
    stops: [
      { id: "s-12-1", name: "Vedayapalem Railway Bridge", pickupTime: "07:25 AM", dropTime: "04:40 PM", distanceKm: 7.0, termFee: 4600 },
      { id: "s-12-2", name: "Haranathpuram Sai Baba Temple", pickupTime: "07:42 AM", dropTime: "04:22 PM", distanceKm: 9.5, termFee: 5100 },
      { id: "s-12-3", name: "Children's Park Road", pickupTime: "08:00 AM", dropTime: "04:05 PM", distanceKm: 11.2, termFee: 5400 },
      { id: "s-12-4", name: "Priyanka EM School Gate", pickupTime: "08:22 AM", dropTime: "03:45 PM", distanceKm: 13.8, termFee: 5800 },
    ],
  },
];

// ── 2. Campus E-Commerce & Store ──────────────────────────────────────────────
export interface StoreItem {
  id: string;
  name: string;
  category: "uniform" | "books" | "shoes" | "stationery";
  description: string;
  priceInr: number;
  pointsPrice?: number;
  availableSizes?: string[];
  gradeEligibility: string;
  badge?: string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  items: { itemId: string; name: string; size?: string; qty: number; price: number }[];
  totalAmount: number;
  pointsRedeemed: number;
  status: "packing" | "ready_for_pickup" | "collected";
  pickupPassQr: string;
  pickupSlot: string;
  createdAt: string;
}

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  {
    id: "prod-kit-10",
    name: "Class 10 Complete Academic Kit (2026-27)",
    category: "books",
    description: "Full state syllabus book pack: 14 prescribed textbooks, 10 ruled long notebooks, graph journal & mathematical instruments box.",
    priceInr: 3450,
    pointsPrice: 200,
    gradeEligibility: "Class 10",
    badge: "Bestseller",
  },
  {
    id: "prod-uniform-reg",
    name: "Priyanka High Regular Uniform Set",
    category: "uniform",
    description: "Navy blue pleated skirt/trouser with sky blue formal shirt (embroidered school crest), school belt & navy socks pair.",
    priceInr: 1650,
    pointsPrice: 100,
    availableSizes: ["28 (Small)", "30 (Medium)", "32 (Large)", "34 (XL)", "36 (XXL)"],
    gradeEligibility: "Class 6 – 10",
  },
  {
    id: "prod-uniform-sports",
    name: "Institutional Sports Tracksuit & House Tee",
    category: "uniform",
    description: "Dry-fit moisture-wicking sports tracksuit with house color t-shirt (Red/Blue/Green/Yellow).",
    priceInr: 1200,
    pointsPrice: 80,
    availableSizes: ["28 (Small)", "30 (Medium)", "32 (Large)", "34 (XL)"],
    gradeEligibility: "All Classes",
  },
  {
    id: "prod-shoes-formal",
    name: "Standard School Black Leather Uniform Shoes",
    category: "shoes",
    description: "Orthopedic padded insole, high-traction scuff-resistant rubber outsole compliant with campus dress code.",
    priceInr: 950,
    pointsPrice: 50,
    availableSizes: ["Size 4", "Size 5", "Size 6", "Size 7", "Size 8", "Size 9"],
    gradeEligibility: "All Classes",
  },
  {
    id: "prod-stationery-pack",
    name: "STEM Geometry & Exam Stationery Kit",
    category: "stationery",
    description: "Camlin exam mathematical instruments, transparent clipboard, blue & black gel pens bundle, highlighters.",
    priceInr: 320,
    pointsPrice: 30,
    gradeEligibility: "All Classes",
  },
];

export const INITIAL_ORDERS: StoreOrder[] = [
  {
    id: "ord-01",
    orderNumber: "ORD-PRIY-7821",
    items: [
      { itemId: "prod-kit-10", name: "Class 10 Complete Academic Kit", qty: 1, price: 3450 },
    ],
    totalAmount: 3450,
    pointsRedeemed: 50,
    status: "ready_for_pickup",
    pickupPassQr: "QR-STORE-7821-LUNCH",
    pickupSlot: "Lunch Break (12:45 PM – 01:25 PM) • Counter 2",
    createdAt: "16 Sep 2026",
  },
];

// ── 3. Electives & Extracurricular Bidding ─────────────────────────────────────
export interface ElectiveClub {
  id: string;
  name: string;
  category: "club" | "language" | "sports_event";
  facultyLead: string;
  capacity: number;
  enrolled: number;
  schedule: string;
  room: string;
  description: string;
  isWaitlistOnly?: boolean;
}

export const INITIAL_CLUBS: ElectiveClub[] = [
  {
    id: "club-robotics",
    name: "Robotics & Embedded IoT Lab",
    category: "club",
    facultyLead: "Dr. K. Srinivas (Physics)",
    capacity: 30,
    enrolled: 28,
    schedule: "Tuesday & Thursday • 03:15 PM – 04:15 PM",
    room: "STEM Innovation Hub",
    description: "Arduino microcontrollers, sensor integration, robotic chassis building & regional STEM hackathons.",
  },
  {
    id: "club-debate",
    name: "Debate & Model United Nations (MUN)",
    category: "club",
    facultyLead: "Mrs. Revathi Sundar (English)",
    capacity: 25,
    enrolled: 25,
    schedule: "Wednesday & Friday • 03:15 PM – 04:15 PM",
    room: "Senior AV Hall",
    description: "Parliamentary debate, rhetorical speaking, geopolitics, and inter-school delegate competitions.",
    isWaitlistOnly: true,
  },
  {
    id: "club-coding",
    name: "Young Coders & Python Web Club",
    category: "club",
    facultyLead: "Mr. D. Rajesh (Computer Science)",
    capacity: 35,
    enrolled: 30,
    schedule: "Monday & Thursday • 03:15 PM – 04:15 PM",
    room: "Computer Lab 1",
    description: "Algorithmic thinking in Python, web creation with HTML/CSS, game development & logic puzzles.",
  },
  {
    id: "club-music",
    name: "Carnatic Vocal & Classical Instrumental",
    category: "club",
    facultyLead: "Smt. Shanti Priya (Fine Arts)",
    capacity: 30,
    enrolled: 19,
    schedule: "Tuesday & Friday • 03:15 PM – 04:15 PM",
    room: "Cultural Auditorium",
    description: "Vocal swarams, harmonium, mridangam, violin foundations and annual cultural day ensemble.",
  },
];

export const INITIAL_EVENTS = [
  {
    id: "event-sports-2026",
    title: "Annual Inter-House Sports Championship 2026",
    date: "14 October 2026",
    venue: "Main Campus Athletic Grounds",
    categories: ["100m Sprint", "400m Race", "4x100m Relay", "Long Jump", "Shot Put"],
  },
  {
    id: "event-science-fair",
    title: "Nellore District Science & Innovation Fair",
    date: "28 November 2026",
    venue: "STEM Exhibition Arena",
    categories: ["Renewable Energy Models", "AI in Agriculture", "Clean Water Solutions", "Smart Mobility"],
  },
];

// ── 4. Digital Out-Pass & Mess Menu ───────────────────────────────────────────
export interface OutPassRequest {
  id: string;
  passNumber: string;
  leaveType: "weekend_home" | "medical" | "day_outing";
  exitDateTime: string;
  returnDateTime: string;
  companionName: string;
  reason: string;
  parentApproval: "approved" | "pending" | "rejected";
  wardenApproval: "approved" | "pending" | "rejected";
  gateExitScannedAt?: string;
  gateReturnScannedAt?: string;
  gatePassQr: string;
  createdAt: string;
}

export interface MessDayMenu {
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  specialBadge?: string;
}

export const INITIAL_MESS_MENU: MessDayMenu[] = [
  {
    day: "Monday",
    breakfast: "Idli, Sambar, Coconut Chutney & Boiled Eggs / Banana",
    lunch: "South Indian Thali: Rice, Dal Tadka, Bendakaya Fry, Rasam & Curd",
    snacks: "Sweet Corn Chaat & Hot Milk / Boost",
    dinner: "Chapati, Paneer Butter Masala, Jeera Rice & Gulab Jamun",
  },
  {
    day: "Tuesday",
    breakfast: "Puri with Potato Kurma & Fresh Cut Papaya",
    lunch: "Vegetable Pulao, Mirchi Ka Salan, Onion Raitha & Appalam",
    snacks: "Aloo Samosa & Masala Tea / Milk",
    dinner: "Phulka, Mixed Vegetable Korma, Steamed Rice & Dal",
  },
  {
    day: "Wednesday",
    breakfast: "Mysore Bonda with Ginger Chutney & Upma",
    lunch: "Lemon Rice, Potato Roast, Sambar, Curd & Papad",
    snacks: "Veg Puff & Badam Milk",
    dinner: "Ghee Rice, Dal Makhani, Phulka & Fruit Custard",
    specialBadge: "Chef Special",
  },
  {
    day: "Thursday",
    breakfast: "Poha with Roasted Peanuts & Boiled Sprouts",
    lunch: "Tomato Rice, Dondakaya Fry, Rasam, Curd & Pickle",
    snacks: "Biscuits, Banana & Hot Horlicks",
    dinner: "Veg Hakka Noodles, Gobi Manchurian & Hot Soup",
  },
  {
    day: "Friday",
    breakfast: "Uttapam with Onion & Tomato, Coconut Chutney",
    lunch: "Bagara Rice, Meal Maker Curry, Sambar & Fresh Curd",
    snacks: "Pani Puri / Bhel Puri & Lemonade",
    dinner: "Hyderabadi Veg Dum Biryani, Mirchi Ka Salan & Raitha",
    specialBadge: "Weekly Feast",
  },
];

export const INITIAL_OUTPASSES: OutPassRequest[] = [
  {
    id: "pass-01",
    passNumber: "OP-PRIY-2026-8812",
    leaveType: "weekend_home",
    exitDateTime: "Friday, 20 Sep • 04:30 PM",
    returnDateTime: "Sunday, 22 Sep • 06:00 PM",
    companionName: "Sri Goud (Father)",
    reason: "Family function in Santhi Nagar, Nellore.",
    parentApproval: "approved",
    wardenApproval: "approved",
    gatePassQr: "QR-GATE-OP-8812",
    createdAt: "17 Sep 2026",
  },
];

// ── 5. Zero-Visit Support Helpdesk ────────────────────────────────────────────
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: "Transport" | "Accounts & Fees" | "Academics" | "ID Card & Records";
  subject: string;
  description: string;
  priority: "low" | "medium" | "urgent";
  status: "open" | "in_progress" | "resolved";
  slaRemainingHours: number;
  assignedDept: string;
  createdAt: string;
}

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tick-01",
    ticketNumber: "TICK-2026-104",
    category: "Accounts & Fees",
    subject: "Request for Section 80C Employer Format Annexure",
    description: "Need school's official registration certificate attached alongside Term 1 tuition fee receipt for company HRA/tax declaration.",
    priority: "medium",
    status: "in_progress",
    slaRemainingHours: 14,
    assignedDept: "Central Accounts Desk",
    createdAt: "16 Sep 2026",
  },
  {
    id: "tick-02",
    ticketNumber: "TICK-2026-089",
    category: "Transport",
    subject: "Change of Evening Drop Stop to Santhi Nagar Main",
    description: "Child will be dropped at grandfather's house on Tuesdays and Thursdays. Bus Route 04 driver has been informed verbally.",
    priority: "low",
    status: "resolved",
    slaRemainingHours: 0,
    assignedDept: "Transport Fleet Office",
    createdAt: "12 Sep 2026",
  },
];

// ── 6. Student Health & Medical Vault ─────────────────────────────────────────
export interface InfirmaryLog {
  id: string;
  visitDate: string;
  visitTime: string;
  nurseName: string;
  symptoms: string;
  vitals: { tempF: string; pulseBpm: string };
  medicationGiven: string;
  outcome: string;
  parentAlertDispatched: boolean;
}

export interface StudentMedicalProfile {
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  knownAllergies: string[];
  chronicConditions: string[];
  pediatricianName: string;
  pediatricianPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export const INITIAL_MEDICAL_PROFILE: StudentMedicalProfile = {
  bloodGroup: "B +ve",
  heightCm: 142,
  weightKg: 38,
  knownAllergies: ["Peanuts & Tree Nuts", "Penicillin Sensitivity"],
  chronicConditions: ["Mild seasonal bronchial asthma (carries Salbutamol inhaler)"],
  pediatricianName: "Dr. K. S. Murthy, M.D. (Pediatrics)",
  pediatricianPhone: "+91 98480 91823",
  emergencyContactName: "Sri Goud garu (Father)",
  emergencyContactPhone: "+91 9440266743",
};

export const INITIAL_INFIRMARY_LOGS: InfirmaryLog[] = [
  {
    id: "inf-01",
    visitDate: "14 Sep 2026",
    visitTime: "11:15 AM",
    nurseName: "Sister Anitha, GNM",
    symptoms: "Mild fever, frontal headache following sports period",
    vitals: { tempF: "99.4 °F", pulseBpm: "78 bpm" },
    medicationGiven: "Paracetamol 250mg syrup + Electral ORS hydration",
    outcome: "Rested for 35 mins in infirmary bed #2. Fever stabilized at 98.6°F. Returned to class at 11:55 AM.",
    parentAlertDispatched: true,
  },
  {
    id: "inf-02",
    visitDate: "28 Aug 2026",
    visitTime: "02:20 PM",
    nurseName: "Sister Anitha, GNM",
    symptoms: "Superficial knee scrape while playing basketball on court",
    vitals: { tempF: "Normal", pulseBpm: "84 bpm" },
    medicationGiven: "Antiseptic Betadine wash + sterile adhesive dressing",
    outcome: "Dressing applied. Advised not to run in sand pit. Resumed regular class.",
    parentAlertDispatched: false,
  },
];

// ── 7. Digital Lost & Found Board ─────────────────────────────────────────────
export interface LostFoundItem {
  id: string;
  title: string;
  category: "clothing" | "bottle" | "watch" | "books_stationery" | "accessories" | "other";
  description: string;
  foundLocation: string;
  foundDate: string;
  lockerBin: string;
  photoEmoji: string;
  status: "available" | "claimed_pending" | "returned";
  claimedByStudentName?: string;
  claimedHomeroom?: string;
  claimNote?: string;
}

export const INITIAL_LOST_FOUND_ITEMS: LostFoundItem[] = [
  {
    id: "lf-01",
    title: "Navy Blue School Cardigan / Winter Blazer",
    category: "clothing",
    description: "Size 32 standard uniform woolen blazer with embroidered school badge on left chest pocket. 'Arjun' written in faint ballpoint inside collar tag.",
    foundLocation: "Senior Quadrangle / Cricket Pavilion Bench",
    foundDate: "17 Sep 2026",
    lockerBin: "Bin A-04 (Reception Store)",
    photoEmoji: "🧥",
    status: "available",
  },
  {
    id: "lf-02",
    title: "Milton Insulated Stainless Steel Water Bottle (Black)",
    category: "bottle",
    description: "750ml black matte vacuum flask with a yellow solar-system sticker on the lid.",
    foundLocation: "Physics Laboratory • Table 3",
    foundDate: "16 Sep 2026",
    lockerBin: "Bin B-12 (Reception Store)",
    photoEmoji: "🍶",
    status: "available",
  },
  {
    id: "lf-03",
    title: "Casio Youth Digital Sports Watch (Grey/Teal)",
    category: "watch",
    description: "Water-resistant resin band watch, 12/24hr stopwatch mode, alarm set for 06:30 AM.",
    foundLocation: "Basketball Court Bleachers",
    foundDate: "15 Sep 2026",
    lockerBin: "Locker Safe #02",
    photoEmoji: "⌚",
    status: "claimed_pending",
    claimedByStudentName: "Arjun Reddy",
    claimedHomeroom: "Class 10-A",
    claimNote: "Lost during sports period on Tuesday.",
  },
  {
    id: "lf-04",
    title: "Camlin Geometry Box & Math Formula Journal",
    category: "books_stationery",
    description: "Metal tin geometry box with compass, divider, and handwritten Class 10 Trigonometry cheat-sheet inside.",
    foundLocation: "Library Reading Room • Row 4",
    foundDate: "14 Sep 2026",
    lockerBin: "Bin C-01",
    photoEmoji: "📐",
    status: "available",
  },
  {
    id: "lf-05",
    title: "Black Rim Eyeglasses in Blue Hard Case",
    category: "accessories",
    description: "Prescription anti-glare glasses with blue Fastrack hard shell case.",
    foundLocation: "Dining Hall / Central Mess Counter 2",
    foundDate: "12 Sep 2026",
    lockerBin: "Locker Safe #01",
    photoEmoji: "👓",
    status: "available",
  },
];

// ── 8. Multi-Tier Academics & AI Skill & Gap Engine ───────────────────────────
export interface SubjectExamResult {
  subject: string;
  code: string;
  maxMarks: number;
  marksObtained: number;
  classAverage: number;
  grade: string;
  percentile: number;
}

export interface MultiTierExamRecord {
  id: string;
  examName: string;
  examType: "weekly" | "fa" | "sa" | "half_yearly" | "annual";
  term: string;
  date: string;
  overallPercentage: number;
  rankInClass: number;
  totalStudents: number;
  subjects: SubjectExamResult[];
}

export interface EarlierYearMarksArchive {
  academicYear: string;
  classGrade: string;
  annualGpa: string;
  percentage: number;
  attendancePercent: number;
  conductGrade: string;
  keyHonors: string;
}

export interface AiSkillCompetency {
  id: string;
  subject: string;
  topicName: string;
  masteryScore: number; // 0 - 100
  status: "strong" | "developing" | "critical_gap";
  diagnosticSummary: string;
  actionableRecommendation: string;
  remedialWorksheetsAvailable: number;
}

export interface AiWorksheet {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: "Foundation" | "Advanced" | "Targeted Remedial";
  questionsCount: number;
  estimatedMinutes: number;
  status: "generated" | "completed";
}

export const INITIAL_EXAM_RECORDS: MultiTierExamRecord[] = [
  {
    id: "exam-sa-1",
    examName: "Summative Assessment 1 (SA-1)",
    examType: "sa",
    term: "Term 1 (2026-27)",
    date: "12 Sep 2026",
    overallPercentage: 86.4,
    rankInClass: 4,
    totalStudents: 42,
    subjects: [
      { subject: "Mathematics", code: "MAT-10", maxMarks: 100, marksObtained: 88, classAverage: 71, grade: "A1", percentile: 92 },
      { subject: "Physical Science", code: "SCI-10P", maxMarks: 100, marksObtained: 85, classAverage: 69, grade: "A2", percentile: 89 },
      { subject: "Biological Science", code: "SCI-10B", maxMarks: 100, marksObtained: 91, classAverage: 74, grade: "A1", percentile: 96 },
      { subject: "Social Studies", code: "SOC-10", maxMarks: 100, marksObtained: 82, classAverage: 70, grade: "A2", percentile: 84 },
      { subject: "English Language & Lit", code: "ENG-10", maxMarks: 100, marksObtained: 89, classAverage: 76, grade: "A1", percentile: 91 },
      { subject: "Second Language (Telugu)", code: "TEL-10", maxMarks: 100, marksObtained: 83, classAverage: 68, grade: "A2", percentile: 86 },
    ],
  },
  {
    id: "exam-fa-2",
    examName: "Formative Assessment 2 (FA-2)",
    examType: "fa",
    term: "Term 1 (2026-27)",
    date: "18 Aug 2026",
    overallPercentage: 89.0,
    rankInClass: 3,
    totalStudents: 42,
    subjects: [
      { subject: "Mathematics", code: "MAT-10", maxMarks: 50, marksObtained: 46, classAverage: 37, grade: "A1", percentile: 94 },
      { subject: "Physical Science", code: "SCI-10P", maxMarks: 50, marksObtained: 43, classAverage: 35, grade: "A1", percentile: 90 },
      { subject: "Biological Science", code: "SCI-10B", maxMarks: 50, marksObtained: 47, classAverage: 38, grade: "A1", percentile: 97 },
      { subject: "Social Studies", code: "SOC-10", maxMarks: 50, marksObtained: 41, classAverage: 34, grade: "A2", percentile: 86 },
      { subject: "English Language & Lit", code: "ENG-10", maxMarks: 50, marksObtained: 45, classAverage: 39, grade: "A1", percentile: 92 },
      { subject: "Second Language (Telugu)", code: "TEL-10", maxMarks: 50, marksObtained: 45, classAverage: 36, grade: "A1", percentile: 93 },
    ],
  },
  {
    id: "exam-fa-1",
    examName: "Formative Assessment 1 (FA-1)",
    examType: "fa",
    term: "Term 1 (2026-27)",
    date: "10 Jul 2026",
    overallPercentage: 84.8,
    rankInClass: 6,
    totalStudents: 42,
    subjects: [
      { subject: "Mathematics", code: "MAT-10", maxMarks: 50, marksObtained: 41, classAverage: 36, grade: "A2", percentile: 85 },
      { subject: "Physical Science", code: "SCI-10P", maxMarks: 50, marksObtained: 42, classAverage: 34, grade: "A1", percentile: 88 },
      { subject: "Biological Science", code: "SCI-10B", maxMarks: 50, marksObtained: 45, classAverage: 37, grade: "A1", percentile: 93 },
      { subject: "Social Studies", code: "SOC-10", maxMarks: 50, marksObtained: 39, classAverage: 33, grade: "B1", percentile: 80 },
      { subject: "English Language & Lit", code: "ENG-10", maxMarks: 50, marksObtained: 46, classAverage: 38, grade: "A1", percentile: 94 },
      { subject: "Second Language (Telugu)", code: "TEL-10", maxMarks: 50, marksObtained: 41, classAverage: 35, grade: "A2", percentile: 86 },
    ],
  },
];

export const INITIAL_EARLIER_YEARS: EarlierYearMarksArchive[] = [
  {
    academicYear: "2025-26",
    classGrade: "Class 9 - Section A",
    annualGpa: "9.2 / 10.0",
    percentage: 87.5,
    attendancePercent: 94.2,
    conductGrade: "Exemplary",
    keyHonors: "Inter-School Math Olympiad Finalist • Best Junior Debater",
  },
  {
    academicYear: "2024-25",
    classGrade: "Class 8 - Section B",
    annualGpa: "8.9 / 10.0",
    percentage: 85.0,
    attendancePercent: 96.0,
    conductGrade: "Very Good",
    keyHonors: "House Captain Junior Wing • District 100m Silver Medalist",
  },
  {
    academicYear: "2023-24",
    classGrade: "Class 7 - Section A",
    annualGpa: "8.8 / 10.0",
    percentage: 83.6,
    attendancePercent: 92.8,
    conductGrade: "Good",
    keyHonors: "Science Exhibition 1st Prize • Perfect Attendance Term 2",
  },
];

export const INITIAL_SKILL_GAPS: AiSkillCompetency[] = [
  {
    id: "gap-01",
    subject: "Mathematics",
    topicName: "3D Geometry & Mensuration Volume Formulae",
    masteryScore: 46,
    status: "critical_gap",
    diagnosticSummary: "Consistently mixes up frustum curved surface area with hemisphere volume. Lost 9 marks on Question 14 in SA-1.",
    actionableRecommendation: "Needs targeted visualization drills on solid cross-sections before the half-yearly exam.",
    remedialWorksheetsAvailable: 3,
  },
  {
    id: "gap-02",
    subject: "Physical Science",
    topicName: "Ray Optics & Lens Formula Sign Conventions",
    masteryScore: 54,
    status: "developing",
    diagnosticSummary: "Correct ray diagrams but makes algebraic negative sign errors when calculating focal length with concave lenses.",
    actionableRecommendation: "Complete 10-problem Cartesian sign practice worksheet.",
    remedialWorksheetsAvailable: 2,
  },
  {
    id: "gap-03",
    subject: "Mathematics",
    topicName: "Algebraic Polynomials & Quadratic Roots",
    masteryScore: 94,
    status: "strong",
    diagnosticSummary: "Complete conceptual mastery. Solved all advanced discriminant application problems within allotted time.",
    actionableRecommendation: "Advance to Higher-Order Thinking Skills (HOTS) Olympiad problem sets.",
    remedialWorksheetsAvailable: 1,
  },
  {
    id: "gap-04",
    subject: "English",
    topicName: "Formal Letter Writing & Editorial Rhetoric",
    masteryScore: 89,
    status: "strong",
    diagnosticSummary: "Excellent vocabulary and syntax flow with zero grammatical tense shifts.",
    actionableRecommendation: "Focus on concise concluding calls-to-action.",
    remedialWorksheetsAvailable: 1,
  },
];

export const INITIAL_WORKSHEETS: AiWorksheet[] = [
  {
    id: "ws-geo-01",
    title: "3D Geometry Remedial Drill: Frustums & Cones",
    subject: "Mathematics",
    topic: "3D Mensuration",
    difficulty: "Targeted Remedial",
    questionsCount: 12,
    estimatedMinutes: 35,
    status: "generated",
  },
  {
    id: "ws-opt-02",
    title: "Cartesian Lens Sign Convention Mastery Sheet",
    subject: "Physical Science",
    topic: "Optics",
    difficulty: "Foundation",
    questionsCount: 15,
    estimatedMinutes: 30,
    status: "generated",
  },
  {
    id: "ws-alg-03",
    title: "Quadratic Roots & Complex Discriminants (HOTS)",
    subject: "Mathematics",
    topic: "Polynomials",
    difficulty: "Advanced",
    questionsCount: 10,
    estimatedMinutes: 40,
    status: "generated",
  },
];

// ── 9. Anonymous Safe Space & Live Conduct Ledger ─────────────────────────────
export interface GrievanceReport {
  id: string;
  trackingToken: string;
  category: "bullying" | "cyber_bullying" | "harassment" | "vandalism" | "counselor_private_chat" | "safety_hazard";
  description: string;
  locationDetails?: string;
  urgency: "standard" | "high" | "critical";
  status: "received" | "under_investigation" | "counselor_response_ready" | "resolved";
  counselorReply?: string;
  createdAt: string;
}

export interface ConductEntry {
  id: string;
  date: string;
  type: "merit" | "demerit";
  title: string;
  points: number;
  issuedBy: string;
  description: string;
  badgeIcon: string;
}

export const INITIAL_GRIEVANCES: GrievanceReport[] = [
  {
    id: "grv-01",
    trackingToken: "SAFE-TOKEN-8819",
    category: "counselor_private_chat",
    description: "Experiencing high exam anxiety and sleep issues leading up to Class 10 Board prep. Requesting a quiet 1-on-1 counseling session.",
    urgency: "standard",
    status: "counselor_response_ready",
    counselorReply: "Dear student, thank you for reaching out. Please visit the wellness room this Thursday during 7th period (Library block 2nd floor). Everything is 100% confidential.",
    createdAt: "16 Sep 2026",
  },
];

export const INITIAL_CONDUCT_ENTRIES: ConductEntry[] = [
  {
    id: "con-01",
    date: "15 Sep 2026",
    type: "merit",
    title: "Star Student of the Week",
    points: 25,
    issuedBy: "Mrs. K. Radhika (Class Teacher 10-A)",
    description: "Exceptional peer tutoring in Mathematics during remedial hour and proactive lab cleanup.",
    badgeIcon: "⭐",
  },
  {
    id: "con-02",
    date: "04 Sep 2026",
    type: "merit",
    title: "Integrity & Clean Campus Ambassador",
    points: 15,
    issuedBy: "Mr. M. Subrahmanyam (Discipline Committee)",
    description: "Returned lost wallet found near cafeteria directly to reception.",
    badgeIcon: "🎖️",
  },
  {
    id: "con-03",
    date: "18 Aug 2026",
    type: "demerit",
    title: "Late Entry to Morning Assembly (Warning)",
    points: -5,
    issuedBy: "Mr. P. Ramaniah (Gate Duty)",
    description: "Arrived at campus gate at 08:35 AM (cut-off is 08:25 AM). First verbal reminder issued.",
    badgeIcon: "⚠️",
  },
];

// ── 10. Regulated Parent-Teacher Messaging & PTM Scheduler ───────────────────
export interface TeacherContact {
  id: string;
  name: string;
  subject: string;
  designation: string;
  officeHoursWindow: string; // e.g. "03:45 PM – 05:00 PM"
  isOfficeHoursActive: boolean;
  photoEmoji: string;
}

export interface TeacherChatMessage {
  id: string;
  teacherId: string;
  senderRole: "parent" | "teacher";
  text: string;
  timestamp: string;
  status: "delivered" | "queued_for_office_hours";
}

export interface PtmSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  timeSlot: string; // e.g. "04:10 PM – 04:20 PM"
  status: "available" | "booked";
  meetingType: "In-Person Classroom" | "Google Meet Video";
}

export const INITIAL_TEACHERS: TeacherContact[] = [
  {
    id: "tch-radhika",
    name: "Mrs. K. Radhika, M.Sc., B.Ed.",
    subject: "Mathematics & Class Teacher 10-A",
    designation: "Head of Department (Senior Mathematics)",
    officeHoursWindow: "03:45 PM – 05:00 PM (Mon – Fri)",
    isOfficeHoursActive: true,
    photoEmoji: "👩‍🏫",
  },
  {
    id: "tch-srinivas",
    name: "Dr. K. Srinivas, Ph.D.",
    subject: "Physical Science",
    designation: "Senior Science Coordinator",
    officeHoursWindow: "04:00 PM – 05:00 PM (Mon – Thu)",
    isOfficeHoursActive: true,
    photoEmoji: "👨‍🏫",
  },
  {
    id: "tch-revathi",
    name: "Mrs. Revathi Sundar, M.A.",
    subject: "English Language & Literature",
    designation: "MUN & Debate Lead",
    officeHoursWindow: "03:30 PM – 04:30 PM (Wed & Fri)",
    isOfficeHoursActive: false,
    photoEmoji: "👩‍💼",
  },
];

export const INITIAL_MESSAGES: TeacherChatMessage[] = [
  {
    id: "msg-01",
    teacherId: "tch-radhika",
    senderRole: "teacher",
    text: "Namaste Sri Goud garu. Arjun performed very well in SA-1 Algebra (scored 88%). Please encourage him to practice the 3D Mensuration remedial sheet this weekend.",
    timestamp: "Yesterday at 04:15 PM",
    status: "delivered",
  },
  {
    id: "msg-02",
    teacherId: "tch-radhika",
    senderRole: "parent",
    text: "Thank you teacher. We noticed the 3D Geometry score on the portal. We will ensure he completes the weekend worksheets.",
    timestamp: "Yesterday at 04:32 PM",
    status: "delivered",
  },
];

export const INITIAL_PTM_SLOTS: PtmSlot[] = [
  {
    id: "ptm-01",
    teacherId: "tch-radhika",
    teacherName: "Mrs. K. Radhika",
    subject: "Mathematics",
    date: "Saturday, 28 Sep 2026",
    timeSlot: "09:30 AM – 09:40 AM",
    status: "available",
    meetingType: "In-Person Classroom",
  },
  {
    id: "ptm-02",
    teacherId: "tch-radhika",
    teacherName: "Mrs. K. Radhika",
    subject: "Mathematics",
    date: "Saturday, 28 Sep 2026",
    timeSlot: "09:40 AM – 09:50 AM",
    status: "available",
    meetingType: "In-Person Classroom",
  },
  {
    id: "ptm-03",
    teacherId: "tch-radhika",
    teacherName: "Mrs. K. Radhika",
    subject: "Mathematics",
    date: "Saturday, 28 Sep 2026",
    timeSlot: "09:50 AM – 10:00 AM",
    status: "booked",
    meetingType: "In-Person Classroom",
  },
  {
    id: "ptm-04",
    teacherId: "tch-srinivas",
    teacherName: "Dr. K. Srinivas",
    subject: "Physical Science",
    date: "Saturday, 28 Sep 2026",
    timeSlot: "10:10 AM – 10:20 AM",
    status: "available",
    meetingType: "In-Person Classroom",
  },
  {
    id: "ptm-05",
    teacherId: "tch-srinivas",
    teacherName: "Dr. K. Srinivas",
    subject: "Physical Science",
    date: "Saturday, 28 Sep 2026",
    timeSlot: "10:20 AM – 10:30 AM",
    status: "available",
    meetingType: "In-Person Classroom",
  },
];

// ── 11. Verifiable E-Certificates & External Achievement Drop-Box ─────────────
export interface DigitalCertificate {
  id: string;
  certificateNo: string;
  title: string;
  eventName: string;
  awardRank: string;
  category: "academic" | "sports" | "stem" | "cultural";
  dateIssued: string;
  recipientName: string;
  classGrade: string;
  qrVerificationHash: string;
  signatory: string;
}

export interface ExternalAchievement {
  id: string;
  title: string;
  organizingBody: string;
  level: "District" | "State" | "National" | "International";
  eventDate: string;
  awardSecured: string;
  proofDocumentName: string;
  status: "pending_principal_approval" | "verified_and_added_to_dossier" | "needs_clarification";
  reviewedAt?: string;
  principalRemarks?: string;
}

export interface IdPhotoSubmission {
  id: string;
  photoUrl: string;
  submittedDate: string;
  status: "approved_batch_ready" | "pending_review" | "resubmission_requested";
  complianceChecks: {
    whiteBackground: boolean;
    faceRatioPassed: boolean;
    formalUniformDetected: boolean;
    minResolutionMet: boolean;
  };
}

export const INITIAL_CERTIFICATES: DigitalCertificate[] = [
  {
    id: "cert-01",
    certificateNo: "CERT-PRIY-2026-8910",
    title: "Certificate of Academic Excellence",
    eventName: "Class 9 Annual Board Examinations",
    awardRank: "Rank 1 in Mathematics (Distinction 98%)",
    category: "academic",
    dateIssued: "15 May 2026",
    recipientName: "Arjun Reddy",
    classGrade: "Class 9-A",
    qrVerificationHash: "SHA256:7f88d92a104c99e",
    signatory: "Principal & Secretary • Priyanka High",
  },
  {
    id: "cert-02",
    certificateNo: "CERT-PRIY-2026-4421",
    title: "Regional STEM Innovation Trophy",
    eventName: "Nellore District Inter-School Robotics Fair",
    awardRank: "Gold Medal • Autonomous Line Following Robot",
    category: "stem",
    dateIssued: "22 Aug 2026",
    recipientName: "Arjun Reddy",
    classGrade: "Class 10-A",
    qrVerificationHash: "SHA256:3c19e84b002f1a8",
    signatory: "District Science Officer & Principal",
  },
];

export const INITIAL_EXTERNAL_ACHIEVEMENTS: ExternalAchievement[] = [
  {
    id: "ach-01",
    title: "Andhra Pradesh State Sub-Junior Swimming Championship",
    organizingBody: "AP State Aquatic Association, Vijayawada",
    level: "State",
    eventDate: "12 Aug 2026",
    awardSecured: "Silver Medal • 100m Butterfly Stroke",
    proofDocumentName: "AP_Aquatics_Certificate_Arjun.pdf",
    status: "verified_and_added_to_dossier",
    reviewedAt: "18 Aug 2026",
    principalRemarks: "Remarkable achievement! Verified and appended to official student dossier and annual sports report.",
  },
];

export const INITIAL_ID_PHOTO: IdPhotoSubmission = {
  id: "photo-01",
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  submittedDate: "10 Jun 2026",
  status: "approved_batch_ready",
  complianceChecks: {
    whiteBackground: true,
    faceRatioPassed: true,
    formalUniformDetected: true,
    minResolutionMet: true,
  },
};

// ── 12. Digital Leave & On-Duty (OD/ML) Management ────────────────────────────
export interface StudentLeave {
  id: string;
  leaveType: "sick_leave" | "casual_leave" | "medical_leave" | "on_duty";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  medicalDocRequired: boolean;
  medicalDocName?: string;
  status: "approved" | "pending" | "rejected";
  onDutyDetails?: {
    eventName: string;
    organizer: string;
    facultyInCharge: string;
  };
  appliedAt: string;
}

export const INITIAL_LEAVES: StudentLeave[] = [
  {
    id: "lv-01",
    leaveType: "on_duty",
    startDate: "22 Aug 2026",
    endDate: "23 Aug 2026",
    totalDays: 2,
    reason: "Represented Priyanka High at Nellore District Robotics Hackathon.",
    medicalDocRequired: false,
    status: "approved",
    onDutyDetails: {
      eventName: "District STEM Robotics Hackathon",
      organizer: "District Collectorate & Innovation Council",
      facultyInCharge: "Dr. K. Srinivas (Physics)",
    },
    appliedAt: "20 Aug 2026",
  },
  {
    id: "lv-02",
    leaveType: "sick_leave",
    startDate: "10 Jul 2026",
    endDate: "11 Jul 2026",
    totalDays: 2,
    reason: "Viral fever with throat infection.",
    medicalDocRequired: false,
    status: "approved",
    appliedAt: "10 Jul 2026",
  },
];

// ── 13. Bank Details for Caution Deposit & Scholarship Refunds ─────────────────
export interface BankRefundProfile {
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  branchName: string;
  verificationStatus: "verified" | "pending_verification";
  cautionDepositEligibleInr: number;
  scholarshipDisbursedInr: number;
  pendingRefundInr: number;
  lastUpdated: string;
}

export const INITIAL_BANK_REFUND: BankRefundProfile = {
  accountHolderName: "Sri Goud (Father)",
  bankName: "State Bank of India",
  accountNumberMasked: "•••• •••• •••• 4892",
  ifscCode: "SBIN0001428",
  branchName: "Magunta Layout Branch, Nellore",
  verificationStatus: "verified",
  cautionDepositEligibleInr: 5000,
  scholarshipDisbursedInr: 12500,
  pendingRefundInr: 0,
  lastUpdated: "12 Aug 2026",
};


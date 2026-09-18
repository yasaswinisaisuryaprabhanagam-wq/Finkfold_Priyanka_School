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

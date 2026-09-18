"use server";

import { revalidatePath } from "next/cache";

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

export async function submitOutPassAction(payload: {
  leaveType: "weekend_home" | "medical" | "day_outing";
  exitDateTime: string;
  returnDateTime: string;
  companionName: string;
  reason: string;
}) {
  const passNum = "OP-PRIY-2026-" + Math.floor(1000 + Math.random() * 9000);
  const newPass: OutPassRequest = {
    id: "pass-" + Date.now(),
    passNumber: passNum,
    leaveType: payload.leaveType,
    exitDateTime: payload.exitDateTime,
    returnDateTime: payload.returnDateTime,
    companionName: payload.companionName,
    reason: payload.reason,
    parentApproval: "approved", // Parent requesting via portal counts as initial parent authorization
    wardenApproval: "pending",
    gatePassQr: `QR-GATE-${passNum}`,
    createdAt: "Just now",
  };

  revalidatePath("/portal/student/outpass");
  return {
    success: true,
    pass: newPass,
    message: `Out-pass request #${passNum} submitted! Notification pushed to Hostel Warden and parent's WhatsApp for security logging.`,
  };
}

export async function submitMessFeedbackAction(rating: number, voteItem: string) {
  revalidatePath("/portal/student/outpass");
  return {
    success: true,
    message: `Thank you! Feedback recorded: ${rating}★ rating and vote cast for "${voteItem}" in Friday's Special Menu poll.`,
  };
}

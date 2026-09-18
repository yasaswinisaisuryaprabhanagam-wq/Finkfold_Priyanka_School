"use server";

import { revalidatePath } from "next/cache";

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

export async function saveLanguageRankingAction(ranking: { first: string; second: string; third: string }) {
  revalidatePath("/portal/student/electives");
  return {
    success: true,
    message: `Elective language preferences saved: 1st [${ranking.first}], 2nd [${ranking.second}], 3rd [${ranking.third}]. Seat allocation batch runs on Friday.`,
  };
}

export async function bidForClubAction(clubId: string, clubName: string, isWaitlist: boolean) {
  revalidatePath("/portal/student/electives");
  return {
    success: true,
    message: isWaitlist
      ? `Added to Digital Waitlist for "${clubName}". If a seat vacates, you will be automatically enrolled.`
      : `Confirmed registration for "${clubName}". Attendance will be tracked starting next week.`,
  };
}

export async function registerForEventAction(eventId: string, category: string) {
  revalidatePath("/portal/student/electives");
  return {
    success: true,
    message: `Successfully registered for "${category}" at Annual Event. Roster badge updated for Physical Education department.`,
  };
}

import { SCHOOL } from "@/lib/school-config";
import { getAuthenticatedStudent } from "@/lib/studentSession";
import { createAdminClient } from "@/lib/supabase/server";
import StudentTimetableComponent from "@/components/StudentTimetableComponent";

export const metadata = { title: `Class Timetable – ${SCHOOL.name}` };

export default async function StudentTimetablePage() {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Query real slots from database
  const { data: dbSlots } = await supabase
    .from("class_timetable_slots")
    .select(`
      id,
      day_of_week,
      period_number,
      start_time,
      end_time,
      room_number,
      is_lab_period,
      subjects(name),
      profiles(full_name)
    `)
    .eq("class_id", student.class_id)
    .order("period_number", { ascending: true });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periodsMeta = [
    { period: 1, time: "08:30 – 09:15", subject: "Mathematics", teacher: "Mrs. Priyanka Devi", room: "Room 204" },
    { period: 2, time: "09:15 – 10:00", subject: "Physical Science", teacher: "Mr. Satish Kumar", room: "Room 204" },
    { period: 3, time: "10:15 – 11:00", subject: "English Literature", teacher: "Mrs. Ayesha Khan", room: "Room 204" },
    { period: 4, time: "11:00 – 11:45", subject: "Social Studies", teacher: "Mr. Ramesh Sharma", room: "Room 204" },
    { period: 5, time: "12:30 – 01:15", subject: "Second Language (Telugu)", teacher: "Mrs. V. Lakshmi", room: "Room 204" },
    { period: 6, time: "01:15 – 02:00", subject: "Science Practical Lab", teacher: "Mr. Satish Kumar", room: "Science Lab 1", isLab: true },
    { period: 7, time: "02:15 – 03:00", subject: "Computer Science & Robotics", teacher: "Mr. K. Anjaneyulu", room: "Tech Lab", isLab: true },
  ];

  let formattedSlots: any[] = [];

  if (dbSlots && dbSlots.length > 0) {
    formattedSlots = dbSlots.map((s: any) => ({
      id: s.id,
      day: s.day_of_week,
      period: s.period_number,
      time: `${s.start_time} – ${s.end_time}`,
      subject: s.subjects?.name || "Academic Study",
      teacher: s.profiles?.full_name || "Assigned Faculty",
      room: s.room_number || "Room 204",
      isLab: s.is_lab_period || false,
    }));
  } else {
    // Fallback matrix across all 6 days
    daysOfWeek.forEach((day) => {
      periodsMeta.forEach((p) => {
        formattedSlots.push({
          day,
          period: p.period,
          time: p.time,
          subject: p.subject,
          teacher: p.teacher,
          room: p.room,
          isLab: p.isLab || false,
        });
      });
    });
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <StudentTimetableComponent
        slots={formattedSlots}
        className={`${student.className}-${student.classSection}`}
        todayName={todayName}
        todayFormatted={todayFormatted}
      />
    </div>
  );
}

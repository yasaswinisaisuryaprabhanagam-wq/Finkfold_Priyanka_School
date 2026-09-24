import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/server";

export interface HomeworkItem {
  id: string;
  school_id: string;
  class_id: string;
  subject: string;
  task: string;
  due_date: string;
  assigned_by?: string | null;
  created_at: string;
  classes?: {
    id?: string;
    name: string;
    section: string;
  } | null;
  profiles?: {
    full_name: string;
  } | null;
}

export interface HomeworkVerification {
  id: string;
  homework_id: string;
  student_id: string;
  student_name: string;
  roll_no?: number | string;
  status: "verified" | "incomplete" | "missing";
  verified_by: string;
  verified_at: string;
  notes?: string;
}

const DATA_FILE = path.join(process.cwd(), "src", "data", "homework.json");
const VERIFICATIONS_FILE = path.join(process.cwd(), "src", "data", "homework_verifications.json");

function readLocalVerifications(): HomeworkVerification[] {
  try {
    if (fs.existsSync(VERIFICATIONS_FILE)) {
      const raw = fs.readFileSync(VERIFICATIONS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local homework_verifications.json:", err);
  }
  return [];
}

function writeLocalVerifications(items: HomeworkVerification[]): void {
  try {
    const dir = path.dirname(VERIFICATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VERIFICATIONS_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local homework_verifications.json:", err);
  }
}

function readLocalHomework(): HomeworkItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local homework.json:", err);
  }
  return [];
}

function writeLocalHomework(items: HomeworkItem[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local homework.json:", err);
  }
}

export async function getHomeworkList(params?: {
  schoolId?: string;
  classId?: string;
  teacherId?: string;
}): Promise<HomeworkItem[]> {
  let dbItems: HomeworkItem[] = [];
  try {
    const admin = await createAdminClient();
    let query = admin
      .from("homework")
      .select("id, school_id, class_id, subject, task, due_date, assigned_by, created_at, classes(id, name, section), profiles:assigned_by(full_name)")
      .order("due_date", { ascending: true });

    if (params?.schoolId) query = query.eq("school_id", params.schoolId);
    if (params?.classId) query = query.eq("class_id", params.classId);
    if (params?.teacherId) query = query.eq("assigned_by", params.teacherId);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      dbItems = data as unknown as HomeworkItem[];
    }
  } catch (err) {
    // Supabase table might not exist yet or connection error, fallback to local store
  }

  // Read local store
  let items = readLocalHomework();
  if (params?.schoolId) {
    items = items.filter((it) => it.school_id === params.schoolId || it.id.startsWith("hw-seed"));
  }
  if (params?.classId) {
    const classFiltered = items.filter((it) => it.class_id === params.classId || it.id.startsWith("hw-seed"));
    if (classFiltered.length > 0) {
      items = classFiltered;
    }
  }
  if (params?.teacherId) {
    items = items.filter((it) => it.assigned_by === params.teacherId);
  }

  // Combine dbItems with local items
  const combined: HomeworkItem[] = [...dbItems];
  const seenIds = new Set(dbItems.map((d) => d.id));
  const seenSubjects = new Set(dbItems.map((d) => d.subject.toLowerCase()));

  for (const localItem of items) {
    if (!seenIds.has(localItem.id) && !seenSubjects.has(localItem.subject.toLowerCase())) {
      combined.push(localItem);
    }
  }

  const finalItems = combined.length > 0 ? combined : items;

  // Attach class names if available
  try {
    const admin = await createAdminClient();
    const classIds = Array.from(new Set(finalItems.map((i) => i.class_id)));
    if (classIds.length > 0) {
      const { data: clsData } = await admin
        .from("classes")
        .select("id, name, section")
        .in("id", classIds);
      if (clsData) {
        const clsMap = new Map(clsData.map((c) => [c.id, c]));
        finalItems.forEach((item) => {
          if (!item.classes && clsMap.has(item.class_id)) {
            item.classes = clsMap.get(item.class_id);
          }
        });
      }
    }
  } catch {}

  return finalItems.sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export async function insertHomework(item: Omit<HomeworkItem, "id" | "created_at">): Promise<HomeworkItem> {
  const newItem: HomeworkItem = {
    ...item,
    id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  // Try saving to Supabase
  try {
    const admin = await createAdminClient();
    const { data, error } = await admin
      .from("homework")
      .insert({
        school_id: newItem.school_id,
        class_id: newItem.class_id,
        subject: newItem.subject,
        task: newItem.task,
        due_date: newItem.due_date,
        assigned_by: newItem.assigned_by || null,
      })
      .select("id, created_at")
      .single();

    if (!error && data) {
      newItem.id = data.id;
      newItem.created_at = data.created_at;
    }
  } catch (err) {
    // Supabase table not created yet, proceeding with local persistence
  }

  // Persist locally for immediate availability
  const current = readLocalHomework();
  current.unshift(newItem);
  writeLocalHomework(current);

  return newItem;
}

export async function removeHomework(id: string): Promise<boolean> {
  // Try Supabase delete
  try {
    const admin = await createAdminClient();
    await admin.from("homework").delete().eq("id", id);
  } catch {}

  // Delete from local store
  const current = readLocalHomework();
  const updated = current.filter((it) => it.id !== id);
  writeLocalHomework(updated);

  return true;
}

export async function getHomeworkVerifications(homeworkId: string): Promise<HomeworkVerification[]> {
  const all = readLocalVerifications();
  return all.filter((v) => v.homework_id === homeworkId);
}

export async function saveHomeworkVerifications(
  homeworkId: string,
  records: HomeworkVerification[]
): Promise<boolean> {
  const current = readLocalVerifications();
  // Filter out any existing records for this homework
  const filtered = current.filter((v) => v.homework_id !== homeworkId);
  // Merge new records
  const updated = [...filtered, ...records];
  writeLocalVerifications(updated);
  return true;
}

export async function getStudentHomeworkVerifications(
  studentNameOrId?: string
): Promise<Record<string, HomeworkVerification>> {
  const all = readLocalVerifications();
  const map: Record<string, HomeworkVerification> = {};

  all.forEach((v) => {
    if (
      !studentNameOrId ||
      v.student_id === studentNameOrId ||
      v.student_name.toLowerCase().includes(studentNameOrId.toLowerCase()) ||
      studentNameOrId.toLowerCase().includes(v.student_name.toLowerCase())
    ) {
      map[v.homework_id] = v;
    }
  });

  return map;
}


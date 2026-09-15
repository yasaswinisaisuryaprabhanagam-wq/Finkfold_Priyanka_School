import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/server";

export interface CircularItem {
  id: string;
  school_id: string;
  title: string;
  category: string;
  urgent: boolean;
  description: string;
  publish_date: string;
  posted_by?: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

const DATA_FILE = path.join(process.cwd(), "src", "data", "circulars.json");

function readLocalCirculars(): CircularItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local circulars.json:", err);
  }
  return [];
}

function writeLocalCirculars(items: CircularItem[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local circulars.json:", err);
  }
}

export async function getCircularsList(schoolId?: string): Promise<CircularItem[]> {
  try {
    const admin = await createAdminClient();
    let query = admin
      .from("circulars")
      .select("id, school_id, title, category, urgent, description, publish_date, posted_by, created_at, profiles:posted_by(full_name)")
      .order("publish_date", { ascending: false });

    if (schoolId) query = query.eq("school_id", schoolId);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as unknown as CircularItem[];
    }
  } catch (err) {
    // Supabase table might not exist yet, fallback to local store
  }

  // Fallback to local store
  let items = readLocalCirculars();
  if (schoolId) {
    items = items.filter((it) => it.school_id === schoolId || it.id.startsWith("circ-seed"));
  }

  return items.sort((a, b) => {
    // Urgent first, then newest date
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return b.publish_date.localeCompare(a.publish_date);
  });
}

export async function insertCircular(item: Omit<CircularItem, "id" | "created_at">): Promise<CircularItem> {
  const newItem: CircularItem = {
    ...item,
    id: `circ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  // Try Supabase insert
  try {
    const admin = await createAdminClient();
    const { data, error } = await admin
      .from("circulars")
      .insert({
        school_id: newItem.school_id,
        title: newItem.title,
        category: newItem.category,
        urgent: newItem.urgent,
        description: newItem.description,
        publish_date: newItem.publish_date,
        posted_by: newItem.posted_by || null,
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
  const current = readLocalCirculars();
  current.unshift(newItem);
  writeLocalCirculars(current);

  return newItem;
}

export async function removeCircular(id: string): Promise<boolean> {
  // Try Supabase delete
  try {
    const admin = await createAdminClient();
    await admin.from("circulars").delete().eq("id", id);
  } catch {}

  // Delete from local store
  const current = readLocalCirculars();
  const updated = current.filter((it) => it.id !== id);
  writeLocalCirculars(updated);

  return true;
}

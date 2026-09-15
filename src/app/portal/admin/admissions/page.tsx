import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import AdmissionReviewClient from "./AdmissionReviewClient";
import AdmissionShareBox from "./AdmissionShareBox";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: `Pending Admissions · ${SCHOOL.name}` };

export default async function AdminAdmissionsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();

  // Pending admissions
  let pending: any[] = [];
  try {
    const { data } = await adminClient
      .from("pending_admissions")
      .select("*")
      .eq("school_id", profile.school_id)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false });
    pending = data || [];
  } catch {}

  // Recent reviewed (last 30 days)
  let reviewed: any[] = [];
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data } = await adminClient
      .from("pending_admissions")
      .select("*")
      .eq("school_id", profile.school_id)
      .neq("status", "pending")
      .gte("submitted_at", since.toISOString())
      .order("submitted_at", { ascending: false })
      .limit(20);
    reviewed = data || [];
  } catch {}

  // All classes for the enroll modal
  let classes: any[] = [];
  try {
    const { data } = await adminClient
      .from("classes")
      .select("id, name, section, academic_year")
      .eq("school_id", profile.school_id)
      .order("name")
      .order("section");
    classes = data || [];
  } catch {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)" }}>
        <div className="relative z-10">
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Admin Control Panel &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            📋 Pending Admissions
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white/60 text-sm">
              {pending.length} applications awaiting review
            </span>
            {pending.length > 0 && (
              <span className="bg-amber-400 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full">
                {pending.length} NEW
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Admission link share card */}
      <AdmissionShareBox schoolSlug={SCHOOL.slug} />

      {/* Pending review */}
      {pending.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">OK</div>
          <div className="text-base font-bold text-slate-700">No pending applications</div>
          <div className="text-sm text-slate-500 mt-1">All submissions have been reviewed</div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm font-bold text-slate-800 px-1">
             Applications Awaiting Review ({pending.length})
          </div>
          {pending.map((adm: any) => (
            <AdmissionReviewClient
              key={adm.id}
              admission={adm}
              classes={classes}
              schoolId={profile.school_id}
              reviewedBy={profile.id}
            />
          ))}
        </div>
      )}

      {/* Recently reviewed */}
      {reviewed.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-700">Recently Reviewed (Last 30 days)</h2>
          </div>
          <div className="overflow-auto">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Parent</th>
                  <th>Phone</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((adm: any) => (
                  <tr key={adm.id} className={adm.status === "rejected" ? "opacity-50" : ""}>
                    <td className="font-semibold">{adm.full_name}</td>
                    <td>Class {adm.applying_for_class}{adm.applying_for_section ? `-${adm.applying_for_section}` : ""}</td>
                    <td>{adm.parent_name}</td>
                    <td className="font-mono">{adm.parent_phone}</td>
                    <td className="text-slate-400">
                      {new Date(adm.submitted_at).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <span className={`badge ${adm.status === "approved" ? "badge-green" : "badge-red"}`}>
                        {adm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

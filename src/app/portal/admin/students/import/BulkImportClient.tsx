"use client";

import { useState, useCallback, useRef } from "react";
import { validateCSV, commitBulkImport, type ValidationResult } from "@/actions/bulkImportStudents";

const CSV_TEMPLATE = `full_name,roll_no,admission_no,class_name,section,parent_name,parent_phone,gender,consent_whatsapp
Aarav Sharma,1,ADM-2027-001,10,A,Rajesh Sharma,9876543210,male,true
Diya Patel,2,ADM-2027-002,10,A,Sunil Patel,9876543211,female,true`;

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finkfold_student_import_template.csv";
  a.click();
}

type Step = "upload" | "validate" | "confirm" | "done";

export default function BulkImportClient({ schoolId }: { schoolId: string }) {
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number; dbError?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    const text = await file.text();
    const validated = await validateCSV(text);
    setRows(validated);
    setStep("validate");
    setLoading(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
        parseFile(file);
      }
    },
    [parseFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleCommit = async () => {
    setLoading(true);
    const res = await commitBulkImport(schoolId, rows);
    setResult({ inserted: res.inserted, skipped: res.skipped, dbError: res.dbError });
    setStep("done");
    setLoading(false);
  };

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {(["upload", "validate", "confirm", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold
              ${step === s ? "bg-blue-700 text-white" :
                (["upload","validate","confirm","done"].indexOf(step) > i)
                  ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
              {["upload","validate","confirm","done"].indexOf(step) > i ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block capitalize ${step === s ? "text-blue-900" : "text-slate-400"}`}>{s}</span>
            {i < 3 && <div className="w-8 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          <button
            onClick={downloadTemplate}
            className="btn btn-ghost border border-dashed border-slate-300 gap-2 text-sm"
          >
            ⬇️ Download Excel/CSV Template
          </button>

          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all
              ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"}`}
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={onFileChange} className="hidden" />
            <div className="text-5xl mb-4">📂</div>
            <div className="text-base font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>
              {dragging ? "Drop your CSV file here" : "Drag & Drop CSV file here"}
            </div>
            <div className="text-sm text-slate-500 mt-1">or click to browse</div>
            <div className="text-xs text-slate-400 mt-3">Supported: .csv files</div>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-sm text-blue-700 font-medium">
              <span className="animate-spin text-lg">⏳</span> Parsing file...
            </div>
          )}

          {/* Template preview */}
          <div className="card p-4">
            <div className="text-xs font-bold text-slate-600 mb-2">📋 Required CSV Columns</div>
            <div className="flex flex-wrap gap-2">
              {["full_name","roll_no","admission_no","class_name","section","parent_name","parent_phone","gender","consent_whatsapp"].map(col => (
                <span key={col} className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded">{col}</span>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              ✅ <strong>class_name</strong> must match an existing class in your school (e.g. "10")&nbsp;&nbsp;
              ✅ <strong>parent_phone</strong> must be 10 digits&nbsp;&nbsp;
              ✅ <strong>consent_whatsapp</strong>: true/false
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Validation preview */}
      {step === "validate" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card text-center">
              <div className="text-3xl font-black text-slate-900">{rows.length}</div>
              <div className="text-xs text-slate-500 mt-1">Total Rows</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-3xl font-black text-emerald-600">{validCount}</div>
              <div className="text-xs text-slate-500 mt-1">✅ Valid</div>
            </div>
            <div className="stat-card text-center">
              <div className={`text-3xl font-black ${invalidCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{invalidCount}</div>
              <div className="text-xs text-slate-500 mt-1">{invalidCount > 0 ? "❌ Errors" : "✅ No Errors"}</div>
            </div>
          </div>

          {invalidCount > 0 && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
              <div className="text-sm font-bold text-rose-800 mb-2">⚠️ Fix these errors before importing:</div>
              <div className="space-y-1.5">
                {rows.filter(r => !r.valid).map(r => (
                  <div key={r.row} className="text-xs text-rose-700">
                    <span className="font-bold">Row {r.row} ({r.raw.full_name || "unnamed"}):</span>{" "}
                    {r.errors.join(" | ")}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row preview table */}
          <div className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Row Preview</span>
              <span className="text-xs text-slate-500">{fileName}</span>
            </div>
            <div className="overflow-auto max-h-72">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Roll</th>
                    <th>Parent Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.row} className={!r.valid ? "bg-rose-50/60" : ""}>
                      <td className="font-mono">{r.row}</td>
                      <td className="font-semibold">{r.raw.full_name || "—"}</td>
                      <td>{r.raw.class_name}-{r.raw.section}</td>
                      <td>{r.raw.roll_no}</td>
                      <td className="font-mono">{r.raw.parent_phone}</td>
                      <td>
                        {r.valid
                          ? <span className="badge badge-green text-[10px]">✅ Valid</span>
                          : <span className="badge badge-red text-[10px]">❌ {r.errors[0]?.slice(0,30)}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep("upload"); setRows([]); }} className="btn btn-ghost">
              ← Re-upload
            </button>
            {validCount > 0 && (
              <button onClick={() => setStep("confirm")} className="btn btn-primary">
                Continue with {validCount} valid rows →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 text-center">
            <div className="text-5xl mb-3">🚀</div>
            <div className="text-xl font-black text-blue-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Ready to Import {validCount} Students
            </div>
            <div className="text-sm text-blue-700">
              {invalidCount > 0 && <span className="text-rose-600 font-semibold">{invalidCount} rows with errors will be skipped. </span>}
              This action will create {validCount} new student records in a single transaction.
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setStep("validate")} className="btn btn-ghost">← Back</button>
            <button onClick={handleCommit} disabled={loading} className="btn btn-primary gap-2">
              {loading ? <span className="animate-spin">⏳</span> : "✅"}
              {loading ? "Importing..." : `Confirm Import (${validCount} students)`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && result && (
        <div className="space-y-4">
          {result.inserted > 0 ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <div className="text-2xl font-black text-emerald-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                {result.inserted} Students Added!
              </div>
              <div className="text-sm text-emerald-700">
                Successfully enrolled in your school database.
                {result.skipped > 0 && ` (${result.skipped} rows skipped due to errors)`}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-8 text-center">
              <div className="text-5xl mb-3">❌</div>
              <div className="text-xl font-black text-rose-900 mb-2">Import Failed</div>
              <div className="text-sm text-rose-700">{result.dbError}</div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <a href="/portal/admin/students" className="btn btn-primary">View Student Registry →</a>
            <button onClick={() => { setStep("upload"); setRows([]); setResult(null); }} className="btn btn-ghost">
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

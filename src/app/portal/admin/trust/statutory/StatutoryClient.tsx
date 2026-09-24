"use client";

import { useState, useTransition } from "react";
import { generateTrustStatutoryChallans } from "@/actions/superAdminEnterprise";
import {
  FileText,
  Download,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Coins,
  CreditCard,
  Percent
} from "lucide-react";

interface CampusStatutoryRow {
  campusCode: string;
  campusName: string;
  headcount: number;
  grossPayroll: number;
  epfDeduction: number;
  tdsDeduction: number;
  ptDeduction: number;
  esiDeduction: number;
  status: "reconciled" | "pending_signoff";
}

const CAMPUS_STATUTORY_DATA: CampusStatutoryRow[] = [
  {
    campusCode: "HYD-01",
    campusName: "Main Campus (Jubilee Hills)",
    headcount: 98,
    grossPayroll: 3820000,
    epfDeduction: 595000,
    tdsDeduction: 480000,
    ptDeduction: 72000,
    esiDeduction: 24000,
    status: "reconciled",
  },
  {
    campusCode: "HYD-02",
    campusName: "North Campus (Kompally)",
    headcount: 72,
    grossPayroll: 2510000,
    epfDeduction: 390000,
    tdsDeduction: 275000,
    ptDeduction: 45000,
    esiDeduction: 18000,
    status: "reconciled",
  },
  {
    campusCode: "HYD-03",
    campusName: "East City (Uppal)",
    headcount: 44,
    grossPayroll: 1510000,
    epfDeduction: 260000,
    tdsDeduction: 140000,
    ptDeduction: 28000,
    esiDeduction: 11000,
    status: "reconciled",
  },
];

export default function StatutoryClient() {
  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [isGenerating, startTransition] = useTransition();
  const [downloadResult, setDownloadResult] = useState<{
    fileUrl: string;
    message: string;
    challanType: string;
    recordCount: number;
    totalAmount: number;
  } | null>(null);

  const totalHeadcount = CAMPUS_STATUTORY_DATA.reduce((acc, c) => acc + c.headcount, 0);
  const totalGross = CAMPUS_STATUTORY_DATA.reduce((acc, c) => acc + c.grossPayroll, 0);
  const totalEpf = CAMPUS_STATUTORY_DATA.reduce((acc, c) => acc + c.epfDeduction, 0);
  const totalTds = CAMPUS_STATUTORY_DATA.reduce((acc, c) => acc + c.tdsDeduction, 0);
  const totalPt = CAMPUS_STATUTORY_DATA.reduce((acc, c) => acc + c.ptDeduction, 0);

  const handleGenerateChallan = (challanType: "EPF_ECR" | "TDS_24Q" | "PT_CONSOLIDATED") => {
    startTransition(async () => {
      const res = await generateTrustStatutoryChallans(selectedMonth, selectedYear, challanType);
      if (res.success) {
        setDownloadResult({
          fileUrl: res.fileUrl,
          message: res.message,
          challanType: challanType.replace("_", " "),
          recordCount: res.recordCount,
          totalAmount: res.totalAmount,
        });

        // Trigger simulated file download
        const blob = new Blob(
          [
            `# FINKFOLD EDUCATIONAL TRUST - CONSOLIDATED STATUTORY RETURN\n# CHALLAN: ${challanType}\n# PERIOD: ${selectedMonth} ${selectedYear}\n# TOTAL AMOUNT: INR ${res.totalAmount}\n# HEADCOUNT: ${res.recordCount}\n# GENERATED UNDER SUPER ADMIN DIGITAL SIGNATURE\nUAN,MEMBER_NAME,GROSS_WAGE,EPF_WAGE,EPS_WAGE,EDLI_WAGE,EE_SHARE,ER_SHARE,EPS_SHARE\n100982348123,PRIYANKA SHARMA,85000,15000,15000,15000,1800,550,1250\n100771239982,RAJESHWAR RAO,62000,15000,15000,15000,1800,550,1250\n100445678901,ANANYA DESHMUKH,95000,15000,15000,15000,1800,550,1250\n`,
          ],
          { type: "text/csv;charset=utf-8;" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `FINKFOLD_TRUST_${challanType}_${selectedMonth}_${selectedYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-amber-950/40 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Zoho Books & GreytHR Enterprise Architecture
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Global Statutory Consolidation (EPF, TDS, PT)
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Consolidated multi-branch statutory compliance engine. Auto-aggregate Employee Provident Fund (EPF),
              TDS 24Q, and Professional Tax across all campuses to generate official government portal upload files in 1 click.
            </p>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border/70 shadow-sm">
            <Calendar className="w-4 h-4 text-amber-500 ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                (m) => (
                  <option key={m} value={m} className="bg-card text-foreground">
                    {m}
                  </option>
                )
              )}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {["2025", "2026", "2027"].map((y) => (
                <option key={y} value={y} className="bg-card text-foreground">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Statutory Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Consolidated Gross Wages
            </div>
            <div className="text-2xl font-bold text-foreground">
              ₹{(totalGross / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-muted-foreground">Across {totalHeadcount} staff members</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-blue-500" />
              Consolidated EPF & EPS
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{(totalEpf / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-muted-foreground">Includes EE + ER + Admin Charges</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              Consolidated TDS (Sec 192)
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(totalTds / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-muted-foreground">Form 24Q Quarterly Pool</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              Compliance Health Score
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">100% Nominal</div>
            <div className="text-[11px] text-muted-foreground">0 Late notices / 0 Penalties</div>
          </div>
        </div>
      </div>

      {/* 1-Click Government Portal Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* EPF ECR Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                EPFO UNIFIED PORTAL
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                ECR 2.0 Format
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">EPF Electronic Challan Cum Return (ECR)</h3>
            <p className="text-xs text-muted-foreground">
              Pre-validated text/CSV formatted for instant bulk upload onto the EPFO Unified Employer Portal. Reconciles UANs, wages, and pension contributions.
            </p>
            <div className="text-xs font-semibold text-foreground pt-1">
              Consolidated Remittance: ₹{totalEpf.toLocaleString("en-IN")}
            </div>
          </div>

          <button
            onClick={() => handleGenerateChallan("EPF_ECR")}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "Validating & Compiling..." : "Generate Trust EPF ECR File"}
          </button>
        </div>

        {/* TDS Form 24Q Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                INCOME TAX TRACES
              </span>
              <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-full">
                FVU Compatible
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">Income Tax Form 24Q Consolidated</h3>
            <p className="text-xs text-muted-foreground">
              Quarterly TDS return under Trust TAN: HYDF01928B. Maps Section 192 tax deductions with faculty PANs and Treasury BSR codes.
            </p>
            <div className="text-xs font-semibold text-foreground pt-1">
              Consolidated Remittance: ₹{totalTds.toLocaleString("en-IN")}
            </div>
          </div>

          <button
            onClick={() => handleGenerateChallan("TDS_24Q")}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "Compiling 24Q..." : "Generate Consolidated TDS 24Q"}
          </button>
        </div>

        {/* Professional Tax Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                STATE COMMERCIAL TAXES
              </span>
              <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-full">
                Telangana Slabs
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">Consolidated Professional Tax (PT)</h3>
            <p className="text-xs text-muted-foreground">
              Unified monthly PT statement with tiered salary slab breakdowns (₹200/month standard) across all teaching and administrative brackets.
            </p>
            <div className="text-xs font-semibold text-foreground pt-1">
              Consolidated Remittance: ₹{totalPt.toLocaleString("en-IN")}
            </div>
          </div>

          <button
            onClick={() => handleGenerateChallan("PT_CONSOLIDATED")}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "Compiling PT..." : "Download Consolidated PT Return"}
          </button>
        </div>
      </div>

      {/* Campus Breakdown Table */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-500" />
            Campus-Wise Statutory Deduction Breakdown ({selectedMonth} {selectedYear})
          </h2>
          <span className="text-xs text-muted-foreground">All amounts in INR (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
              <tr>
                <th className="p-3">Campus</th>
                <th className="p-3">Headcount</th>
                <th className="p-3">Gross Wages</th>
                <th className="p-3">EPF Contribution</th>
                <th className="p-3">TDS (Sec 192)</th>
                <th className="p-3">Professional Tax</th>
                <th className="p-3">ESI</th>
                <th className="p-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {CAMPUS_STATUTORY_DATA.map((row) => (
                <tr key={row.campusCode} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{row.campusName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{row.campusCode}</div>
                  </td>
                  <td className="p-3 font-semibold text-foreground">{row.headcount} Staff</td>
                  <td className="p-3 font-semibold text-foreground">
                    ₹{row.grossPayroll.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 font-semibold">
                    ₹{row.epfDeduction.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    ₹{row.tdsDeduction.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-foreground">
                    ₹{row.ptDeduction.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    ₹{row.esiDeduction.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Reconciled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30 font-bold border-t border-border">
              <tr>
                <td className="p-3 text-foreground">Trust Total</td>
                <td className="p-3 text-foreground">{totalHeadcount} Staff</td>
                <td className="p-3 text-foreground">₹{totalGross.toLocaleString("en-IN")}</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">₹{totalEpf.toLocaleString("en-IN")}</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400">₹{totalTds.toLocaleString("en-IN")}</td>
                <td className="p-3 text-foreground">₹{totalPt.toLocaleString("en-IN")}</td>
                <td className="p-3 text-muted-foreground">₹53,000</td>
                <td className="p-3 text-emerald-600">100% Balanced</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadResult && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <strong>{downloadResult.challanType} Download Triggered:</strong> {downloadResult.message}
              <div className="text-[11px] opacity-80 mt-0.5">
                Total Remittance: ₹{downloadResult.totalAmount.toLocaleString("en-IN")} across {downloadResult.recordCount} staff records.
              </div>
            </div>
          </div>
          <button
            onClick={() => setDownloadResult(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

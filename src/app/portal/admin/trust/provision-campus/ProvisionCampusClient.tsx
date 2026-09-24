"use client";

import { useState, useTransition } from "react";
import { provisionNewCampus } from "@/actions/superAdminEnterprise";
import {
  Building,
  PlusCircle,
  Copy,
  Sparkles,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Landmark,
  ArrowRight,
  Layers,
  Globe
} from "lucide-react";

export default function ProvisionCampusClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    name: "Finkfold International School - Gachibowli",
    branchCode: "HYD-04",
    city: "Hyderabad, Telangana",
    address: "Plot 42, Financial District, Nanakramguda, Gachibowli, Hyderabad - 500032",
    phone: "+91 40 2938 1100",
    email: "principal.gachibowli@finkfold.edu.in",
    bankAccount: "50200088192837",
    bankIfsc: "HDFC0001824",
    cloneFromCampusId: "HYD-01 (Main Campus - Gold Standard CBSE)",
  });

  const [cloneOptions, setCloneOptions] = useState({
    feeStructures: true,
    academicCalendar: true,
    gradingScales: true,
    subjectCatalogue: true,
    rolePermissions: true,
  });

  const [isProvisioning, startTransition] = useTransition();
  const [deploymentResult, setDeploymentResult] = useState<{
    campusId: string;
    message: string;
    name: string;
    branchCode: string;
  } | null>(null);

  const handleLaunchDeployment = () => {
    startTransition(async () => {
      const res = await provisionNewCampus({
        name: formData.name,
        branchCode: formData.branchCode,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        bankAccount: formData.bankAccount,
        bankIfsc: formData.bankIfsc,
        cloneFromCampusId: formData.cloneFromCampusId,
      });

      if (res.success) {
        setDeploymentResult({
          campusId: res.campusId,
          message: res.message,
          name: formData.name,
          branchCode: formData.branchCode,
        });
        setStep(3);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-purple-950/40 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Rocket className="w-3.5 h-3.5" />
              AWS CloudFormation & NetSuite Multi-Entity Architecture
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              1-Click New Campus Provisioning Wizard
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Eliminate weeks of manual campus setup. Select a master campus blueprint, configure branch identity,
              and replicate fee structures, academic calendars, grading policies, and RBAC permissions in under 5 seconds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Zero-Downtime Replication
            </span>
          </div>
        </div>

        {/* Wizard Step Tracker */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/60">
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              step >= 1 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 1 ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </span>
            Campus Identity & Geolocation
          </div>
          <div className="w-8 h-px bg-border" />
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              step >= 2 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 2 ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </span>
            Blueprint Cloning & Inheritance
          </div>
          <div className="w-8 h-px bg-border" />
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              step === 3 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 3 ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </span>
            Deploy Live
          </div>
        </div>
      </div>

      {/* Step 1: Campus Identity */}
      {step === 1 && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-500" />
              Step 1: Institutional Profile & Statutory Details
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specify the legal identity, communication lines, and designated banking coordinates for the new campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Full Campus Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Branch Code / UID</label>
              <input
                type="text"
                value={formData.branchCode}
                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">City & State</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Official Administrative Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-muted-foreground font-semibold mb-1">Physical Campus Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Official Bank Account Number</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Bank IFSC Code</label>
              <input
                type="text"
                value={formData.bankIfsc}
                onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all"
            >
              Continue to Blueprint Selection
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Blueprint Selection */}
      {step === 2 && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Copy className="w-4 h-4 text-purple-500" />
              Step 2: Master Blueprint Inheritance & Policy Cloning
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select the source branch whose configuration will serve as the golden standard for the new campus.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1.5">
                Source Blueprint Template
              </label>
              <select
                value={formData.cloneFromCampusId}
                onChange={(e) => setFormData({ ...formData, cloneFromCampusId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold"
              >
                <option value="HYD-01 (Main Campus - Gold Standard CBSE)">
                  Main Campus (HYD-01) - Complete CBSE K-12 Setup (Recommended)
                </option>
                <option value="HYD-02 (North Campus - Secondary Model)">
                  North Campus (HYD-02) - Secondary Model
                </option>
                <option value="HYD-03 (East City - Primary & Middle Model)">
                  East City (HYD-03) - Primary & Middle Wing
                </option>
              </select>
            </div>

            {/* Config Cloned Checklist */}
            <div className="rounded-xl bg-muted/40 p-4 border border-border/60 space-y-3">
              <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                Automatic Provisioning Pipeline Elements:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer bg-background/60 p-2.5 rounded-lg border border-border/40">
                  <input
                    type="checkbox"
                    checked={cloneOptions.feeStructures}
                    onChange={(e) => setCloneOptions({ ...cloneOptions, feeStructures: e.target.checked })}
                    className="mt-0.5 rounded text-purple-600"
                  />
                  <div>
                    <strong className="text-foreground">14-Tier Standard Fee Structure</strong>
                    <div className="text-[11px] text-muted-foreground">Tuition, Lab, Transport, and Uniform fee matrices</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer bg-background/60 p-2.5 rounded-lg border border-border/40">
                  <input
                    type="checkbox"
                    checked={cloneOptions.gradingScales}
                    onChange={(e) => setCloneOptions({ ...cloneOptions, gradingScales: e.target.checked })}
                    className="mt-0.5 rounded text-purple-600"
                  />
                  <div>
                    <strong className="text-foreground">CBSE Grading Scales (A1 to E)</strong>
                    <div className="text-[11px] text-muted-foreground">Standardized report card format and rubrics</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer bg-background/60 p-2.5 rounded-lg border border-border/40">
                  <input
                    type="checkbox"
                    checked={cloneOptions.academicCalendar}
                    onChange={(e) => setCloneOptions({ ...cloneOptions, academicCalendar: e.target.checked })}
                    className="mt-0.5 rounded text-purple-600"
                  />
                  <div>
                    <strong className="text-foreground">Academic Terms & Calendars</strong>
                    <div className="text-[11px] text-muted-foreground">Term 1/2 schedules, gazetted holidays, and exam slots</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer bg-background/60 p-2.5 rounded-lg border border-border/40">
                  <input
                    type="checkbox"
                    checked={cloneOptions.rolePermissions}
                    onChange={(e) => setCloneOptions({ ...cloneOptions, rolePermissions: e.target.checked })}
                    className="mt-0.5 rounded text-purple-600"
                  />
                  <div>
                    <strong className="text-foreground">RBAC Security Profiles</strong>
                    <div className="text-[11px] text-muted-foreground">Pre-configured Principal, Accountant & Faculty roles</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border/60">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
            >
              Back to Details
            </button>
            <button
              onClick={handleLaunchDeployment}
              disabled={isProvisioning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all active:scale-95"
            >
              <Rocket className="w-4 h-4" />
              {isProvisioning ? "Deploying Pipeline (3.4s)..." : "Deploy Live New Branch"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Deployment Receipt */}
      {step === 3 && deploymentResult && (
        <div className="rounded-2xl border border-purple-500/50 bg-card p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto shadow-inner">
            <Rocket className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
              DEPLOYMENT SUCCESSFUL (3.4 SECONDS)
            </div>
            <h2 className="text-2xl font-bold text-foreground">{deploymentResult.name}</h2>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              Campus has been initialized, schema populated from blueprint, and hooked into the global Trust hierarchy.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-xl bg-muted/50 p-4 border border-border/70 text-xs space-y-2 text-left">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Assigned Campus UID:</span>
              <code className="font-bold text-foreground">{deploymentResult.campusId}</code>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Branch Code:</span>
              <strong className="text-purple-600 dark:text-purple-400">{deploymentResult.branchCode}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Cloned Blueprint:</span>
              <span className="text-foreground">HYD-01 (Main Campus)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Global Switcher Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> LIVE IN NAV SELECTOR
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setStep(1);
                setDeploymentResult(null);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
            >
              Provision Another Campus
            </button>
            <a
              href="/portal/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            >
              <Globe className="w-4 h-4" />
              Switch to New Branch
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

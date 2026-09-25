"use client";

import { useState, useTransition } from "react";
import { awardProcurementBid } from "@/actions/superAdminEnterprise";
import {
  ShoppingCart,
  TrendingDown,
  Layers,
  Award,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Filter,
  Building,
  DollarSign,
  AlertCircle,
  PackageCheck
} from "lucide-react";

interface RFQItem {
  id: string;
  code: string;
  title: string;
  category: string;
  totalQuantity: string;
  campusBreakdown: { campus: string; quantity: string }[];
  marketBaselineTotal: number;
  deadline: string;
  status: "unsealed_ready" | "bidding_open" | "awarded";
  awardedPo?: string;
  bids: VendorBid[];
}

interface VendorBid {
  id: string;
  vendorName: string;
  rating: number;
  gstNumber: string;
  unitPrice: number;
  totalAmount: number;
  leadTimeDays: number;
  isL1Lowest: boolean;
  warranty: string;
}

const INITIAL_RFQS: RFQItem[] = [
  {
    id: "rfq-101",
    code: "RFQ-TRUST-2026-041",
    title: "Secondary & Senior Secondary Science Lab Kits & Glassware",
    category: "Academic Consumables",
    totalQuantity: "4,500 Units / 120 Lab Assortments",
    campusBreakdown: [
      { campus: "Main Campus (HYD-01)", quantity: "2,200 Units" },
      { campus: "North Campus (HYD-02)", quantity: "1,400 Units" },
      { campus: "East City (HYD-03)", quantity: "900 Units" },
    ],
    marketBaselineTotal: 1850000,
    deadline: "24 Sep 2026, 05:00 PM",
    status: "unsealed_ready",
    bids: [
      {
        id: "vb-1",
        vendorName: "Borosil Scientific & Educational Supplies Ltd.",
        rating: 4.9,
        gstNumber: "36AAACB1234F1Z8",
        unitPrice: 285,
        totalAmount: 1282500,
        leadTimeDays: 7,
        isL1Lowest: true,
        warranty: "2 Years Replacement Guarantee",
      },
      {
        id: "vb-2",
        vendorName: "Apex Lab Solutions Pvt Ltd",
        rating: 4.6,
        gstNumber: "36AABCA9876G2Z1",
        unitPrice: 320,
        totalAmount: 1440000,
        leadTimeDays: 10,
        isL1Lowest: false,
        warranty: "1 Year Standard",
      },
      {
        id: "vb-3",
        vendorName: "National Educational Glassworks",
        rating: 4.4,
        gstNumber: "36BBBCB5432H3Z5",
        unitPrice: 360,
        totalAmount: 1620000,
        leadTimeDays: 14,
        isL1Lowest: false,
        warranty: "1 Year Standard",
      },
    ],
  },
  {
    id: "rfq-102",
    code: "RFQ-TRUST-2026-042",
    title: "Term 1 Central Examination Answer Booklets & 75 GSM Copier Paper",
    category: "Stationery & Exam Logistics",
    totalQuantity: "2,200 Reams + 45,000 Holographic Booklets",
    campusBreakdown: [
      { campus: "Main Campus (HYD-01)", quantity: "1,100 Reams / 22,000 Booklets" },
      { campus: "North Campus (HYD-02)", quantity: "700 Reams / 15,000 Booklets" },
      { campus: "East City (HYD-03)", quantity: "400 Reams / 8,000 Booklets" },
    ],
    marketBaselineTotal: 1120000,
    deadline: "28 Sep 2026, 12:00 PM",
    status: "bidding_open",
    bids: [],
  },
  {
    id: "rfq-103",
    code: "RFQ-TRUST-2026-039",
    title: "Annual Sports Day Tracksuits & House T-Shirts (Dry-Fit)",
    category: "Apparel & Sports",
    totalQuantity: "5,800 Custom Branded Units",
    campusBreakdown: [
      { campus: "Main Campus (HYD-01)", quantity: "2,800 Units" },
      { campus: "North Campus (HYD-02)", quantity: "1,800 Units" },
      { campus: "East City (HYD-03)", quantity: "1,200 Units" },
    ],
    marketBaselineTotal: 2320000,
    deadline: "15 Sep 2026 (Closed)",
    status: "awarded",
    awardedPo: "PO-TRUST-M3K9L2-SA",
    bids: [
      {
        id: "vb-99",
        vendorName: "Shiv Naresh Sports Gear India",
        rating: 4.8,
        gstNumber: "07AAACN5678M1ZK",
        unitPrice: 295,
        totalAmount: 1711000,
        leadTimeDays: 12,
        isL1Lowest: true,
        warranty: "Anti-shrink 6 months warranty",
      },
    ],
  },
];

export default function ProcurementClient() {
  const [rfqs, setRfqs] = useState<RFQItem[]>(INITIAL_RFQS);
  const [selectedRfq, setSelectedRfq] = useState<RFQItem>(INITIAL_RFQS[0]);
  const [isAwarding, startTransition] = useTransition();
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Stationery");
  const [newQuantity, setNewQuantity] = useState("1,500 Units");
  const [newBaseline, setNewBaseline] = useState("450000");
  const [newDeadline, setNewDeadline] = useState("2026-10-15");

  const [successModal, setSuccessModal] = useState<{
    poNumber: string;
    message: string;
    rfqTitle: string;
    vendorName: string;
    amount: number;
    savings: number;
  } | null>(null);

  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const baseline = Number(newBaseline) || 200000;
    const serialCode = `RFQ-TRUST-2026-${Math.floor(100 + Math.random() * 900)}`;
    const createdRfq: RFQItem = {
      id: `rfq-trust-${Date.now()}`,
      code: serialCode,
      title: newTitle.trim(),
      category: newCategory,
      totalQuantity: newQuantity,
      campusBreakdown: [
        { campus: "Main Campus (HYD-01)", quantity: "45%" },
        { campus: "North Campus (HYD-02)", quantity: "35%" },
        { campus: "East City (HYD-03)", quantity: "20%" },
      ],
      deadline: newDeadline,
      status: "bidding_open",
      marketBaselineTotal: baseline,
      bids: [
        {
          id: `bid-${Date.now()}-1`,
          vendorName: "Sri Balaji Wholesale Enterprises",
          rating: 4.8,
          gstNumber: "36AAACB1234F1Z8",
          unitPrice: Math.round(baseline * 0.72 / 1000),
          totalAmount: Math.round(baseline * 0.72),
          leadTimeDays: 7,
          isL1Lowest: true,
          warranty: "1 Year Standard Replacement",
        },
        {
          id: `bid-${Date.now()}-2`,
          vendorName: "Apex National Distributors",
          rating: 4.5,
          gstNumber: "36AAACD9981K1Z3",
          unitPrice: Math.round(baseline * 0.81 / 1000),
          totalAmount: Math.round(baseline * 0.81),
          leadTimeDays: 10,
          isL1Lowest: false,
          warranty: "6 Months Return",
        },
      ],
    };
    setRfqs([createdRfq, ...rfqs]);
    setSelectedRfq(createdRfq);
    setIsCreateRfqOpen(false);
    setNewTitle("");
  };

  const handleAwardBid = (rfq: RFQItem, bid: VendorBid) => {
    const savings = rfq.marketBaselineTotal - bid.totalAmount;

    startTransition(async () => {
      const res = await awardProcurementBid(
        rfq.id,
        bid.id,
        bid.vendorName,
        rfq.title,
        bid.totalAmount,
        savings
      );

      if (res.success) {
        setRfqs((prev) =>
          prev.map((item) =>
            item.id === rfq.id
              ? { ...item, status: "awarded", awardedPo: res.poNumber }
              : item
          )
        );

        setSelectedRfq((prev) =>
          prev.id === rfq.id
            ? { ...prev, status: "awarded", awardedPo: res.poNumber }
            : prev
        );

        setSuccessModal({
          poNumber: res.poNumber,
          message: res.message,
          rfqTitle: rfq.title,
          vendorName: bid.vendorName,
          amount: bid.totalAmount,
          savings,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-emerald-950/40 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShoppingCart className="w-3.5 h-3.5" />
              Coupa & SAP Ariba Class Architecture
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Bulk E-Procurement & Blind Bidding
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Consolidate high-volume requisitions from all 3 branch stores into sovereign Trust RFQs.
              Enforce blind bidding algorithms to neutralize vendor favoritism and unlock multi-lakh economies of scale.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateRfqOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Aggregate Requisitions (New RFQ)
            </button>
          </div>
        </div>

        {/* Global KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
              Total Aggregated Purchasing
            </div>
            <div className="text-2xl font-bold text-foreground">₹52,90,000</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Across 3 branches this quarter</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              Economies of Scale Savings
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹16,34,500</div>
            <div className="text-[11px] text-muted-foreground font-medium">30.9% below spot branch rates</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Active Trust RFQs
            </div>
            <div className="text-2xl font-bold text-foreground">3 Tenders</div>
            <div className="text-[11px] text-muted-foreground">1 Bidding, 1 Evaluated, 1 Awarded</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              Audited Blind Vendor Pool
            </div>
            <div className="text-2xl font-bold text-foreground">24 Vendors</div>
            <div className="text-[11px] text-muted-foreground">100% GST & ISO 9001 Verified</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: RFQ list left, details right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: RFQs List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Active Sovereign RFQs
            </h2>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md">
              {rfqs.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {rfqs.map((rfq) => {
              const isSelected = selectedRfq.id === rfq.id;
              return (
                <div
                  key={rfq.id}
                  onClick={() => setSelectedRfq(rfq)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-emerald-500/80 bg-emerald-500/5 shadow-sm"
                      : "border-border/70 bg-card hover:border-emerald-500/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {rfq.code}
                    </span>
                    {rfq.status === "unsealed_ready" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Blind Bids Ready
                      </span>
                    )}
                    {rfq.status === "bidding_open" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Bidding Active
                      </span>
                    )}
                    {rfq.status === "awarded" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <PackageCheck className="w-3 h-3" /> Contract Awarded
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-foreground mt-2 line-clamp-2">
                    {rfq.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>{rfq.category}</span>
                    <span className="font-semibold text-foreground">
                      Baseline: ₹{rfq.marketBaselineTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected RFQ Deep Dive & Blind Bidding Matrix */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedRfq.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  Submission Deadline: <strong className="text-foreground">{selectedRfq.deadline}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-1">{selectedRfq.title}</h2>
              <div className="mt-2 text-xs text-muted-foreground">
                Total Consolidated Quantity: <strong className="text-foreground">{selectedRfq.totalQuantity}</strong>
              </div>
            </div>

            {/* Campus Allocation Manifest */}
            <div className="rounded-xl bg-muted/40 p-4 border border-border/60">
              <div className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                Aggregated Campus Delivery Splits:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedRfq.campusBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-background/80 rounded-lg p-2.5 border border-border/40 text-xs">
                    <div className="text-muted-foreground text-[11px] truncate">{item.campus}</div>
                    <div className="font-bold text-foreground mt-0.5">{item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blind Bidding Results or Active Bidding Notice */}
            {selectedRfq.status === "bidding_open" ? (
              <div className="rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-foreground">Blind Bids Locked in Encrypted Vault</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Registered vendors are currently submitting sealed pricing. Bids will be unsealed simultaneously
                  when the submission window closes to prevent price collusions or leakage.
                </p>
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Current Submissions: 4 Sealed Bids Received
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    Unsealed Bids & Reverse Auction Ranking
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    Spot Retail Baseline: <span className="line-through">₹{selectedRfq.marketBaselineTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedRfq.bids.map((bid, idx) => {
                    const savingsAmount = selectedRfq.marketBaselineTotal - bid.totalAmount;
                    const savingsPct = Math.round((savingsAmount / selectedRfq.marketBaselineTotal) * 100);

                    return (
                      <div
                        key={bid.id}
                        className={`rounded-xl border p-4 transition-all ${
                          bid.isL1Lowest
                            ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20"
                            : "border-border/70 bg-card"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {bid.isL1Lowest && (
                                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                  <Award className="w-3 h-3" /> L1 Lowest Bidder
                                </span>
                              )}
                              <h4 className="text-sm font-bold text-foreground">{bid.vendorName}</h4>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                              <span>GST: <code className="text-foreground">{bid.gstNumber}</code></span>
                              <span>Rating: <strong className="text-amber-500">★ {bid.rating}</strong></span>
                              <span>Lead Time: <strong>{bid.leadTimeDays} days</strong></span>
                            </div>
                          </div>

                          <div className="text-right sm:border-l sm:pl-4 border-border/50">
                            <div className="text-xs text-muted-foreground">Total Tender Quote</div>
                            <div className="text-lg font-bold text-foreground">
                              ₹{bid.totalAmount.toLocaleString("en-IN")}
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Saves ₹{savingsAmount.toLocaleString("en-IN")} ({savingsPct}%)
                            </div>
                          </div>
                        </div>

                        {/* Additional details & Action Button */}
                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground italic">
                            Warranty: {bid.warranty}
                          </span>

                          {selectedRfq.status === "awarded" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-500/10 px-3 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              PO Dispatched ({selectedRfq.awardedPo})
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAwardBid(selectedRfq, bid)}
                              disabled={isAwarding}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                bid.isL1Lowest
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                  : "bg-muted hover:bg-muted/80 text-foreground"
                              }`}
                            >
                              {isAwarding ? "Dispatching..." : "Award Tender & Generate PO"}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-emerald-500/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Purchase Order Issued Successfully</h3>
                <p className="text-xs text-muted-foreground">Digital Trust Contract executed under Super Admin authority</p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 border border-border/70 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">PO Number:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{successModal.poNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Contracted Vendor:</span>
                <span className="font-semibold text-foreground">{successModal.vendorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Total Contract Value:</span>
                <span className="font-bold text-foreground">₹{successModal.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Net Trust Bulk Savings:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{successModal.savings.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {successModal.message}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuccessModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Requisitions / New RFQ Modal */}
      {isCreateRfqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">Aggregate Store Requisitions</h3>
                  <p className="text-xs text-muted-foreground">Consolidate store indents into a sovereign RFQ</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateRfqOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  RFQ Item / Bundle Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Copier Paper & Exam Answer Sheets"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Lab Consumables">Lab Consumables</option>
                    <option value="Sports & Uniforms">Sports & Uniforms</option>
                    <option value="Sanitation & Facility">Sanitation & Facility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Aggregated Qty</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1,500 Reams"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Market Baseline (₹ INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="450000"
                    value={newBaseline}
                    onChange={(e) => setNewBaseline(e.target.value)}
                    className="w-full text-xs font-mono font-medium px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Bidding Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300">
                ⚡ <strong>Algorithm:</strong> Consolidates indents across Main, North, and East City campuses. Pre-populates 2 blind competitive bids for immediate evaluation.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateRfqOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
                >
                  Publish Sovereign RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const inTopics = [
  { id: "commission", label: "Commission and education" },
  { id: "identification", label: "Appearance and identification" },
  { id: "notarial-acts", label: "Notarial acts" },
  { id: "certificates", label: "Notarial certificates" },
  { id: "seals-records", label: "Seals, records and fees" },
  { id: "conflicts-refusal", label: "Conflicts and refusal" },
] as const;
// Candidate target: 203. Unverified clauses remain outside every public pool.
export const inBankCounts = {"candidate":203,"draft":33,"published":170,"free":60,"pro":110};
export const inBankSummary = inBankCounts;

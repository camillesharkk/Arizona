export type CaCard = {
  id: string;
  area: string;
  title: string;
  front: string;
  back: string;
  source: string;
};

export const caCards: CaCard[] = [
  {
    id: "ca-card-admin",
    area: "administration",
    title: "Appointment",
    front: "When does a California notary commission take effect?",
    back: "After the oath and the $15,000 bond are filed with the county clerk. The filing window is 30 calendar days from the commission start date.",
    source: "Gov. Code §§ 8212, 8213",
  },
  {
    id: "ca-card-education",
    area: "administration",
    title: "Education",
    front: "Which course does a first-time applicant take?",
    back: "An approved six-hour course. A three-hour refresher is for reappointment after a six-hour course was already completed.",
    source: "Gov. Code § 8201; 2026 handbook",
  },
  {
    id: "ca-card-acts",
    area: "acts",
    title: "Personal appearance",
    front: "Can a notary acknowledge a deed that arrived by mail?",
    back: "No. The signer must personally appear. Knowing the signature is not a substitute.",
    source: "2026 California Notary Public Handbook",
  },
  {
    id: "ca-card-fees",
    area: "violations",
    title: "Acknowledgment fee",
    front: "What is the maximum fee for one acknowledgment signature?",
    back: "$15 for each signature, including the seal and the certificate.",
    source: "Gov. Code § 8211(a)",
  },
  {
    id: "ca-card-id",
    area: "identity",
    title: "Satisfactory evidence",
    front: "Name the three ways to establish satisfactory evidence.",
    back: "A qualifying identification document, one credible witness the notary personally knows, or two credible witnesses with proper identification.",
    source: "Civ. Code § 1185",
  },
  {
    id: "ca-card-journal",
    area: "violations",
    title: "Journal",
    front: "Who owns the sequential journal?",
    back: "The notary. It is not surrendered to an employer, even if the employer paid for it. Keep one active journal, locked, under the notary's exclusive control.",
    source: "Gov. Code § 8206",
  },
  {
    id: "ca-card-seal",
    area: "violations",
    title: "Seal",
    front: "What happens to the seal when the commission ends?",
    back: "Destroy it. Do not give it to an employer. The seal and the title are used only for notarial acts.",
    source: "Gov. Code § 8207",
  },
  {
    id: "ca-card-language",
    area: "immigration",
    title: "Notario",
    front: "May a non-attorney notary advertise in Spanish as a notario?",
    back: "No. Notary Public may not be translated as notario or notario publico. A first violation is grounds for suspension or revocation.",
    source: "Gov. Code § 8219.5",
  },
  {
    id: "ca-card-ron",
    area: "acts",
    title: "Online notarization",
    front: "Can a California notary perform remote online notarization today?",
    back: "No. The 2023 act is staged. Performing online notarization waits until the Secretary of State finishes the technology project or January 1, 2030, whichever is earlier.",
    source: "2026 handbook; Gov. Code § 8231",
  },
  {
    id: "ca-card-score",
    area: "administration",
    title: "Official score",
    front: "Is 70 percent the official passing score?",
    back: "No. The official exam needs a scaled score of at least 70. A scaled score is not a percent of the questions.",
    source: "CPS HR notary exam information, checked 2026-11-05",
  },
];

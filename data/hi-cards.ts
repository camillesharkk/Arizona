export type HiCard = {
  id: string; study: string; title: string; front: string; rule: string; boundary: string; mixup: string; source: string; sourceUrl: string;
};

export const hiCards: HiCard[] = [
  {
    id: "hi-card-001", study: "qualification", title: "Who commissions",
    front: "Who issues a Hawaii notary commission?", rule: "The attorney general.", boundary: "A circuit judge approves the bond. The judge does not issue the commission.",
    mixup: "The Lieutenant Governor handles apostilles, not commissions.", source: "HRS §456-1", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001.htm",
  },
  {
    id: "hi-card-002", study: "qualification", title: "Age and residence",
    front: "What age and residence do the AG page and the application rule share?", rule: "At least 18, and a Hawaii resident.", boundary: "The AG page and HAR §5-11-21(b)(5) do not use the same immigration wording. This card does not pick one.",
    mixup: "Do not import another state's age or residency rule.", source: "AG notary page; HAR §5-11-21", sourceUrl: "https://ag.hawaii.gov/notaries-public/",
  },
  {
    id: "hi-card-003", study: "qualification", title: "Two letters",
    front: "What two letters does the application require?", rule: "A character letter from a Hawaii resident who is not a relative or employer, and a justification letter from the employer or from a self-employed applicant.", boundary: "A government notary also needs a designation from the head of each employing department.",
    mixup: "The employer does not write the character letter.", source: "HAR §5-11-21", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-004", study: "qualification", title: "Ninety days",
    front: "What can happen if the application is still incomplete after 90 days?", rule: "It may be treated as abandoned and destroyed.", boundary: "A complete application is acted on within six months unless another law says otherwise.",
    mixup: "Ninety days is not the exam retake window.", source: "HAR §5-11-22", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-005", study: "application-exam", title: "Closed book",
    front: "What kind of exam does the AG page describe?", rule: "A written, closed-book exam after the application is approved.", boundary: "The page does not state the number of questions or the minutes.",
    mixup: "Do not borrow another state's question count.", source: "AG notary page", sourceUrl: "https://ag.hawaii.gov/notaries-public/",
  },
  {
    id: "hi-card-006", study: "application-exam", title: "Eighty percent",
    front: "What score passes?", rule: "Eighty percent, under HAR §5-11-32.", boundary: "The rule does not mention unscored items or a scaled score.",
    mixup: "A practice percentage on this site is not the official notice.", source: "HAR §5-11-32", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-007", study: "application-exam", title: "Missed exam",
    front: "What if the applicant does not show up and did not reschedule?", rule: "A new application with updated letters, and a $25 no-show fee.", boundary: "Moving the date more than 48 hours ahead is $15. Less than 48 hours ahead is $20.",
    mixup: "The $10 charge is the exam fee itself.", source: "HAR §5-11-32 and §5-11-46", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-008", study: "application-exam", title: "Two failures",
    front: "The first failure can be retaken how?", rule: "Without a new application if the retake is requested, paid, and scheduled within 14 days of the failure notice.", boundary: "A second failure means a 90-day wait before a new application.",
    mixup: "Fourteen days is not the restoration window.", source: "HAR §5-11-32(e) and (f)", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-009", study: "term-renewal", title: "Four years",
    front: "How long is the commission?", rule: "Four years from the commission date, unless it ends sooner.", boundary: "An act after revocation, suspension, or termination is invalid.",
    mixup: "One year is the restoration window, not the term.", source: "HRS §456-1; HAR §5-11-12", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001.htm",
  },
  {
    id: "hi-card-010", study: "term-renewal", title: "Restore or start over",
    front: "The commission was forfeited. What now?", rule: "It may be restored within one year if the renewal requirements and fees are met.", boundary: "After one year the person reapplies as a new applicant.",
    mixup: "The rule itemizes a $10 restoration application and an $80 restoration fee. It does not use one $90 line.", source: "HRS §456-1(b); HAR §5-11-46", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-011", study: "term-renewal", title: "Thirty-day notice",
    front: "A name, job, or address changes. What notice is due?", rule: "Written notice to the attorney general within 30 days.", boundary: "A missed address that sends renewal mail to the wrong place is a $50 fine. Other late change notices are $25.",
    mixup: "Do not wait for the next renewal.", source: "HAR §5-11-10", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-012", study: "term-renewal", title: "Suspension and revocation",
    front: "How long can a suspension last, and when can a revoked notary reapply?", rule: "A suspension cannot exceed ten years. A nonpermanent revocation allows a new application after five years.", boundary: "Reinstatement must be filed within 30 days after the suspension ends, or the commission is forfeited.",
    mixup: "Five years is not the failed-exam wait.", source: "HAR §5-11-41 and §5-11-42", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-013", study: "authority", title: "Own signature",
    front: "May the notary notarize the notary's own signature?", rule: "No.", boundary: "A fee waiver does not change the answer.",
    mixup: "Witnessing someone else's signature is a different act.", source: "HAR §5-11-4.5(a)(3)", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-014", study: "authority", title: "No loose certificate",
    front: "May the notary sign a certificate and let the signer attach it later?", rule: "No. The certificate cannot be delivered for attachment outside the notary's presence.", boundary: "The seal stays under the notary's sole control.",
    mixup: "An employer does not hold the seal.", source: "HAR §5-11-4.5(a)(5)", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-015", study: "authority", title: "No legal advice",
    front: "May a nonlawyer notary explain which deed will accomplish the signer's goal?", rule: "No. Legal advice is limited to a Hawaii attorney.", boundary: "The notary may still identify which notarial act is being requested.",
    mixup: "The seal is not a court judgment.", source: "HAR §5-11-4.5(a)(6)", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-016", study: "authority", title: "Government notary",
    front: "Does a government notary charge for government business?", rule: "No.", boundary: "Private fee work needs the attorney general's prior written approval, the legal fees, and the notary's own bond.",
    mixup: "Government service is not a remote online commission.", source: "HRS §456-18", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0018.htm",
  },
  {
    id: "hi-card-017", study: "identity", title: "Three-year ID",
    front: "May a listed photo ID be expired?", rule: "Yes, if it has a photo and signature and expired no more than three years before the act.", boundary: "Four years is too old for that credential.",
    mixup: "The older FAQ said current only. The statute controls.", source: "HRS §456-1.6", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
  },
  {
    id: "hi-card-018", study: "identity", title: "Personal knowledge",
    front: "What is personal knowledge?", rule: "Dealings sufficient to give reasonable certainty of identity.", boundary: "A stranger's introduction is not personal knowledge.",
    mixup: "Record a personal-knowledge statement in the journal.", source: "HRS §456-1.6(1)(A)", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
  },
  {
    id: "hi-card-019", study: "identity", title: "Credible witness",
    front: "Who can be a credible witness?", rule: "A person who appears before the notary and whom the notary knows, or whom the notary identifies with a listed photo credential.", boundary: "A spouse is not a witness merely by being a spouse.",
    mixup: "One person's ID does not identify the other signer.", source: "HRS §456-1.6(1)(D)", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
  },
  {
    id: "hi-card-020", study: "identity", title: "More ID",
    front: "May the notary ask for another credential?", rule: "Yes, when more is needed to be sure of identity.", boundary: "A private badge is not a listed government ID.",
    mixup: "Do not notarize a name that does not match unless identity is actually satisfied.", source: "HRS §456-1.6", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
  },
  {
    id: "hi-card-021", study: "acknowledgment", title: "Declaration, not oath",
    front: "What does the signer declare in an acknowledgment?", rule: "That the person signed for the purpose stated in the document.", boundary: "Representative capacity also requires a declaration of authority.",
    mixup: "Truth of the contents is a verification, not an acknowledgment.", source: "HRS §456-1.6", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
  },
  {
    id: "hi-card-022", study: "acknowledgment", title: "Already signed",
    front: "Must the notary have watched the original signing?", rule: "No. The signer must be present for the declaration. The signature can already be on the page.", boundary: "A mailed document with no appearance does not qualify.",
    mixup: "A jurat is the act that ties the oath to signing before the notary.", source: "HRS §456-1.6", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
  },
  {
    id: "hi-card-023", study: "acknowledgment", title: "Five dollars",
    front: "What is the in-person acknowledgment fee?", rule: "$5 for each party signing.", boundary: "A duplicate original beyond the first is $2.50 per person for the extra certificate.",
    mixup: "$25 is the remote fee, not this fee.", source: "HRS §456-17(7)", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0017.htm",
  },
  {
    id: "hi-card-024", study: "jurat-oath", title: "Truth oath",
    front: "What is a verification on oath or affirmation?", rule: "A declaration before the notary, on oath or affirmation, that a statement in the document is true.", boundary: "The signer must make that declaration. The seal does not replace it.",
    mixup: "Do not label that act as an acknowledgment.", source: "HRS §456-1.6", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
  },
  {
    id: "hi-card-025", study: "jurat-oath", title: "Oath fee",
    front: "What does the oath fee include?", rule: "$5, including the certificate.", boundary: "Affixing that certificate to every duplicate original beyond four is $2.50.",
    mixup: "Government business is not a personal $5.", source: "HRS §456-17(6); HRS §456-18", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0017.htm",
  },
  {
    id: "hi-card-026", study: "jurat-oath", title: "Same day",
    front: "When is the jurat certificate signed and dated?", rule: "Contemporaneously with the act.", boundary: "The next day is not contemporaneous.",
    mixup: "The commission expiration date is not the date of the act.", source: "HAR §5-11-8", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-027", study: "certificate-seal", title: "One stamp",
    front: "What does the rubber stamp contain?", rule: "Only the name, commission number, and the words notary public and State of Hawaii.", boundary: "One circular stamp, one to two inches, serrated or milled edge.",
    mixup: "A second rubber stamp is a $200 fine.", source: "HRS §456-3; HAR §5-11-5", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0003.htm",
  },
  {
    id: "hi-card-028", study: "certificate-seal", title: "Signature block",
    front: "What is added to the official signature?", rule: "The printed name and the commission expiration.", boundary: "Use the signature on file with the circuit clerk.",
    mixup: "Initials are not the official signature.", source: "HAR §5-11-6", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-029", study: "certificate-seal", title: "End of the seal",
    front: "What happens to the stamp when the commission ends?", rule: "It is delivered to the attorney general to be defaced or destroyed.", boundary: "The statute says immediately. The $200 fine applies if it is not surrendered within 90 days.",
    mixup: "Do not give it to the employer.", source: "HRS §456-3; HAR §5-11-46", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0003.htm",
  },
  {
    id: "hi-card-030", study: "journal", title: "One book",
    front: "How many tangible journals are active?", rule: "One for tangible documents. Electronic documents use one electronic journal.", boundary: "The paper book is bound, numbered, and within the rule's size limits.",
    mixup: "A spreadsheet does not replace the tangible journal.", source: "HRS §456-15; HAR §5-11-9", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0015.htm",
  },
  {
    id: "hi-card-031", study: "journal", title: "The entry",
    front: "What does each entry include?", rule: "Type, date, and time; the document and the nature of the act; name, address, and tangible signature; how the person was identified; and the fee, if any.", boundary: "Personal knowledge is a statement. A credential entry includes the number and expiration.",
    mixup: "The older FAQ list is shorter than the current statute.", source: "HRS §456-15(e)", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0015.htm",
  },
  {
    id: "hi-card-032", study: "journal", title: "Ten years",
    front: "How long is the journal kept?", rule: "Ten years after the last act in it.", boundary: "On resignation or expiration the notary keeps it and reports its location. On death it is transmitted to the attorney general.",
    mixup: "The old FAQ's 90-day turn-in is not the current statute.", source: "HRS §456-15", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0015.htm",
  },
  {
    id: "hi-card-033", study: "journal", title: "Audit",
    front: "Can the journal be inspected without notice?", rule: "Yes. The attorney general may audit at any time without prior notice.", boundary: "Failure to comply can be fined $50 to $500.",
    mixup: "The employer is not the inspector.", source: "HRS §456-15(j)", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0015.htm",
  },
  {
    id: "hi-card-034", study: "documents", title: "Language",
    front: "When does the FAQ say to refuse a foreign-language document?", rule: "When the notary does not thoroughly understand that language.", boundary: "Also refuse an English document if the person appearing does not appear to understand English.",
    mixup: "The signer's summary is not the notary's understanding.", source: "Notary FAQ", sourceUrl: "https://notary.ehawaii.gov/notary/public/faq.html",
  },
  {
    id: "hi-card-035", study: "documents", title: "Blanks and changes",
    front: "What does the FAQ say about blanks and corrections?", rule: "Decline if blanks will be filled in later. If the signer approves a change, initial beside it.", boundary: "Do not invent a date for an undated document. Write that it was undated at notarization.",
    mixup: "A page count is not an element of the current §5-11-8 certificate.", source: "Notary FAQ", sourceUrl: "https://notary.ehawaii.gov/notary/public/faq.html",
  },
  {
    id: "hi-card-036", study: "documents", title: "Power of attorney",
    front: "What copy of a power of attorney does the FAQ accept?", rule: "An original or a certified copy that actually grants the power being used.", boundary: "A plain photocopy is not enough.",
    mixup: "The agent's ID proves identity, not authority.", source: "Notary FAQ", sourceUrl: "https://notary.ehawaii.gov/notary/public/faq.html",
  },
  {
    id: "hi-card-037", study: "documents", title: "No room",
    front: "The certificate will not fit on the signature page. What does the FAQ say?", rule: "Write on that page that the certificate is on the next page.", boundary: "Do not leave a seal on a later page with no reference.",
    mixup: "Do not cover the signer's text.", source: "Notary FAQ", sourceUrl: "https://notary.ehawaii.gov/notary/public/faq.html",
  },
  {
    id: "hi-card-038", study: "fees-bond", title: "Bond",
    front: "What is the notary bond?", rule: "$1,000, to the State, from a Hawaii-authorized surety, approved by a circuit judge, and filed with the clerk where the notary resides.", boundary: "It is the notary's expense, except when a department requires a government notary's bond and pays for it.",
    mixup: "Do not use another state's bond amount.", source: "HRS §456-5", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0005.htm",
  },
  {
    id: "hi-card-039", study: "fees-bond", title: "Two fee texts",
    front: "Why do $40 and $100 both appear?", rule: "HRS §456-9 prints $40 to issue or renew and allows a rule adjustment. HAR §5-11-46 lists issuance and renewal at $100.", boundary: "The application line in the rule is $20. The exam line is $10.",
    mixup: "Name the text before naming the dollar.", source: "HRS §456-9; HAR §5-11-46", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0009.htm",
  },
  {
    id: "hi-card-040", study: "fees-bond", title: "Signer fees",
    front: "What may the notary demand for an in-person acknowledgment or oath?", rule: "$5. Remote acts under §456-23 are $25, except a duplicate-original certificate.", boundary: "A lower fee or no fee is allowed if the reason is not discriminatory.",
    mixup: "Government business is free.", source: "HRS §456-17", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0017.htm",
  },
  {
    id: "hi-card-041", study: "refusal-misconduct", title: "Lawful refusal",
    front: "When may the notary decline?", rule: "When identity fails, the signer does not understand, the signer is coerced, the document appears fraudulent, or blanks will be completed later.", boundary: "Do not refuse because of a protected characteristic or because you disagree with the document.",
    mixup: "Those are different reasons.", source: "Notary FAQ; HAR §5-11-4.5", sourceUrl: "https://notary.ehawaii.gov/notary/public/faq.html",
  },
  {
    id: "hi-card-042", study: "refusal-misconduct", title: "After the commission ends",
    front: "Is an act valid after suspension?", rule: "No.", boundary: "Keeping the seal does not extend the authority.",
    mixup: "Ninety days is not a grace period for notarizing.", source: "HAR §5-11-12", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-043", study: "authentication", title: "Not your apostille",
    front: "Who issues the apostille?", rule: "The Office of the Lieutenant Governor.", boundary: "The Notary Public Office does not authenticate the seal. The circuit court certificate is the comparison step the FAQ describes.",
    mixup: "Recheck the street address before a visit. The FAQ contact block is old.", source: "Notary FAQ", sourceUrl: "https://notary.ehawaii.gov/notary/public/faq.html",
  },
  {
    id: "hi-card-044", study: "authentication", title: "Specimen",
    front: "Why is the seal impression on file at the circuit court?", rule: "The FAQ says the court compares the document's seal with that specimen.", boundary: "The filing is not the journal and not the apostille.",
    mixup: "A second notary seal does not create the chain of certificates.", source: "Notary FAQ", sourceUrl: "https://notary.ehawaii.gov/notary/public/faq.html",
  },
  {
    id: "hi-card-045", study: "remote-online", title: "Second commission",
    front: "Can a first-time applicant start as a remote online notary?", rule: "No. Only an active notary may apply.", boundary: "The remote exam is separate and uses the eighty-percent rule in §5-11-32.",
    mixup: "Do not add remote duties to every ordinary applicant.", source: "HAR §5-11-62 and §5-11-64", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-046", study: "remote-online", title: "Sight and sound",
    front: "What must the technology do?", rule: "Simultaneous sight and sound, plus an audiovisual recording kept at least ten years.", boundary: "The notary is located in Hawaii. The signer is the remote person.",
    mixup: "A phone call is not enough.", source: "HRS §456-23", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0023.htm",
  },
  {
    id: "hi-card-047", study: "remote-online", title: "Two kinds of proofing",
    front: "What is the remote identity-proofing pair?", rule: "Credential analysis and a knowledge-based quiz of at least five questions, eighty percent, in two minutes.", boundary: "The notary cannot see or record the quiz. One retake is allowed within 24 hours.",
    mixup: "This quiz is not the notary commission exam.", source: "HAR §5-11-69", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-048", study: "remote-online", title: "Say it was remote",
    front: "What does the remote certificate add?", rule: "A statement that communication technology was used.", boundary: "The sample sentence is: This notarial act involved the use of communication technology.",
    mixup: "Ordinary acknowledgment wording alone hides the remote act.", source: "HRS §456-23(d)", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0023.htm",
  },
  {
    id: "hi-card-049", study: "application-exam", title: "Live dates",
    front: "Where are exam seats listed?", rule: "On the live Notary Exam Scheduler. Dates change.", boundary: "Results arrive in writing within 30 days. Do not call for the score.",
    mixup: "Do not memorize a month-old room list.", source: "Notary Exam Scheduler", sourceUrl: "https://notary.ehawaii.gov/notary/public/notary-scheduler.html",
  },
  {
    id: "hi-card-050", study: "fees-bond", title: "Nonrefundable",
    front: "Can the rule fees be refunded?", rule: "HAR §5-11-46 says the listed fees are nonrefundable.", boundary: "Failing the exam is not a refund trigger in that section.",
    mixup: "A practice-site purchase policy is not the State's fee rule.", source: "HAR §5-11-46", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-051", study: "journal", title: "Each copy",
    front: "Three notarized copies mean how many journal entries?", rule: "Three, if each copy was a separate notarial act.", boundary: "Matching text does not merge the entries.",
    mixup: "A daily summary is not the statute.", source: "HRS §456-15", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0015.htm",
  },
  {
    id: "hi-card-052", study: "certificate-seal", title: "Electronic device",
    front: "What happens to an electronic stamp at the end of the commission?", rule: "Disable it and declare the date and manner to the attorney general.", boundary: "The paper stamp is delivered to be destroyed. The journal is retained.",
    mixup: "Do not treat the stamp and the journal the same way.", source: "HRS §456-3; HRS §456-15", sourceUrl: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0003.htm",
  },
  {
    id: "hi-card-053", study: "refusal-misconduct", title: "Status notice",
    front: "A disciplinary decision or listed conviction occurs. What notice is due?", rule: "Written notice to the attorney general. Disciplinary decisions in any jurisdiction are reported within 30 days.", boundary: "The missed status notice is a $25 fine.",
    mixup: "Probation does not erase the notice.", source: "HAR §5-11-10.5", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
  {
    id: "hi-card-054", study: "authority", title: "Fee fairness",
    front: "May the fee depend on religion, politics, or age?", rule: "No.", boundary: "A lower fee or a waiver is allowed for a lawful reason.",
    mixup: "Disagreement with the document is not a reason to charge more or to refuse.", source: "HAR §5-11-4.5", sourceUrl: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
  },
];

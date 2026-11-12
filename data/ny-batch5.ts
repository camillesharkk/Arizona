import type { NyRow } from "./ny-batch2";

export const nyBatch5: (NyRow & { verified: string })[] = [
  {
    "id": "ny-068",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A remote signer sends a recorded video answering the notary's questions. No live meeting will occur. What must the notary do?",
    "options": [
      "Arrange live communication before proceeding",
      "Accept the recording because it shows a face",
      "Use email to replace the meeting",
      "Accept if the recording is less than a day old"
    ],
    "correct": 0,
    "why": "Communication must be live and in real time; a recording cannot supply the required interaction.",
    "miss": [
      "Correct. Communication must be live and in real time; a recording cannot supply the required interaction.",
      "A face on a recording does not provide live interaction.",
      "Email is not simultaneous sight and sound.",
      "The age of a recording does not make it live."
    ],
    "source": "New York Executive Law §135-c(2)(a)(ii), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-069",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A platform lets the public listen to a remote session through an unprotected link. What must be corrected before using it?",
    "options": [
      "Secure the transmission against interception by outsiders",
      "Ask the signer to speak quietly",
      "Remove the notary's fee",
      "Save a recording afterward"
    ],
    "correct": 0,
    "why": "The transmission must be secure against lawful interception by people outside the communication.",
    "miss": [
      "Correct. The transmission must be secure against lawful interception by people outside the communication.",
      "Speaking quietly does not secure a network transmission.",
      "A free act must meet the same security requirement.",
      "Recording does not prevent interception."
    ],
    "source": "New York Executive Law §135-c(2)(a)(i), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-070",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A signer with a hearing impairment needs an accessibility feature during the remote session. Which platform characteristic matters?",
    "options": [
      "It facilitates that communication when necessary and consistent with applicable law",
      "It prohibits all accommodations",
      "It replaces the signer with a relative",
      "It accepts only written messages without sight and sound"
    ],
    "correct": 0,
    "why": "The statutory definition addresses accessible communication while retaining simultaneous sight and sound.",
    "miss": [
      "Correct. The statutory definition addresses accessible communication while retaining simultaneous sight and sound.",
      "A blanket ban conflicts with the accessibility component.",
      "A relative does not replace the principal.",
      "Text alone does not meet the definition of communication technology."
    ],
    "source": "New York Executive Law §135-c(1)(a), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-071",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A vendor authenticates an unfamiliar remote signer using only one automated identity process. The notary has no personal knowledge of the signer. What statutory standard must regulations include?",
    "options": [
      "Two or more different identity authentication processes",
      "One process repeated twice",
      "Only a payment-card check",
      "No authentication when video is clear"
    ],
    "correct": 0,
    "why": "The statute requires standards involving at least two different processes; repeating one is not two different processes.",
    "miss": [
      "Correct. The statute requires standards involving at least two different processes; repeating one is not two different processes.",
      "Repetition does not create a different process.",
      "Payment alone does not meet the stated standard.",
      "Clear video does not eliminate identity authentication."
    ],
    "source": "New York Executive Law §135-c(2)(a)(iv), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-072",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "The signer signed version A, but the platform presents version B to the notary and cannot establish which was executed. What should the notary do?",
    "options": [
      "Resolve the document mismatch before performing the act",
      "Notarize version B because its title matches",
      "Let the recipient choose later",
      "Notarize both versions automatically"
    ],
    "correct": 0,
    "why": "The notary must be reasonably able to confirm that the instrument is the one on which the principal acted.",
    "miss": [
      "Correct. The notary must be reasonably able to confirm that the instrument is the one on which the principal acted.",
      "A matching title does not establish the same instrument.",
      "Later recipient selection does not satisfy the notary's duty.",
      "Certifying both does not resolve which was executed."
    ],
    "source": "New York Executive Law §135-c(4)(a)(i), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-073",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A transaction's applicable law does not allow the instrument to be signed electronically. Does electronic-notary registration alone permit electronic execution?",
    "options": [
      "No; the document must be eligible for electronic signature under applicable law",
      "Yes; registration overrides every document restriction",
      "Yes; if the signer is in New York",
      "Yes; if the session is recorded"
    ],
    "correct": 0,
    "why": "Section 135-c conditions electronic execution on applicable law permitting electronic signature.",
    "miss": [
      "Correct. Section 135-c conditions electronic execution on applicable law permitting electronic signature.",
      "Registration does not override that condition.",
      "The signer's location does not remove the restriction.",
      "A recording does not make an ineligible document eligible."
    ],
    "source": "New York Executive Law §135-c(4)(a)(i), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-074",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A completed remote certificate says nothing about how the principal appeared. What statement must be added?",
    "options": [
      "That the principal appeared through communication technology",
      "That the principal appeared physically at the notary's desk",
      "That identity verification was unnecessary",
      "That the session had no legal effect"
    ],
    "correct": 0,
    "why": "The remote online certificate must state appearance through communication technology.",
    "miss": [
      "Correct. The remote online certificate must state appearance through communication technology.",
      "A physical-appearance statement would misdescribe this session.",
      "Remote appearance does not waive identification.",
      "A compliant remote act can have legal effect."
    ],
    "source": "New York Executive Law §135-c(5)(d), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-075",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "An office manager asks for the electronic notary's signing credentials so staff can apply the signature while the notary is away. What is the correct response?",
    "options": [
      "Keep the signature under the notary's sole control",
      "Share credentials with salaried staff only",
      "Share credentials if the manager keeps a log",
      "Permit use for documents under a dollar limit"
    ],
    "correct": 0,
    "why": "Sole control is one of the statutory electronic-signature reliability requirements.",
    "miss": [
      "Correct. Sole control is one of the statutory electronic-signature reliability requirements.",
      "Employment does not transfer control of the notary's signature.",
      "A log does not cure shared control.",
      "There is no dollar exception to sole control."
    ],
    "source": "New York Executive Law §135-c(5)(b)(iii), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-076",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A platform permits replacement of the notarized document's pages without detecting any change. Which requirement is missing?",
    "options": [
      "A link that makes later changes to underlying data detectable",
      "A second payment receipt",
      "The signer's postal code",
      "A decorative border on the certificate"
    ],
    "correct": 0,
    "why": "The signature must be linked so subsequent changes to the document are detectable.",
    "miss": [
      "Correct. The signature must be linked so subsequent changes to the document are detectable.",
      "A receipt does not detect document alteration.",
      "Postal data is unrelated to tamper detection.",
      "Decoration does not provide integrity protection."
    ],
    "source": "New York Executive Law §135-c(5)(b)(v), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-077",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A notary wants to use the official electronic notarial signature to approve an ordinary office purchase order without performing a notarial act. Is that an authorized use?",
    "options": [
      "No; that signature is reserved for electronic notarial acts",
      "Yes; all business approvals qualify",
      "Yes; if the purchase is small",
      "Yes; if no notarization fee is charged"
    ],
    "correct": 0,
    "why": "The statute restricts use of this signature to electronic notarial acts.",
    "miss": [
      "Correct. The statute restricts use of this signature to electronic notarial acts.",
      "An ordinary approval is not automatically a notarial act.",
      "Purchase size does not change the restriction.",
      "The absence of a fee does not authorize another use."
    ],
    "source": "New York Executive Law §135-c(5)(c), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-078",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A vendor supplies the same electronic signature identity to every notary in a branch office. Which reliability requirement does this violate?",
    "options": [
      "The signature must be unique to the individual notary",
      "Every branch must have one shared signature",
      "The signature must identify only the employer",
      "Uniqueness is needed only on paper"
    ],
    "correct": 0,
    "why": "The statutory standard requires a signature unique to the notary.",
    "miss": [
      "Correct. The statutory standard requires a signature unique to the notary.",
      "Sharing is the defect, not the requirement.",
      "An employer identity does not identify the individual notary.",
      "The requirement expressly concerns electronic signatures."
    ],
    "source": "New York Executive Law §135-c(5)(b)(i), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-079",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A proprietary signing system claims a signature is valid but offers no way to verify it independently. What requirement must the notary check?",
    "options": [
      "The signature must be capable of independent verification",
      "The vendor's assertion alone is sufficient",
      "Only the signer's approval matters",
      "Verification is required only if a fee exceeds $25"
    ],
    "correct": 0,
    "why": "Independent verification is an express reliability criterion.",
    "miss": [
      "Correct. Independent verification is an express reliability criterion.",
      "A bare vendor assertion does not establish verifiability.",
      "The principal cannot waive the notary-signature standard.",
      "This standard is not conditioned on fee size."
    ],
    "source": "New York Executive Law §135-c(5)(b)(ii), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-080",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "An electronic certificate otherwise meets all statutory requirements and is attached to the record. A clerk says an image of a rubber stamp is always required. What does the statute provide?",
    "options": [
      "A stamp or seal image need not accompany the compliant electronic signature and certificate",
      "Every electronic act needs a photographed rubber stamp",
      "Only a blue stamp image is valid",
      "A stamp image replaces the certificate"
    ],
    "correct": 0,
    "why": "The statute dispenses with an image when a compliant electronic notarial certificate is attached.",
    "miss": [
      "Correct. The statute dispenses with an image when a compliant electronic notarial certificate is attached.",
      "A physical-stamp photograph is not invariably required.",
      "No blue-image condition is stated.",
      "The certificate remains necessary under this provision."
    ],
    "source": "New York Executive Law §135-c(6)(c), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-081",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A notary prepares a paper authenticity certificate from an electronic record and sees that its security features indicate a signature changed after execution. May the notary use the statutory certification saying no such changes were indicated?",
    "options": [
      "No; the notary cannot truthfully make that certification",
      "Yes; paper printing removes the change",
      "Yes; if the recipient requests it",
      "Yes; if the notary omits the date"
    ],
    "correct": 0,
    "why": "The statutory form certifies that security features indicated no changes or errors at printing; these facts contradict that statement.",
    "miss": [
      "Correct. The statutory form certifies that security features indicated no changes or errors at printing; these facts contradict that statement.",
      "Printing does not undo an indicated change.",
      "Recipient consent cannot make a false statement true.",
      "Omitting a date neither cures the discrepancy nor satisfies the form."
    ],
    "source": "New York Executive Law §135-c(6)(d)(iii), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-082",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A properly certified tangible copy of an electronic record is otherwise eligible for recording. May the recording officer reject it solely because the source was electronic?",
    "options": [
      "No; the statute directs acceptance of the eligible certified tangible copy",
      "Yes; all records must originate on paper",
      "Yes; certification has no recording effect",
      "Only if the signer pays an extra notary fee"
    ],
    "correct": 0,
    "why": "Section 135-c requires acceptance when the tangible copy is certified and otherwise eligible.",
    "miss": [
      "Correct. Section 135-c requires acceptance when the tangible copy is certified and otherwise eligible.",
      "Paper origin is not required in these circumstances.",
      "Certification has the recording effect specified by statute.",
      "An extra notary fee is not the acceptance condition."
    ],
    "source": "New York Executive Law §135-c(6)(d)(ii), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-083",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A notary registering electronic capability lists a name and email but omits any description of the signing technology. What must be supplied?",
    "options": [
      "A description of the technology used to attach the electronic signature",
      "The employer's annual revenue",
      "A list of every future customer",
      "Only the brand of the notary's printer"
    ],
    "correct": 0,
    "why": "The registration information includes a description of the electronic-signature technology.",
    "miss": [
      "Correct. The registration information includes a description of the electronic-signature technology.",
      "Employer revenue is not the missing statutory item.",
      "Future customer lists are not required by this provision.",
      "Printer brand alone does not describe signature attachment technology."
    ],
    "source": "New York Executive Law §135-c(3)(b)(iv), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-084",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "An electronic registration includes technology details but no specimen of the notary's electronic signature. Which additional item does the statute call for?",
    "options": [
      "An exemplar containing the notary's name and necessary reading instructions",
      "A customer's specimen signature instead",
      "A photograph of the office door",
      "A specimen only after the first completed act"
    ],
    "correct": 0,
    "why": "Registration requires an exemplar of the notary's electronic signature and any instructions needed to read it.",
    "miss": [
      "Correct. Registration requires an exemplar of the notary's electronic signature and any instructions needed to read it.",
      "A customer's signature is not the notary's exemplar.",
      "An office photo supplies no signature specimen.",
      "Registration precedes electronic acts; the exemplar is part of registration."
    ],
    "source": "New York Executive Law §135-c(3)(b)(v), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-085",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "During a remote signing, another person threatens the principal unless the principal signs. The notary is not satisfied the signature is voluntary. What does the statute allow?",
    "options": [
      "Refuse the electronic act",
      "Proceed because identity is established",
      "Proceed because the document is profitable",
      "Treat the threat as cured by recording it"
    ],
    "correct": 0,
    "why": "The notary may refuse when not satisfied that the signature is knowingly and voluntarily made.",
    "miss": [
      "Correct. The notary may refuse when not satisfied that the signature is knowingly and voluntarily made.",
      "Identification does not establish voluntariness.",
      "Commercial benefit does not cure coercion.",
      "Recording coercion does not remove it."
    ],
    "source": "New York Executive Law §135-c(9)(b), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-086",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A remote principal cannot understand what is being executed, and the notary is not satisfied the principal has capacity. What may the notary do?",
    "options": [
      "Refuse the act on capacity grounds",
      "Proceed if a relative requests it",
      "Proceed because the signature looks consistent",
      "Proceed if the platform passed identity checks"
    ],
    "correct": 0,
    "why": "Section 135-c permits refusal when the principal's competence or capacity is not satisfactory.",
    "miss": [
      "Correct. Section 135-c permits refusal when the principal's competence or capacity is not satisfactory.",
      "A relative's request does not establish the principal's capacity.",
      "Handwriting consistency does not establish capacity.",
      "Identity and capacity are different issues."
    ],
    "source": "New York Executive Law §135-c(9)(a), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-087",
    "study": "electronic",
    "topic": "electronic-ron",
    "difficulty": "medium",
    "free": false,
    "text": "A recipient objects that a compliant electronic notarization cannot satisfy New York personal-appearance requirements merely because the signer was remote. No law expressly excludes this authorization. What is the correct analysis?",
    "options": [
      "A conforming act satisfies the personal-appearance requirement under this section",
      "Remote appearance can never satisfy it",
      "Only an employer can waive appearance",
      "A second in-person notarization is invariably required"
    ],
    "correct": 0,
    "why": "Section 135-c gives a conforming act the specified personal-appearance effect, subject to express statutory exclusions.",
    "miss": [
      "Correct. Section 135-c gives a conforming act the specified personal-appearance effect, subject to express statutory exclusions.",
      "This ignores the express statutory authorization.",
      "The effect comes from law, not an employer waiver.",
      "The statute does not invariably require a duplicate in-person act."
    ],
    "source": "New York Executive Law §135-c(10), https://www.nysenate.gov/legislation/laws/EXC/135-C ; verified 2026-11-09",
    "verified": "2026-11-09"
  }
];

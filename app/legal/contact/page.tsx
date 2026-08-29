import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Contact", description: "Contact Arizona Exam.", path: paths.contact });

export default function Page() {
  return (
    <LegalCopy title="Contact">
      <p>Email the address in EMAIL_FROM once production mail is configured. For official notary questions, use the Arizona Secretary of State.</p>
      <p>
        Official:{" "}
        <a href="https://azsos.gov/business/notary" target="_blank" rel="noreferrer">
          azsos.gov/business/notary
        </a>
      </p>
    </LegalCopy>
  );
}

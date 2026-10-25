import { AccountClient } from "@/components/AccountClient";

export const metadata = {
  title: "Create Free Account",
  description: "Save Arizona notary practice scores, wrong answers, and last question on this device.",
};

export default function AccountPage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Account</p>
      <h1>Create a free study account</h1>
      <p className="lede">
        Optional. Practice without an account, or create one to keep scores and the wrong-answer notebook.
      </p>
      <AccountClient />
    </main>
  );
}

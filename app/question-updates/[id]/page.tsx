import { redirect } from "next/navigation";

export default async function UpdatedQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/?question-update=${encodeURIComponent(id)}`);
}

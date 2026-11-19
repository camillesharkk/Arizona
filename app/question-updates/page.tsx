import { redirect } from "next/navigation";

export default function QuestionUpdatesPage() {
  redirect("/?question-update=list");
}

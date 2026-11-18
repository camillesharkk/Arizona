"use client";

import { MessageDialog } from "@/components/MessageDialog";

export function DailyStudySaveDialog({ onDismiss, onSave }: {
  onDismiss: () => void;
  onSave: (includeNotebook: boolean) => void;
}) {
  return (
    <MessageDialog title="Also add to Wrong Answers?" onClose={(result) => {
      onDismiss();
      if (result === "daily-only" || result === "both") onSave(result === "both");
    }}>
      <p>Save this question to Daily Study and choose whether to add it to the Saved tab in Wrong Answers. Saving leaves your missed-answer count unchanged.</p>
      <form className="row message-dialog-close" method="dialog">
        <button className="btn btn-ghost" type="submit" value="daily-only" data-dialog-autofocus>Daily Study only</button>
        <button className="btn btn-primary" type="submit" value="both">Add to both</button>
      </form>
    </MessageDialog>
  );
}

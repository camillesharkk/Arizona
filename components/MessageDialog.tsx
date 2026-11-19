"use client";

import { useId, useLayoutEffect, useRef, type PointerEvent, type ReactNode } from "react";

function outsideDialog(event: PointerEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom;
}

export function MessageDialog({ title, onClose, onShown, children }: {
  title: string;
  onClose: (result: string) => void;
  onShown?: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutside = useRef(false);
  const shownCallback = useRef(onShown);
  shownCallback.current = onShown;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.querySelector("[data-dialog-autofocus]")?.setAttribute("autofocus", "");
    dialog.showModal();
    const frame = requestAnimationFrame(() => { if (dialog.open) shownCallback.current?.(); });
    return () => { cancelAnimationFrame(frame); dialog.close(); };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="card message-dialog"
      aria-labelledby={titleId}
      {...{ closedby: "any" }}
      onClose={(event) => {
        const dialog = event.currentTarget;
        if (dialog.open) return;
        const result = dialog.returnValue;
        dialog.returnValue = "";
        onClose(result);
      }}
      onPointerDown={(event) => {
        if (!("closedBy" in HTMLDialogElement.prototype)) pressedOutside.current = outsideDialog(event);
      }}
      onPointerUp={(event) => {
        if (pressedOutside.current && outsideDialog(event)) event.currentTarget.close();
        pressedOutside.current = false;
      }}
      onPointerCancel={() => { pressedOutside.current = false; }}
    >
      <div className="message-dialog-head">
        <h2 id={titleId}>{title}</h2>
        <button className="message-dialog-x" type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}

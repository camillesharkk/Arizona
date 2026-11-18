"use client";

import { useId, useLayoutEffect, useState, type ComponentPropsWithoutRef } from "react";

type FormProps = ComponentPropsWithoutRef<"form">;
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isField(element: Element): element is Field {
  return element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement;
}

function fieldError(field: Field) {
  const { validity } = field;
  if (validity.valueMissing) {
    if (field.dataset.requiredMessage) return field.dataset.requiredMessage;
    if (field instanceof HTMLSelectElement) return "Select an option.";
    if (field instanceof HTMLInputElement && field.type === "email") return "Enter your email address.";
    return "Fill out this field.";
  }
  if (field instanceof HTMLInputElement && field.type === "email" && validity.typeMismatch) {
    return "Enter a valid email address.";
  }
  if (validity.tooShort && !(field instanceof HTMLSelectElement)) return `Use at least ${field.minLength} characters.`;
  if (validity.tooLong && !(field instanceof HTMLSelectElement)) return `Use no more than ${field.maxLength} characters.`;
  if (field instanceof HTMLInputElement && field.type === "date") return "Enter a valid date.";
  return "Check this field and try again.";
}

export function EnglishForm({ children, onSubmit, onInput, onReset, ...props }: FormProps) {
  const errorId = useId();
  const [error, setError] = useState<{ field: Field; message: string } | null>(null);

  useLayoutEffect(() => {
    if (!error) return;
    const { field } = error;
    const describedBy = field.getAttribute("aria-describedby");
    const invalid = field.getAttribute("aria-invalid");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", describedBy ? `${describedBy} ${errorId}` : errorId);
    field.focus();
    return () => {
      if (describedBy === null) field.removeAttribute("aria-describedby");
      else field.setAttribute("aria-describedby", describedBy);
      if (invalid === null) field.removeAttribute("aria-invalid");
      else field.setAttribute("aria-invalid", invalid);
    };
  }, [error, errorId]);

  const submit: NonNullable<FormProps["onSubmit"]> = (event) => {
    const invalid = Array.from(event.currentTarget.elements).find(
      (element): element is Field => isField(element) && element.willValidate && !element.validity.valid,
    );
    if (invalid) {
      event.preventDefault();
      setError({ field: invalid, message: fieldError(invalid) });
      return;
    }
    setError(null);
    onSubmit?.(event);
  };

  return (
    <form
      {...props}
      noValidate
      onSubmit={submit}
      onInput={(event) => {
        if (error && error.field === event.target && error.field.validity.valid) setError(null);
        onInput?.(event);
      }}
      onReset={(event) => {
        setError(null);
        onReset?.(event);
      }}
    >
      {error && <p id={errorId} className="form-error" role="alert">{error.message}</p>}
      {children}
    </form>
  );
}

import { Breadcrumb } from "@/components/Breadcrumb";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";
import type { ReactNode } from "react";

export function LegalCopy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="wrap hero">
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: title, path: paths.privacy }]} />
      <h1>{title}</h1>
      {children}
      <p className="notice">{site.independent}</p>
    </main>
  );
}

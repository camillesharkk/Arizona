import Link from "next/link";
import { JsonLd, breadcrumbJson } from "@/components/JsonLd";

export function StateSectionCrumb({ state, name, path }: { state: "CA" | "HI"; name: string; path: string }) {
  const home = state === "CA" ? "/california/" : "/hawaii/";
  const label = state === "CA" ? "California" : "Hawaii";
  return (
    <Breadcrumb
      items={[
        { name: "Home", path: "/" },
        { name: label, path: home },
        { name: "Resources", path: `${home}resources/` },
        { name, path },
      ]}
    />
  );
}

export function Breadcrumb({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", ...breadcrumbJson(items) }} />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {items.map((item, i) => (
          <span key={item.path}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {i === items.length - 1 ? <span>{item.name}</span> : <Link href={item.path}>{item.name}</Link>}
          </span>
        ))}
      </nav>
    </>
  );
}

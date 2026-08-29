import Link from "next/link";
import { JsonLd, breadcrumbJson } from "@/components/JsonLd";

export function Breadcrumb({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJson(items)} />
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

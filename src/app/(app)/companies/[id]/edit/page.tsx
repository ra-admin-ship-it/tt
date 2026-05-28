import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/db/repository";
import { CompanyForm } from "@/components/CompanyForm";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const c = await getCompany(params.id);
  if (!c) notFound();
  return (
    <div className="max-w-5xl">
      <div className="text-sm text-slate-500 mb-2">
        <Link href="/companies" className="hover:underline">企業一覧</Link>
        <span className="mx-2">/</span>
        <Link href={`/companies/${c.id}`} className="hover:underline">{c.name}</Link>
        <span className="mx-2">/</span>
        <span>編集</span>
      </div>
      <h1 className="text-2xl font-bold mb-4">企業を編集</h1>
      <CompanyForm mode="edit" initial={c} />
    </div>
  );
}

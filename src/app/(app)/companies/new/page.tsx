import Link from "next/link";
import { CompanyForm } from "@/components/CompanyForm";

export const dynamic = "force-dynamic";

export default function NewCompanyPage() {
  return (
    <div className="max-w-5xl">
      <div className="text-sm text-slate-500 mb-2">
        <Link href="/companies" className="hover:underline">企業一覧</Link>
        <span className="mx-2">/</span>
        <span>新規登録</span>
      </div>
      <h1 className="text-2xl font-bold mb-4">企業を登録</h1>
      <CompanyForm mode="create" />
    </div>
  );
}

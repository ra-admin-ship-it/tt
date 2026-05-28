import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block bg-brand-600 text-white rounded-xl px-3 py-2 text-sm font-bold mb-3">
            SUBSIDY CRM
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            補助金見込み顧客管理ツール
          </h1>
          <p className="text-sm text-slate-600 mt-1">社内向けログイン</p>
        </div>
        <div className="card p-6">
          <LoginForm from={searchParams.from} />
        </div>
        <p className="text-xs text-slate-500 text-center mt-4">
          ※ パスワードは社内共有のものを利用してください
        </p>
      </div>
    </div>
  );
}

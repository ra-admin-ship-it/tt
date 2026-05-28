# 補助金見込み顧客管理ツール

社内向けに、補助金・助成金の対象になりそうな企業を管理するための Web ツールです。
セミナー案内・交流会案内・特別提案・営業フォローへの活用を想定しています。

## 技術構成

- Next.js 14 / App Router
- TypeScript / Tailwind CSS
- 簡易ログイン（パスワード1個 + Cookie / HMAC-SHA256署名）
- データストア：開発時はローカル JSON、本番は Supabase PostgreSQL（環境変数で自動切替）
- 国税庁 法人番号システムWeb-API（会社情報自動取得）

## 機能

| 画面 | パス |
| --- | --- |
| ログイン | `/login` |
| ダッシュボード | `/dashboard` |
| 企業一覧（検索・絞り込み） | `/companies` |
| 企業登録 | `/companies/new` |
| 企業詳細 | `/companies/[id]` |
| 企業編集 | `/companies/[id]/edit` |
| CSVインポート | `/import` |
| 設定 | `/settings` |

CSV エクスポートは一覧画面のフィルタ条件を反映して出力します。

---

## 1. ローカルで動かす

```bash
npm install
cp .env.local.example .env.local   # 値を書き換える
npm run dev
```

`http://localhost:3500` を開き、`.env.local` の `APP_PASSWORD` でログインします（デフォルト `dev`）。

### 必須の環境変数

| キー | 用途 |
| --- | --- |
| `APP_PASSWORD` | 簡易ログインのパスワード |
| `SESSION_SECRET` | Cookie 署名用のシークレット（任意の長い文字列） |

### 任意の環境変数

| キー | 用途 |
| --- | --- |
| `HOUJIN_BANGOU_APP_ID` | 国税庁 法人番号API のアプリケーションID（[登録](https://www.houjin-bangou.nta.go.jp/webapi/)） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase の Service Role Key（サーバー側専用） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon key（将来クライアント側で使う場合） |

`NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` の両方が設定されていれば
Supabase 接続、未設定ならローカル JSON（`data/db.json`）が使われます。

---

## 2. Supabase に切り替える

### 2-1. スキーマを作成

Supabase の Studio で SQL Editor を開き、本リポジトリの
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) の内容を貼り付けて実行します。
`companies` / `users` / `activity_logs` の3テーブルが作成されます。

### 2-2. キーを取得

Supabase プロジェクトの `Project Settings → API` から以下を取得：

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`（取り扱い注意。クライアントに渡してはいけない）
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`.env.local` に貼り付けて `npm run dev` を再起動すると、設定画面の「データストア」が
`Supabase` バッジに切り替わります。

### 2-3. 既存JSONからの移行（任意）

開発中に `data/db.json` で蓄積したデータがあれば、CSV エクスポート → Supabase に切替後に
CSV インポートで取り込めます。
（`/companies` 画面右上の「CSVエクスポート」→ `/import` で取り込み）

---

## 3. Vercel にデプロイして https 公開

### 3-1. GitHub に push

```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/<your-account>/<repo>.git
git push -u origin main
```

`.env.local` と `data/db.json` は `.gitignore` 済みなので push されません。

### 3-2. Vercel で Import

1. https://vercel.com/new で対象リポジトリを Import
2. Framework Preset は `Next.js`（自動検出）
3. Environment Variables に以下を設定：
   - `APP_PASSWORD`（社内共有用のパスワード）
   - `SESSION_SECRET`（長いランダム文字列）
   - `HOUJIN_BANGOU_APP_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

デプロイが完了すると `https://<project-name>.vercel.app` という https URL が払い出されます。
社内メンバーにはこのURLとパスワードを共有してください。

### 3-3. 独自ドメイン（任意）

Vercel のプロジェクト設定 → `Domains` で独自ドメインを追加できます。
DNS 設定を反映すれば、独自ドメイン + 自動 https で運用できます。

---

## ディレクトリ構成

```
src/
  app/
    (app)/                 認証必須エリアの共通レイアウト
      dashboard/
      companies/
        new/
        [id]/
          edit/
      import/
      settings/
    api/
      login/               ログインAPI
      houjin/              国税庁API中継
      companies/
        [id]/
        export/            CSVエクスポート
        import/            CSVインポート
    login/                 ログイン画面
  components/
    Sidebar.tsx
    CompanyForm.tsx
    Badge.tsx
  lib/
    auth.ts                Node.js環境のセッション署名/検証
    auth-edge.ts           middleware用（Web Crypto API）
    constants.ts           ステータス/商材/可能性の選択肢と色
    types.ts               ドメイン型定義
    schema.ts              入力バリデーション（Zod）
    csv.ts                 CSV import/export
    houjinApi.ts           国税庁Web-APIクライアント
    db/
      repository.ts        ファサード（JSONとSupabaseを切替）
      jsonRepository.ts    ローカルJSON実装
      supabaseRepository.ts Supabase実装
      supabaseClient.ts    Supabaseクライアント
      store.ts             JSON永続化
  middleware.ts            認証ミドルウェア
supabase/
  migrations/
    0001_init.sql          初期スキーマ
data/
  db.json                  ローカルJSONストア（gitignore対象）
```

---

## 制限事項（初期版）

- HubSpot 連携は未実装（`companies.hubspot_company_id` だけ持っている）
- MCP 連携は未実装
- 補助金対象可能性の自動判定ロジックは未実装（手動で「高/中/低/未確認」を選択）
- 従業員数の自動取得は未実装（国税庁APIでは取得不可、gBizINFO API 併用案）
- ユーザー管理は未実装（簡易ログイン1個のみ）

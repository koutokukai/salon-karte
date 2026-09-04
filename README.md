# サロンカルテ

サロン向けの顧客カルテ管理アプリ。**リピート率アップ**に特化し、予約管理は扱わない（サロンボードとの棲み分け）。
ネイル／マツエク／ヘア／リラクの4業種に対応し、**同じDBスキーマのまま入力フォームと配色だけが業種別に切り替わる**。

## 技術スタック

- Next.js（App Router）+ React + Tailwind CSS
- Prisma ORM + SQLite / Turso（libSQL アダプタでローカルと本番を同一コードで扱う）
- 認証：メール＋パスワード（bcrypt / JWT を httpOnly Cookie に格納）
- ホスティング：Vercel

## セットアップ

```bash
npm install
cp .env.example .env      # AUTH_SECRET を必ず変更する
npx prisma db push        # スキーマを DB に反映
npm run db:seed           # 4業種のデモ店舗を作成
npm run dev
```

デモアカウント（パスワードはすべて `password123`）

| メール | 業種 |
|---|---|
| nail@example.com | ネイル |
| eyelash@example.com | マツエク |
| hair@example.com | ヘア |
| relax@example.com | リラク |

## 本番（Vercel + Turso）

Vercel の環境変数に以下を設定する。コードの変更は不要。

```
TURSO_DATABASE_URL=libsql://xxxx.turso.io
TURSO_AUTH_TOKEN=...
AUTH_SECRET=（32文字以上のランダム文字列）
```

## ディレクトリ構成

```
prisma/schema.prisma          DBスキーマ（4テーブル・全業種を1テーブルで保持）
src/lib/services/             ビジネスロジック（Web と API で共有）
src/lib/validation.ts         入力検証（salon_type の変更をここで拒否）
src/lib/actions.ts            Server Actions（Web UI 用）
src/app/api/v1/               REST API（将来のネイティブアプリ用）
src/components/karte/         業種別カルテフォーム（KarteForm が salon_type で分岐）
docs/                         仕様書・各担当の設計ドキュメント
```

## 設計上の絶対ルール

1. `tenants.salon_type` は登録時に1度だけ設定し、以降変更できない
2. カルテは全業種の全カラムを1テーブルで保持する（該当しない業種は NULL）
3. 予約管理機能は作らない
4. 全クエリを `tenant_id` でスコープする

詳細は `CLAUDE.md` と `docs/00-ORG.md` を参照。

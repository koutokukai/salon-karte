# Vercel セットアップ（プロジェクト作成から公開まで）

作成日：2026-09-04

> **ダッシュボード操作なので、ここだけはユーザー作業。** 所要10分。
> コード側は「取り込めばそのまま通る」状態にしてある（環境変数ゼロでもビルドが成功する）。

---

## 1. プロジェクトを作る（3分）

**https://vercel.com/new**

1. **Import Git Repository** で `koutokukai/salon-karte` を選ぶ
   （リストに出ない場合は「Adjust GitHub App Permissions」からこのリポジトリを許可する）
2. 設定はすべて**既定のまま**でよい
   - Framework Preset … Next.js（自動検出）
   - Build Command … 触らない（`package.json` の `build` が `prisma generate && next build`）
   - Root Directory … `./`
3. **Environment Variables はこの時点では空でよい。**
   環境変数なしでもビルドは通るよう作ってある
4. **Deploy** を押す

数分で `https://salon-karte-xxxx.vercel.app` のようなURLが発行される。

### この時点で動くもの
- **`/lp` … モニター募集LP** ← DMに貼れる。ここが最優先の成果物
- ログイン画面の表示（ログイン自体はDB接続後）

---

## 2. データベースを繋ぐ（5分）

アプリ本体（カルテのログイン以降）と自動投稿の記録にDBが要る。

**https://turso.tech** でアカウントを作り、データベースを1つ作成する。

```bash
# ローカルに CLI を入れて作る場合
curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup
turso db create salon-karte
turso db show salon-karte --url        # → TURSO_DATABASE_URL
turso db tokens create salon-karte     # → TURSO_AUTH_TOKEN
```

ダッシュボードからでも同じものが取れる。

**スキーマの反映**（ローカルから1回だけ）:
```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx prisma db push
```

---

## 3. 環境変数を入れる

**Settings → Environment Variables**
```
https://vercel.com/【チーム名】/salon-karte/settings/environment-variables
```

| Key | Value | 用途 |
|---|---|---|
| `AUTH_SECRET` | 32文字以上のランダム文字列 | ログインのセッション署名 |
| `TURSO_DATABASE_URL` | `libsql://...` | DB |
| `TURSO_AUTH_TOKEN` | Tursoのトークン | DB |
| `IG_ACCESS_TOKEN` | 取得済みのInstagramトークン | 自動投稿 |
| `CRON_SECRET` | 任意のランダム文字列 | cronの認証 |

**`IG_USER_ID` は入れない**（未設定なら `me` を使う。IDは方式によって別物で、取り違えると疎通しない）。

**Environments は Production / Preview / Development を全てオン。**

### 反映させる
環境変数は**既存のデプロイには効かない。**
**Deployments → 最新の行の「…」→ Redeploy**

---

## 4. 動作確認

```bash
# LP
curl -s -o /dev/null -w "%{http_code}\n" https://【本番URL】/lp     # → 200

# 自動投稿を手で1回
node scripts/cron-run.mjs instagram --base https://【本番URL】
```

| 返り | 意味 |
|---|---|
| `{"status":"posted", ...}` | 成功。1件目が投稿されている |
| `{"status":"not_configured"}` | 環境変数が未設定、またはRedeployしていない |
| `{"status":"waiting_for_image"}` | 画像が本番にない（mainにマージされているか確認） |
| `{"status":"failed","error":"..."}` | エラー内容をそのまま共有してもらえれば対応する |

---

## 5. cron について

`vercel.json` に2本入っている。**Vercelが自動で拾う。設定操作は不要。**

| パス | 頻度 | 内容 |
|---|---|---|
| `/api/cron/instagram` | 毎日 01:00 UTC（＝10:00 JST） | キューの先頭を1件投稿 |
| `/api/cron/instagram-token` | 毎月1日 | トークンを延長 |

Hobbyプランは cron が1日1回までなので、この構成で収まっている。

---

## 6. つまずきやすい点

| 症状 | 原因 |
|---|---|
| ビルドが失敗する | 通常は起きない。エラー全文を共有すること |
| 環境変数を入れたのに `not_configured` | **Redeployしていない** |
| `waiting_for_image` から進まない | `public/social/*.jpg` が本番にない＝`main` にマージされていない |
| ログイン画面で500 | DB未接続。TursoのURLとトークンを確認 |

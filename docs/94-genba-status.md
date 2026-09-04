# 現状（ローカルセッション 2026-09-04）

作成：ゲンさん ／ 実装：エジソン ／ 営業：ひろぽん
**`docs/HANDOFF.md` はクラウドセッション時点の記録。以降の事実はこの文書が最新。**

---

## 1. 一番大きな訂正

引き継ぎ資料は「止まっているのは main へのマージと Vercel の環境変数だけ」としていたが、**実際は違った。**

| 引き継ぎ資料の記述 | 実際 |
|---|---|
| `main` へのマージが未了 | **既に完了していた**（origin/main = 作業ブランチ、差分ゼロ） |
| Vercel プロジェクトが未作成 | **作成済み・デプロイ済み**（`salon-karte-gamma.vercel.app`） |
| 環境変数を3つ入れるだけ | **7つ入っていたが、全て値が空だった** |
| Instagram のトークン取得済み | **本番には入っていなかった**（`IG_ACCESS_TOKEN` も空） |

### なぜ全部空だったか
`.env.example` を**そのまま** Vercel に取り込んだため。
`IG_USER_ID=""` のように空で置いてあるキーが「キーは存在するが値は空文字」で登録された。
ダッシュボード上は7件並んで見えるので、入っているように見えてしまう。
**Vercel の Secret 型は保存後に値を読み出せないため、外からは空だと確認できない。** これが発見を遅らせた。

---

## 2. 直したこと

### コード
1. **空文字を「未設定」として扱う**（`src/lib/env.ts`）
   `process.env.X ?? 既定値` は空文字を弾かない。実害が2つ出ていた。
   - `IG_USER_ID=""` → 対象が `me` にならず `//media` という壊れたパスになる
   - `SITE_URL=""` → 本番URLへのフォールバックが働かず「SITE_URL が未設定です」で落ちる

2. **Instagram 接続をアプリ側で完結**（`/api/instagram/connect` → `callback` → `publish`）
   トークンを人が貼る工程を無くした。認可すればアプリが自分で60日トークンに交換し
   `app_settings` に保存する（環境変数より優先される）。`@karte_lab` 以外は保存しない。
   接続直後の1枚に、DB書き込み・画像URL・投稿枠・次に出る投稿がまとめて出る。

3. **本番DBのスキーマをアプリ自身が初回だけ作る**（`src/lib/schema-bootstrap.ts`）
   Turso の接続トークンも書き込み専用で取り出せないため、手元から `db push` が打てない。
   テーブルが1つも無いときだけ、schema.prisma から生成した固定SQLを流す。公開口は作らない。

4. Proxy が `receiver` を渡していて `$extends` の振る舞いが外れていた／本番で
   Prisma クライアントを毎回 new していた、の2点を修正。

### インフラ（ダッシュボード）
- `IG_USER_ID` を**削除**（入れてはいけない値。空文字でも害になる）
- `SITE_URL` に本番URLを設定
- Meta アプリにリダイレクトURL `…/api/instagram/callback` を登録
- 権限 `instagram_business_basic` / `instagram_business_content_publish` が
  ともに「テスト準備完了」であることを確認
- **Turso（Vercel Marketplace・東京リージョン・Starter無料枠）を作成し salon-karte に接続**
  → `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` が自動で入る。コード変更は不要だった

---

## 3. 動いていることの確認

| 確認 | 結果 |
|---|---|
| `/lp`（モニター募集LP） | **200。公開済み** |
| 本番DBの読み書き | **成功**（スキーマも自動生成された） |
| Instagram 認可フロー | 認可画面まで到達。コードの受け取りまで確認 |
| build / typecheck / lint | エラーなし |
| 空DBからのスキーマ自動生成 | ローカルで再現確認済み |

---

## 4. 残り（ユーザー作業。これだけ）

**Vercel に3行貼って Redeploy。** 手順は `docs/95-remaining-setup.md`。

`IG_APP_SECRET` だけは Meta が表示にFacebookパスワードを要求するため代行できない。
`AUTH_SECRET` と `CRON_SECRET` は生成済みの値を渡してある。

貼り終えたら `https://salon-karte-gamma.vercel.app/api/instagram/connect` を開くだけで連携が閉じる。

---

## 5. 判断記録

| 判断 | 理由 |
|---|---|
| DBは Turso のまま（Postgres に乗り換えない） | 現行コードが libSQL アダプタ。乗り換えるとスキーマと接続層を触ることになり、DM開始が遅れる |
| Turso は Vercel Marketplace 経由で入れる | 接続情報が自動で入り、人がトークンを貼る工程が消える |
| スキーマ反映は初回限定のブートストラップ | 接続トークンを持ち出さずに済ませるため。無認証の管理エンドポイントは作らない |
| `IG_USER_ID` は削除（空にするのではなく） | 空文字が「設定されている」と誤認される事故を二度と起こさないため |
| 東京リージョン | 利用者が国内の個人サロン |

---

## 6. DM送信について

**LPは既に公開されている。DMは今日から送れる。**
文面・判定基準・1日の型は `docs/93-dm-playbook.md`（LPのURLは差し込み済み・そのまま送れる）。
送信先の管理は `marketing/outreach-list.csv`。

Instagram の自動投稿は上の3行が入れば動き出すが、**DM送信の前提条件ではない。**

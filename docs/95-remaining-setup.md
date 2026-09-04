# 残っている設定（これで全部）

作成：エジソン ／ 所要 5分

---

## やること

### 1. Meta から Instagram app secret を取り出す

https://developers.facebook.com/apps/2565927943919241/instagram-business/API-Setup-with-Instagram-login/

右上の **Instagram app secret** の【表示】を押す。
→ **Facebookのパスワードを求められる。** ここだけは代行できないので、ご本人でお願いします。

出てきた文字列をコピー。

### 2. Vercel に3行まとめて貼る

https://vercel.com/koutokukais-projects/salon-karte/settings/environment-variables

**Add Environment Variable** → `.env` をまとめて貼れる欄に、渡した `vercel-env.txt` の
下3行（`IG_APP_SECRET=` / `AUTH_SECRET=` / `CRON_SECRET=`）を貼る。
`IG_APP_SECRET=` の右に、手順1でコピーした文字列を入れる。

- **Environments は Production と Preview の両方をオン**
- Save

### 3. Redeploy する

**Deployments → 一番上の行の「…」→ Redeploy**

環境変数は既存のデプロイには効きません。ここを飛ばすと何も変わりません。

### 4. Instagram を接続する（ブラウザで開くだけ）

https://salon-karte-gamma.vercel.app/api/instagram/connect

`@karte_lab` で「許可」を押すと、**アプリが自分でトークンを受け取って保存します。**
貼り付け作業はありません。

「Instagram に接続しました」という画面が出て、そこに

- アカウント／種別
- トークンの保存先と残り日数
- 次に投稿されるもの、その画像URLが取得できるか
- **【今すぐ1件投稿する】ボタン**

が並びます。ボタンを押せば1本目が出ます。以降は**毎日10:00（JST）に1件ずつ自動投稿**。

---

## うまくいかないとき

画面にそのまま原因が出ます。よくあるもの：

| 出た文字 | 意味 |
|---|---|
| `IG_APP_SECRET が未設定です` | 手順2が未了、または手順3（Redeploy）を飛ばしている |
| `このアカウントでは接続できません` | `@karte_lab` 以外で認可した。Instagramを切り替えてやり直す |
| `画像の状態：取得できない（404）` | `public/social/` の画像が本番に無い |
| `state が一致しません` | 10分放置した。`/api/instagram/connect` からやり直す |

---

## 補足：それぞれの環境変数の役割

| Key | 役割 | 無いとどうなる |
|---|---|---|
| `IG_APP_SECRET` | 認可コードをトークンに交換する | Instagram に接続できない |
| `AUTH_SECRET` | ログインのセッション署名 | アプリにログインできない |
| `CRON_SECRET` | Vercel Cron からの呼び出しの認証 | **毎日の自動投稿が401で弾かれる** |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | 本番DB | — （Turso導入時に自動で入っています） |
| `SITE_URL` | 画像の公開URLを組み立てる | — （設定済み） |
| `IG_USER_ID` | **入れてはいけない** | 空でも壊れる。削除済み |
| `IG_ACCESS_TOKEN` | 初回のトークン | 手順4で接続すれば不要（DBの値が優先される） |

# Instagram 自動投稿（Content Publishing API）

作成日：2026-09-04 ／ 実装：エジソン

## できること・できないこと

| | 可否 |
|---|---|
| フィード投稿の自動化（画像＋キャプション） | **できる** |
| 投稿枠の確認、投稿実績の記録 | できる |
| トークンの自動更新 | できる |
| **こちらから営業DMを送る** | **できない** |

**DMは仕様上できません。** Messaging API は「相手からメッセージが来てから一定時間内の返信」しか
許可されておらず、面識のない相手へのDM送信はAPIに存在しません。
モニター募集のDMは人が送る前提のままです（文面・リストは `docs/90-monitor-campaign.md`）。

## 仕組み

```
content/instagram-queue.json   投稿キュー（上から順に1日1件）
public/social/*.jpg            投稿する画像（公開URLとしてInstagramが取りに来る）
        ↓
Vercel Cron  毎日 10:00 JST（01:00 UTC）
        ↓
GET /api/cron/instagram
   ├ 未投稿の先頭を1件選ぶ
   ├ 画像URLが実在するか確認（無ければ投稿せず翌日に持ち越し）
   ├ 残り投稿枠を確認（API経由は24時間で50件まで）
   ├ コンテナ作成 → 完了待ち → 公開
   └ social_posts に実績を記録
```

**画像が未配置ならキューを飛ばさず待ちます。** 投稿順が崩れないようにするため。

トークンは60日で失効するので、毎月1日に `/api/cron/instagram-token` が更新します。
更新後のトークンは `app_settings` テーブルに保存され、以降は環境変数より優先されます。

## 準備（ユーザー作業）

### 1. アカウントをプロフェッショナルに
`@karte_lab` を **プロフェッショナル（ビジネス）** に切り替える。個人アカウントではAPIが使えない。

### 2. Meta for Developers でアプリを作る
1. アプリを作成し、プロダクトに **Instagram** を追加
2. **Instagram API with Instagram Login** を選ぶ
3. 必要な権限：`instagram_business_basic` / `instagram_business_content_publish`
4. `@karte_lab` で認可し、短期トークンを取得

### 3. 長期トークンに交換
```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret=<アプリシークレット>
  &access_token=<短期トークン>
```
返ってきた `access_token`（60日有効）を使う。

### 4. Vercel の環境変数
```
IG_USER_ID       Instagram アカウントID
IG_ACCESS_TOKEN  上で取得した長期トークン
CRON_SECRET      任意のランダム文字列（cronの認証に使う）
SITE_URL         省略可。Vercelでは自動で入る
```

### 5. 画像を置く
`public/social/` に、`content/instagram-queue.json` の `image` と同じ名前で保存する。

**JPEG のみ。PNG は受け付けられません。** 1080×1080 推奨。

## 運用

| やりたいこと | 方法 |
|---|---|
| 投稿を追加する | `content/instagram-queue.json` の末尾に足し、画像を `public/social/` に置く |
| 投稿順を変える | JSON の並び順を変える。`slug` は投稿済み判定のキーなので変更しない |
| 今すぐ1件投稿する | `node scripts/cron-run.mjs instagram --base https://<本番URL>` |
| トークンを手で更新する | `node scripts/cron-run.mjs instagram-token --base https://<本番URL>` |
| 投稿実績を見る | `social_posts` テーブル（slug / media_id / permalink / posted_at） |

## cron の応答

| status | 意味 |
|---|---|
| `posted` | 投稿した |
| `waiting_for_image` | 画像がまだ置かれていない。翌日また試す |
| `queue_empty` | キューを投稿しきった。次の投稿を足す |
| `not_configured` | 環境変数が未設定。エラーではない |
| `quota_exceeded` | 24時間の投稿上限に達している |
| `failed` | API側でエラー。`social_posts.error` に理由が入る |

## 注意

- **API経由の投稿は24時間で50件まで。** 1日1件なので問題にならないが、まとめ投稿はしない
- 自動投稿ツールを別途入れる必要はない。**入れると凍結リスクが増える**ので使わない
- キャプションのハッシュタグは1投稿30個まで。現状は12〜15個で運用

## 出典
- [Instagram Graph API: Complete Developer Guide for 2026](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2026/)
- [Instagram API Rate Limits Explained (2026)](https://instantdm.com/blog/instagram-api-rate-limits-explained-2026-developer-guide)
- [Instagram Platform API 実装ガイド（エンドポイント一覧）](https://gist.github.com/PrenSJ2/0213e60e834e66b7e09f7f93999163fc)

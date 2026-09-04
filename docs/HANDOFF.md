# 引き継ぎ資料（クラウドセッション → ローカルセッション）

作成日：2026-09-04 ／ 作業ブランチ：`claude/matte-965nqy`（全てpush済み）

> **このファイルを最初に読めば、続きから作業できる。**
> 詳細は各ドキュメントに分かれている。ここは地図と現在地。

---

## 0. 30秒サマリ

**サロン向けの顧客カルテアプリ「サロンカルテ」を作り、Instagramでモニター10名を集める段階。**

- アプリ本体：**Phase 1 完成・動作確認済み**（4業種のカルテCRUD、認証、業種別UI、REST API）
- モニター募集LP：**完成**（実アプリ画面・写真・応募文面つき）
- Instagram自動投稿：**実装完了、認証も取得済み**。あとは環境変数を入れるだけ
- **止まっているのは `main` へのマージと、Vercelの環境変数だけ**

---

## 1. スタッフ体制（絶対にブレさせない）

セッションを跨いでも**6人の役割と境界は固定**。詳細 → `docs/00-ORG.md`

| スタッフ | 役割 | やらないこと |
|---|---|---|
| **ゲンさん** | 責任者。判断・方針確定・統括。ユーザーへ直接報告 | — |
| **リチャード** | 調査・競合分析・機能提案 | 実装 |
| **サレオツ** | UI設計・配色・心理設計 | 開発 |
| **メガネ** | 拡張・連携提案 | 暴走／**予約管理への言及** |
| **エジソン** | 実装・技術判断・デプロイ | 営業 |
| **ひろぽん** | 営業企画・DM・金額設計 | 開発 |

**発言は必ず名前を出す。** 誰の判断か曖昧にしない。
エジソンの実装提案とひろぽんの営業提案は、**ゲンさんを経由せずユーザーへ直接**。

---

## 2. 事業の決定事項（確定済み・蒸し返さない）

根拠と経緯 → `docs/70-target-strategy.md` ／ 判断記録 → `docs/60-gen-status.md`

1. **ターゲットは駆け出し・自宅サロン・1店舗個人事業主。** 大型店は狙わない
2. **恒久無料プランは作らない。3ヶ月無料トライアルに統一**（1ヶ月ではヘアが0回転で価値が発動しない）
3. **課金はアカウント数**：個人1＝980円／店舗パッケージ2込＝2,980円／追加1＝+500円／初期費用0
4. **アカウント共有は禁止しない。** 分けた方が得になる設計で自然に増やす
5. **店舗パッケージの売りは便利さではなく「スタッフが辞めてもカルテは店に残る」**
6. **店舗ごとにコードを分岐させない。** 個別要望は設定（独自項目・表示切替）で吸収
7. **ボタン配置を店ごとに変えない。** 誤操作防止がUI設計の根幹
8. **予約管理は作らない。** サロンボードとの棲み分け

### モニター施策（進行中）
- **10名限定・1ヶ月・特典は個人プラン生涯無料**
- 訴求の軸：**「言われたところはその日のうちに直す。スピードだけが取り柄」**
- クレカ登録は求めない。終了時はこちらから「CSVで全部持ち出せます」と言う

---

## 3. プロダクトの状態

### 技術構成
Next.js（App Router）／ Prisma 7 ＋ SQLite・Turso（libSQLアダプタ）／ Vercel
認証：メール＋パスワード（bcrypt ＋ JWT を httpOnly Cookie）

### 実装済み
- 4テーブル（`tenants` / `customers` / `kartes` / `chats`）＋ `social_posts` / `app_settings`
- 認証、顧客・カルテ・チャットのCRUD
- **業種別UI分岐**（`KarteForm` が `salon_type` を読んで子コンポーネントを呼ぶ）
- REST API `/api/v1/*`（ネイティブ化の布石。Web と同じサービス層を共有）
- Instagram自動投稿（cron 2本）
- デモデータ 4業種（`prisma/seed.ts`、パスワードは全て `password123`）

### 未実装（Phase 2 候補）
| 優先 | 項目 | 理由 |
|---|---|---|
| 高 | **ご無沙汰リスト**（前回来店から◯日経った顧客一覧） | 紙に絶対できない唯一の機能。移行動機そのもの |
| 高 | 写真アップロード（現状はURL入力） | 現場運用では必ず詰まる |
| 中 | PWA化（ホーム画面に追加） | 「アプリじゃないの？」を消す |
| 中 | カルテ編集画面（現状は新規作成のみ） | — |
| 中 | CSVエクスポート | 営業のクロージング材料 |
| 保留 | スタッフ管理・操作ログ（`docs/80`） | 店舗パッケージ用。個人版の配布を優先して後回し |

### 絶対ルール（技術）
1. `tenants.salon_type` は**登録時のみ**。更新スキーマとバリデーション入口の二重で拒否
2. カルテは**全業種1テーブル**。他業種のカラムは保存前に落とす（`stripForeignSalonFields`）
3. 全クエリを `tenant_id` でスコープ
4. 予約管理は作らない

### 動作確認済みの結果
```
顧客/カルテ/チャット作成   201
salon_type 変更試行       400「salon_type は登録後に変更できません」
他テナント顧客の参照      404
他業種カラムの混入        DB上 null
build / typecheck / lint  エラーなし
4業種すべてで画面描画確認済み
```

---

## 4. マーケティング資産

| 資産 | 場所 | 状態 |
|---|---|---|
| モニター募集LP | `marketing/lp/index.html` | 完成。実アプリ画面・写真・応募文面つき |
| LPのビルド | `marketing/lp/build.mjs` | 画像を data URI に埋めて `published.html` と `public/lp.html` を生成 |
| 公開URL（Artifact） | https://claude.ai/code/artifact/13145350-482c-4c76-b930-3cc36d93f527 | 非公開。共有メニューで公開に切替 |
| 画像プロンプト集 | `marketing/image-prompts.html` | コピーボタン付き。写真7点＋文字入り6種 |
| 　公開版 | https://claude.ai/code/artifact/77d590bd-9ab0-479d-99d0-d0cf2cedd99a | |
| 生成済み画像 | `public/social/*.jpg`（投稿9枚）／`marketing/lp/img/` | JPEG変換済み |
| 自前レンダリング | `marketing/social/assets.html` + `render.mjs` | 差し替え用の保険 |
| PNG→JPEG変換 | `marketing/tools/to-jpeg.mjs` | InstagramはJPEGのみ |
| 募集オペレーション | `docs/90-monitor-campaign.md` | 選定基準・接触先・DM文面3種・1日の動き |
| 送信先管理 | `marketing/outreach-list.csv` | 雛形 |
| Instagram初期設定 | `marketing/instagram-setup.md` | プロフィール文・初期9投稿の本文・ハッシュタグ |

### まだ足りない素材
- **ハイライトカバー5枚**（プロンプトは用意済み、未生成）
- 文字投稿3枚を**明るい配色で出し直し**（配色変更前に生成したものが暗い）

---

## 5. Instagram（ここまで完了している）

アカウント：**`@karte_lab`（カテラボ）** ／ ビジネスアカウントに切替済み
Metaアプリ：**`karte-lab`** ／ App ID `2565927943919241` ／ Instagram App ID `1101996452418775`

### 完了
- プロアカウント切替
- Metaアプリ作成、Instagram API（**Instagramログイン方式**）を追加
- 権限：`instagram_business_basic` ＋ **`instagram_business_content_publish`** を追加
- `@karte_lab` を **Instagramテスター**に追加し、Instagram側で承認済み
- **アクセストークン取得・疎通確認済み**（`/me` が `karte_lab` / BUSINESS を返した）

### ハマった点（同じ轍を踏まないために）
1. 「Add all required permissions」では **`content_publish` が入らない**。手動追加が必要
2. テスター追加は「テスター」ではなく **「Instagramテスター」** の役割を選ぶ
3. ダッシュボードで生成したトークンは**すでに長期**。`ig_exchange_token` に投げると `452` エラー。**交換は不要**
4. ダッシュボード表示の数字ID（`17841436591084974`）は**Facebookログイン方式のもの**。Instagramログイン方式では `/me` が返す別のIDになる
   → **コードは `IG_USER_ID` 未設定なら `me` を使う。IDは入れないのが正解**

### 残り
**Vercelに環境変数を3つ入れるだけ。**
```
IG_ACCESS_TOKEN = 取得済みトークン
CRON_SECRET     = 任意のランダム文字列
AUTH_SECRET     = 32文字以上のランダム文字列
```
`IG_USER_ID` は**入れない**。

場所：`https://vercel.com/【チーム名】/salon-karte/settings/environment-variables`
Environments は Production / Preview / Development を**全てオン**。
保存後、**Deployments → 最新 → Redeploy**（環境変数は既存デプロイに反映されないため）。

### 自動投稿の仕組み
```
content/instagram-queue.json   投稿キュー（9件、本文とタグ入り）
public/social/*.jpg            画像
        ↓ Vercel Cron 毎日 10:00 JST
GET /api/cron/instagram
   未投稿の先頭を1件 → 画像URL確認 → 投稿枠確認 → 3段階公開 → social_posts に記録
```
- 画像が未配置ならキューを飛ばさず翌日に持ち越す
- 環境変数未設定でも `not_configured` を返して落ちない
- トークンは毎月1日に `/api/cron/instagram-token` が自動延長
- 手動実行：`node scripts/cron-run.mjs instagram --base https://本番URL`

**⚠ DM送信はAPIでは不可能。** Messaging APIは相手からのメッセージ後の返信しか許可していない。
モニター募集のDMは人が送る（文面は `docs/90`）。

---

## 6. いま止まっていること（優先順）

### ① `main` へのマージ ← 最優先
cronのコード・投稿画像・LPは**作業ブランチにしかない**。
マージ＆pushすれば **Vercelが自動デプロイ** し、LPの公開URLが出る。
**LPのURLが出ないとDMが1通も送れない。**

```
git checkout main
git merge claude/matte-965nqy
git push origin main
```

### ② Vercelプロジェクトの作成と環境変数 → `docs/92-vercel-setup.md`
ダッシュボード操作。**クラウドセッションでは代行不可**。
コード側は環境変数ゼロでもビルドが通るようにしてあるので、**取り込んで Deploy を押すだけでLPが出る。**

### ③ 動作確認
```
node scripts/cron-run.mjs instagram --base https://本番URL
```
`{"status":"posted", ...}` が返れば1件目が投稿されている。

### ④ DM送信開始
`docs/90-monitor-campaign.md` の文面とリストで、**手で1通ずつ**。
目安：**10名確定に200〜400通、2〜3週間**。

---

## 7. クラウドセッションの制約（ローカルに移す理由）

| 作業 | クラウド | ローカル |
|---|---|---|
| コード実装・テスト・commit・push | **できる** | できる |
| `main` へのマージ → Vercel自動デプロイ | **できる**（許可があれば） | できる |
| Vercelダッシュボードの環境変数入力 | **できない** | ログイン済みブラウザ経由なら可能性あり |
| Meta / Instagram のUI操作 | **できない** | 同上 |
| ローカルのブラウザ操作全般 | **できない**（別マシンで、ログイン状態を持たない） | できる |

**パスワードの受け渡しはローカルでも行わない。** ログイン済みプロファイルを使えば不要。

### ローカルでの再開手順
```bash
git clone https://github.com/koutokukai/salon-karte.git
cd salon-karte
git checkout claude/matte-965nqy
npm install
cp .env.example .env      # AUTH_SECRET を設定
npx prisma db push
npm run db:seed
npm run dev
claude                    # このディレクトリで起動
```
起動したセッションには、まず **このファイルと `CLAUDE.md`** を読ませること。

---

## 8. ファイルの地図

```
CLAUDE.md                     開発規約・絶対ルール（セッション開始時に自動で読まれる）
docs/
  HANDOFF.md                  ← このファイル
  00-ORG.md                   組織憲章（6人の役割・承認ライン）
  SPEC.md                     プロジェクト仕様書 v1.0（原本）
  10-richard-research.md      競合調査（LiME / Bionly / salon record / カルテナ / EyeRec）
  20-saleotsu-ui.md           UI設計思想・配色・ワイヤー
  30-megane-roadmap.md        将来の連携候補（Tier 1〜3）
  40-edison-db-plan.md        DB実装と技術判断
  50-hiropon-sales.md         営業設計・価格・乗り換えトーク
  60-gen-status.md            判断記録（採用/保留/却下の理由）※3回分
  70-target-strategy.md       ターゲット戦略 v2 ★最新の事業方針
  80-edison-staff-design.md   スタッフ管理・操作ログ設計（保留中）
  90-monitor-campaign.md      モニター募集オペレーション
  91-instagram-api.md         Instagram API の準備・運用
  92-vercel-setup.md          Vercel プロジェクト作成・環境変数・動作確認
marketing/                    LP・画像プロンプト・SNS素材・送信先リスト
content/instagram-queue.json  投稿キュー
src/
  lib/services/               ビジネスロジック（Web と API で共有）
  lib/validation.ts           入力検証（salon_type の変更をここで拒否）
  lib/instagram.ts            Instagram API クライアント
  app/api/cron/               自動投稿・トークン更新
  components/karte/           業種別カルテフォーム
prisma/schema.prisma          DBスキーマ
scripts/cron-run.mjs          cron の手動実行
```

---

## 9. ユーザーへの申し送り

- **判断待ちは `main` マージの一言のみ。** それ以外は全て進んでいる
- 価格・ターゲット・トライアル期間は**確定済み**。再検討の必要なし
- **速度優先の方針**（荒削りでいいからDMを送る）で動いている。作り込みは後
- Instagram API設定で私の手順に3箇所の誤りがあった（例文のダミー混入・不要な交換工程・間違ったID）。
  **いずれも原因を特定してコードとドキュメントに反映済み**。同じ詰まり方はしない

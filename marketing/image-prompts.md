# 画像生成プロンプト集（GPTに投げる用）

作成日：2026-09-04 ／ 担当：サレオツ

## 全カットに共通で必ず付ける条件

以下を**すべてのプロンプトの末尾に付ける**。特に1行目は必須。

```
No text, no letters, no logos, no watermarks anywhere in the image.
Photorealistic, natural window light, shallow depth of field, muted desaturated color palette,
Japanese salon setting, clean and minimal, no clutter of branded products.
Do not show recognisable faces — hands, materials and interiors only.
```

**なぜ文字を入れないか：** 画像生成の日本語文字はほぼ崩れる。文字は後からこちらで乗せる。
**なぜ顔を出さないか：** 実在しない人物の顔を広告に使うと、後で差し替えが効かない。手元の方が刺さる。

---

## A. LP用

### A-1. ヒーロー背景（最優先）
用途：LPの一番上／OGP画像 ／ サイズ **1200 × 630**

```
A close-up of a woman's hands holding a smartphone at a small private nail salon desk.
Out of focus in the background: a compact salon table, a soft towel, a few nail polish bottles.
Warm afternoon window light from the left, soft shadows, calm and quiet atmosphere.
Shot from slightly above at a 30 degree angle. Muted beige and warm grey tones.
[共通条件をここに貼る]
```

### A-2. 「紙カルテが散らかっている」カット
用途：紙 vs アプリの比較セクション ／ サイズ **1:1**

```
A stack of handwritten paper customer record cards scattered on a salon desk,
some cards slightly bent and overlapping, a ballpoint pen resting on top,
a smartphone face-down beside them. Slightly messy but not dirty.
Top-down flat lay, soft natural light, muted warm grey and cream tones,
a faint sense of "this is hard to search through".
[共通条件をここに貼る]
```

### A-3〜A-6. 4業種の施術イメージ
用途：業種を切り替えたときの背景 ／ サイズ **4:5**（縦）

**ネイル**
```
Close-up of a nail technician's hands applying pale pink gel polish to a client's fingernail
at a small home salon desk. Soft purple-lavender accent in the background (a cloth or wall).
Macro focus on the nail, everything else softly blurred. Calm, precise, professional.
[共通条件をここに貼る]
```

**マツエク**
```
Close-up of an eyelash artist's gloved hands holding fine tweezers above a client's closed eye,
client lying on a treatment bed with a white towel. Dusty rose accent lighting.
Extremely shallow depth of field, focus on the tweezers. Quiet, delicate, clinical but warm.
[共通条件をここに貼る]
```

**ヘア**
```
A hairdresser's hands mixing hair colour in a small bowl with a tint brush at a salon counter,
several colour tubes lined up neatly beside it. Warm brown and beige tones, wood counter.
Shot from above at a slight angle, natural light. Focus on the mixing bowl.
[共通条件をここに貼る]
```

**リラク**
```
A therapist's hands resting on a client's shoulder during a relaxation massage,
client lying face-down covered with a soft white towel on a treatment bed.
Sage green and warm neutral tones, a small folded towel and an oil bottle out of focus nearby.
Very soft diffused light, deeply calm atmosphere.
[共通条件をここに貼る]
```

---

## B. Instagram用

### B-1. プロフィールアイコン
サイズ **1:1（1080×1080）**。※これだけは写真ではなく図形

```
A minimal flat vector icon of a simple record card with three short horizontal lines,
one line highlighted. Single accent colour deep violet (#7C5CBF) on an off-white background (#F7F6F3).
Centred, generous margin, thick rounded strokes, no gradient, no shadow, no text.
Flat design, app icon style, extremely simple.
```

### B-2. ハイライトカバー 5枚
サイズ **1:1**。5枚とも**同じ構図・同じ背景**で、中央の図形だけ変える。

```
A minimal flat vector icon centred on an off-white background (#F7F6F3),
single line-art style in deep violet (#7C5CBF), thin uniform strokes, lots of empty space,
no text, no shadow. The icon is: 【ここに下から1つ入れる】
```
| # | 差し込む内容 | ハイライト名（あとで手入力） |
|---|---|---|
| 1 | `a simple record card with lines` | はじめに |
| 2 | `a smartphone with a small check mark` | 使い方 |
| 3 | `a price tag` | 料金 |
| 4 | `a speech bubble with a question mark` | よくある質問 |
| 5 | `a hand raising` | モニター募集 |

### B-3. 初期フィード 9枚（3×3で世界観を作る）
サイズ **1:1**。**縦3列で色を揃える**と、プロフィールを開いた瞬間に整って見える。

| # | 種類 | 内容 | プロンプト |
|---|---|---|---|
| 1 | 写真 | ネイル施術の手元 | A-3（1:1に変更） |
| 2 | 文字 | 「前回のカラー、思い出せますか。」 | **画像生成しない。**下の"文字だけの投稿"参照 |
| 3 | 写真 | 紙カルテの山 | A-2 |
| 4 | 写真 | マツエク施術 | A-4（1:1に変更） |
| 5 | 画面 | アプリのスクリーンショット | **生成しない。**実画面を使う（`marketing/lp/img/`） |
| 6 | 写真 | ヘアカラー調合 | A-5（1:1に変更） |
| 7 | 文字 | 「モニター10名募集」 | 文字だけの投稿 |
| 8 | 写真 | リラク施術 | A-6（1:1に変更） |
| 9 | 写真 | サロンの机まわり（引き） | 下記 B-4 |

### B-4. サロンの机まわり（引きのカット）
```
A wide shot of a small tidy private salon corner: a wooden desk, one chair,
a folded white towel, a small plant, a tablet propped up on a stand.
Morning light through a sheer curtain. Muted natural tones, calm, spacious, minimal.
Nobody in the frame.
[共通条件をここに貼る]
```

### B-5. 「文字だけの投稿」は画像生成に投げない
日本語の文字は生成AIでは崩れる。**Canva等で作るか、こちらでHTMLから書き出す。**
書き出しが必要なら言ってください。LPと同じフォント・配色で1080×1080を出します。

---

## 使うときの注意

1. **1枚ずつ投げる。** まとめて頼むと条件が薄まる
2. できたら **文字が紛れ込んでいないか必ず確認**（看板・ラベルに崩れた文字が出やすい）
3. 顔が写ってしまったカットは使わない（後で差し替えできなくなる）
4. **同じ光・同じ色調で揃える。** バラバラだと一気に素人っぽくなる。
   うまくいった1枚が出たら、そのプロンプトの光の記述を他にもコピーする

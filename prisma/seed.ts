/**
 * 開発用シード。4業種ぶんのデモ店舗を作る。
 * 営業デモ（「もう動くものがあります」）でそのまま見せられる内容にしてある。
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const tenants = [
    { email: "nail@example.com", tenantName: "デモネイル 表参道店", salonType: "nail" },
    { email: "eyelash@example.com", tenantName: "デモアイラッシュ 銀座店", salonType: "eyelash" },
    { email: "hair@example.com", tenantName: "デモヘア 中目黒店", salonType: "hair" },
    { email: "relax@example.com", tenantName: "デモリラク 恵比寿店", salonType: "relax" },
  ];

  for (const row of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { email: row.email },
      update: {}, // ⚠ salon_type は更新しない（登録時のみ設定）
      create: { ...row, passwordHash },
    });

    const existing = await prisma.customer.count({ where: { tenantId: tenant.tenantId } });
    if (existing > 0) continue;

    const customer = await prisma.customer.create({
      data: {
        tenantId: tenant.tenantId,
        customerName: "山田 花子",
        phone: "090-1234-5678",
        birthday: new Date("1992-04-12"),
        familyInfo: "ご主人・お子様1人",
        petInfo: "トイプードル（ポチ）",
        favoriteDramas: JSON.stringify(["逃げるは恥だが役に立つ"]),
        favoriteMovies: JSON.stringify(["ラ・ラ・ランド"]),
        favoriteFoods: JSON.stringify(["あんぱん", "いちご"]),
        memo: "施術中の会話は控えめが好み。",
      },
    });

    const common = {
      tenantId: tenant.tenantId,
      customerId: customer.customerId,
      staffName: "佐藤",
      visitDate: daysAgo(21),
    };

    const bySalon: Record<string, Record<string, unknown>> = {
      nail: {
        menuName: "ワンカラー＋アート",
        price: 8800,
        nailColorFormula: "P-12 : 白 = 3 : 1（2度塗り）",
        nailShape: "オーバル",
        nailLength: "ショート",
        nailDuration: 90,
        nextVisitGuide: 24,
      },
      eyelash: {
        menuName: "まつげエクステ 120本",
        price: 7700,
        eyelashCurlType: "Cカール",
        eyelashCount: 120,
        eyelashThickness: "0.15mm",
        eyelashLength: "11mm",
        eyelashGlueType: "低刺激グルー A",
        eyelashDuration: 75,
        allergyFlag: true,
        allergyNote: "グルーで一度しみた経験あり。低刺激グルーを使用。",
        nextVisitGuide: 21,
      },
      hair: {
        menuName: "カット＋カラー",
        price: 12100,
        hairColorFormula: "アッシュ8 : ベージュ7 = 1 : 1／OX6% 20分",
        hairCutLength: "肩上5cm",
        hairTreatmentType: "内部補修トリートメント",
        hairProductUsed: "モイストシャンプー（店販）",
        hairDuration: 120,
        nextVisitGuide: 49,
      },
      relax: {
        menuName: "全身もみほぐし60分",
        price: 6600,
        relaxPressureLevel: "やや強",
        relaxSymptom: "肩こり・眼精疲労",
        relaxTargetArea: "肩・首・肩甲骨まわり",
        relaxOilType: "ラベンダー",
        relaxContraindication: "妊娠中のため腰への強圧は不可",
        relaxDuration: 60,
        allergyFlag: true,
        allergyNote: "妊娠中。禁忌事項あり。",
        nextVisitGuide: 14,
      },
    };

    await prisma.karte.create({ data: { ...common, ...bySalon[row.salonType] } });

    await prisma.chat.createMany({
      data: [
        {
          tenantId: tenant.tenantId,
          customerId: customer.customerId,
          messageFrom: "customer",
          messageBody: "先日はありがとうございました！次回の目安はいつ頃でしょうか？",
        },
        {
          tenantId: tenant.tenantId,
          customerId: customer.customerId,
          messageFrom: "tenant",
          messageBody: "こちらこそありがとうございました。3週間後くらいがおすすめです！",
        },
      ],
    });
  }

  console.log("seed 完了：4業種のデモ店舗を作成しました（パスワードは全て password123）");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

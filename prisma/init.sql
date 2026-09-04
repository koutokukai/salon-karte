-- CreateTable
CREATE TABLE "tenants" (
    "tenant_id" TEXT NOT NULL PRIMARY KEY,
    "tenant_name" TEXT NOT NULL,
    "salon_type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "birthday" DATETIME,
    "family_info" TEXT,
    "pet_info" TEXT,
    "favorite_movies" TEXT,
    "favorite_dramas" TEXT,
    "favorite_foods" TEXT,
    "memo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kartes" (
    "karte_id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "visit_date" DATETIME NOT NULL,
    "staff_name" TEXT,
    "menu_name" TEXT,
    "price" INTEGER,
    "photo_before" TEXT,
    "photo_after" TEXT,
    "memo" TEXT,
    "counseling_note" TEXT,
    "allergy_flag" BOOLEAN NOT NULL DEFAULT false,
    "allergy_note" TEXT,
    "next_visit_guide" INTEGER,
    "nail_color_formula" TEXT,
    "nail_design_photo" TEXT,
    "nail_shape" TEXT,
    "nail_length" TEXT,
    "nail_off_type" TEXT,
    "nail_duration" INTEGER,
    "eyelash_curl_type" TEXT,
    "eyelash_count" INTEGER,
    "eyelash_thickness" TEXT,
    "eyelash_length" TEXT,
    "eyelash_glue_type" TEXT,
    "eyelash_design" TEXT,
    "eyelash_duration" INTEGER,
    "hair_color_formula" TEXT,
    "hair_treatment_type" TEXT,
    "hair_cut_length" TEXT,
    "hair_perm_type" TEXT,
    "hair_product_used" TEXT,
    "hair_duration" INTEGER,
    "relax_pressure_level" TEXT,
    "relax_target_area" TEXT,
    "relax_oil_type" TEXT,
    "relax_symptom" TEXT,
    "relax_contraindication" TEXT,
    "relax_duration" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "kartes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "kartes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("customer_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chats" (
    "chat_id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "message_from" TEXT NOT NULL,
    "message_body" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chats_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chats_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("customer_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_posts" (
    "social_post_id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "media_id" TEXT,
    "permalink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "posted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "app_settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");

-- CreateIndex
CREATE INDEX "customers_tenant_id_idx" ON "customers"("tenant_id");

-- CreateIndex
CREATE INDEX "customers_tenant_id_customer_name_idx" ON "customers"("tenant_id", "customer_name");

-- CreateIndex
CREATE INDEX "kartes_tenant_id_visit_date_idx" ON "kartes"("tenant_id", "visit_date");

-- CreateIndex
CREATE INDEX "kartes_customer_id_visit_date_idx" ON "kartes"("customer_id", "visit_date");

-- CreateIndex
CREATE INDEX "chats_tenant_id_customer_id_created_at_idx" ON "chats"("tenant_id", "customer_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "social_posts_slug_key" ON "social_posts"("slug");


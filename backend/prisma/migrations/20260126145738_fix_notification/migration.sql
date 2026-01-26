-- 1. Drop tabel lama beserta dependensinya (agar bersih)
DROP TABLE IF EXISTS "notifications" CASCADE;

-- 2. Create tabel baru dengan ID BIGSERIAL (BigInt + Auto Increment)
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "actor_name" VARCHAR(255) NOT NULL,
    "reference_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action_data" JSONB,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- 3. Tambahkan Foreign Key ke User (Wajib ada karena relasi)
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Buat Index (Sesuai schema Anda)
CREATE INDEX "notifications_recipient_id_is_read_idx" ON "notifications"("recipient_id", "is_read");
CREATE INDEX "notifications_timestamp_idx" ON "notifications"("timestamp");
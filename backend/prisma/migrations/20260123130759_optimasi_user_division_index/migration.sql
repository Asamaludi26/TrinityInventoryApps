-- DropIndex
DROP INDEX "users_email_idx";

-- CreateIndex
CREATE INDEX "users_division_id_idx" ON "users"("division_id");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

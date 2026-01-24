-- DropIndex
DROP INDEX "standard_items_name_brand_idx";

-- CreateIndex
CREATE INDEX "asset_categories_is_customer_installable_idx" ON "asset_categories"("is_customer_installable");

-- CreateIndex
CREATE INDEX "asset_types_name_idx" ON "asset_types"("name");

-- CreateIndex
CREATE INDEX "standard_items_brand_idx" ON "standard_items"("brand");

-- CreateIndex
CREATE INDEX "standard_items_name_idx" ON "standard_items"("name");

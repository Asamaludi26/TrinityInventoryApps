-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('Super Admin', 'Admin Logistik', 'Admin Purchase', 'Leader', 'Staff');

-- CreateEnum
CREATE TYPE "item_classification" AS ENUM ('ASSET', 'MATERIAL');

-- CreateEnum
CREATE TYPE "tracking_method" AS ENUM ('INDIVIDUAL', 'BULK');

-- CreateEnum
CREATE TYPE "bulk_tracking_mode" AS ENUM ('COUNT', 'MEASUREMENT');

-- CreateEnum
CREATE TYPE "asset_status" AS ENUM ('Di Gudang', 'Digunakan', 'Dipegang (Custody)', 'Dalam Perbaikan', 'Keluar (Service)', 'Rusak', 'Diberhentikan', 'Menunggu Pengembalian', 'Habis Terpakai');

-- CreateEnum
CREATE TYPE "asset_condition" AS ENUM ('Baru', 'Baik', 'Bekas Layak Pakai', 'Rusak Ringan', 'Rusak Berat', 'Kanibal');

-- CreateEnum
CREATE TYPE "movement_type" AS ENUM ('IN_PURCHASE', 'IN_RETURN', 'OUT_INSTALLATION', 'OUT_HANDOVER', 'OUT_BROKEN', 'OUT_ADJUSTMENT', 'OUT_USAGE_CUSTODY');

-- CreateEnum
CREATE TYPE "location_context" AS ENUM ('WAREHOUSE', 'CUSTODY');

-- CreateEnum
CREATE TYPE "attachment_type" AS ENUM ('IMAGE', 'PDF', 'OTHER');

-- CreateEnum
CREATE TYPE "order_type" AS ENUM ('Regular Stock', 'Urgent', 'Project Based');

-- CreateEnum
CREATE TYPE "allocation_target" AS ENUM ('USAGE', 'INVENTORY');

-- CreateEnum
CREATE TYPE "item_status" AS ENUM ('Menunggu', 'Disetujui Logistik', 'Menunggu CEO', 'Disetujui', 'Proses Pembelian', 'Dalam Pengiriman', 'Tiba', 'Selesai', 'Ditolak', 'Dibatalkan', 'Siap Serah Terima', 'Dalam Proses');

-- CreateEnum
CREATE TYPE "item_approval_status" AS ENUM ('APPROVED', 'REJECTED', 'PARTIAL', 'STOCK_ALLOCATED', 'PROCUREMENT_NEEDED');

-- CreateEnum
CREATE TYPE "loan_request_status" AS ENUM ('Menunggu Persetujuan', 'Disetujui', 'Dipinjam', 'Dikembalikan', 'Ditolak', 'Terlambat', 'Menunggu Pengembalian');

-- CreateEnum
CREATE TYPE "asset_return_status" AS ENUM ('Menunggu Verifikasi', 'Disetujui Sebagian', 'Selesai Diverifikasi', 'Ditolak');

-- CreateEnum
CREATE TYPE "return_item_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "customer_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "divisions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL,
    "division_id" INTEGER,
    "permissions" TEXT[],
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "password_reset_requested" BOOLEAN NOT NULL DEFAULT false,
    "password_reset_request_date" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "refreshToken" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp_notifications" BOOLEAN NOT NULL DEFAULT false,
    "default_dashboard_view" VARCHAR(50),
    "items_per_page" INTEGER NOT NULL DEFAULT 20,
    "theme" VARCHAR(20) NOT NULL DEFAULT 'light',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_customer_installable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_types" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "classification" "item_classification",
    "tracking_method" "tracking_method",
    "unit_of_measure" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_items" (
    "id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "bulk_type" "bulk_tracking_mode",
    "unit_of_measure" VARCHAR(50),
    "base_unit_of_measure" VARCHAR(50),
    "quantity_per_unit" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "standard_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "type_id" INTEGER,
    "brand" VARCHAR(255) NOT NULL,
    "serial_number" VARCHAR(255),
    "mac_address" VARCHAR(100),
    "purchase_price" DECIMAL(15,2),
    "vendor" VARCHAR(255),
    "po_number" VARCHAR(100),
    "invoice_number" VARCHAR(100),
    "purchase_date" DATE,
    "warranty_end_date" DATE,
    "status" "asset_status" NOT NULL,
    "condition" "asset_condition" NOT NULL,
    "location" VARCHAR(255),
    "location_detail" TEXT,
    "current_user_id" INTEGER,
    "current_user_name" VARCHAR(255),
    "initial_balance" DECIMAL(10,2),
    "current_balance" DECIMAL(10,2),
    "quantity" INTEGER DEFAULT 1,
    "wo_ro_int_number" VARCHAR(100),
    "is_dismantled" BOOLEAN NOT NULL DEFAULT false,
    "dismantle_id" TEXT,
    "dismantle_info" JSONB,
    "notes" TEXT,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_id" INTEGER NOT NULL,
    "last_modified_date" TIMESTAMP(3) NOT NULL,
    "last_modified_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_thresholds" (
    "id" SERIAL NOT NULL,
    "item_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "category_id" INTEGER,
    "threshold_value" INTEGER NOT NULL,
    "alert_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_thresholds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" BIGSERIAL NOT NULL,
    "asset_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "movement_type" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "balance_after" DECIMAL(10,2) NOT NULL,
    "reference_id" VARCHAR(255),
    "actor_id" INTEGER NOT NULL,
    "actor_name" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "location_context" "location_context",
    "related_asset_id" TEXT,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "type" "attachment_type" NOT NULL,
    "size" INTEGER,
    "mime_type" VARCHAR(100),
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asset_id" TEXT,
    "customer_id" TEXT,
    "installation_id" TEXT,
    "maintenance_id" TEXT,
    "dismantle_id" TEXT,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "user_name" VARCHAR(255) NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "details" TEXT NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "reference_id" TEXT,
    "asset_id" TEXT,
    "customer_id" TEXT,
    "request_id" TEXT,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "doc_number" VARCHAR(50),
    "requester_id" INTEGER NOT NULL,
    "requester_name" VARCHAR(255) NOT NULL,
    "division_id" INTEGER NOT NULL,
    "division_name" VARCHAR(255) NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_type" "order_type" NOT NULL,
    "allocation_target" "allocation_target",
    "justification" TEXT,
    "project_name" VARCHAR(255),
    "status" "item_status" NOT NULL,
    "total_value" DECIMAL(15,2),
    "logistic_approver_id" INTEGER,
    "logistic_approver_name" VARCHAR(255),
    "logistic_approval_date" TIMESTAMP(3),
    "final_approver_id" INTEGER,
    "final_approver_name" VARCHAR(255),
    "final_approval_date" TIMESTAMP(3),
    "rejected_by_id" INTEGER,
    "rejected_by_name" VARCHAR(255),
    "rejected_by_division" VARCHAR(255),
    "rejection_date" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "actual_shipment_date" TIMESTAMP(3),
    "arrival_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "completed_by_id" INTEGER,
    "completed_by_name" VARCHAR(255),
    "is_prioritized_by_ceo" BOOLEAN NOT NULL DEFAULT false,
    "ceo_disposition_date" TIMESTAMP(3),
    "ceo_follow_up_sent" BOOLEAN NOT NULL DEFAULT false,
    "last_follow_up_at" TIMESTAMP(3),
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "partially_registered_items" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_items" (
    "id" SERIAL NOT NULL,
    "request_id" TEXT NOT NULL,
    "item_name" VARCHAR(255) NOT NULL,
    "item_type_brand" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" VARCHAR(50),
    "keterangan" TEXT NOT NULL,
    "available_stock" INTEGER,
    "category_id" INTEGER,
    "type_id" INTEGER,
    "approval_status" "item_approval_status",
    "approved_quantity" INTEGER,
    "rejection_reason" TEXT,
    "purchase_price" DECIMAL(15,2),
    "vendor" VARCHAR(255),
    "po_number" VARCHAR(100),
    "invoice_number" VARCHAR(100),
    "purchase_date" DATE,
    "warranty_end_date" DATE,
    "purchase_filled_by_id" INTEGER,
    "purchase_fill_date" TIMESTAMP(3),
    "registered_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_activities" (
    "id" BIGSERIAL NOT NULL,
    "request_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" INTEGER NOT NULL,
    "author_name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "parent_id" BIGINT,
    "payload" JSONB NOT NULL,

    CONSTRAINT "request_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_requests" (
    "id" TEXT NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "requester_name" VARCHAR(255) NOT NULL,
    "division_id" INTEGER NOT NULL,
    "division_name" VARCHAR(255) NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "loan_request_status" NOT NULL,
    "notes" TEXT,
    "approver_id" INTEGER,
    "approver_name" VARCHAR(255),
    "approval_date" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "actual_return_date" TIMESTAMP(3),
    "handover_id" TEXT,
    "returned_asset_ids" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_items" (
    "id" SERIAL NOT NULL,
    "loan_request_id" TEXT NOT NULL,
    "item_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" VARCHAR(50),
    "keterangan" TEXT NOT NULL,
    "return_date" DATE,
    "approval_status" "item_approval_status",
    "approved_quantity" INTEGER,
    "rejection_reason" TEXT,

    CONSTRAINT "loan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_asset_assignments" (
    "id" SERIAL NOT NULL,
    "loan_request_id" TEXT NOT NULL,
    "loan_item_id" INTEGER NOT NULL,
    "asset_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),

    CONSTRAINT "loan_asset_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_returns" (
    "id" TEXT NOT NULL,
    "doc_number" VARCHAR(50) NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL,
    "loan_request_id" TEXT NOT NULL,
    "returned_by_id" INTEGER NOT NULL,
    "returned_by_name" VARCHAR(255) NOT NULL,
    "status" "asset_return_status" NOT NULL,
    "verified_by_id" INTEGER,
    "verified_by_name" VARCHAR(255),
    "verification_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_return_items" (
    "id" SERIAL NOT NULL,
    "return_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "returned_condition" "asset_condition" NOT NULL,
    "notes" TEXT,
    "status" "return_item_status" NOT NULL,
    "verification_notes" TEXT,

    CONSTRAINT "asset_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handovers" (
    "id" TEXT NOT NULL,
    "doc_number" VARCHAR(50) NOT NULL,
    "handover_date" TIMESTAMP(3) NOT NULL,
    "menyerahkan_id" INTEGER NOT NULL,
    "menyerahkan_name" VARCHAR(255) NOT NULL,
    "penerima_id" INTEGER NOT NULL,
    "penerima_name" VARCHAR(255) NOT NULL,
    "mengetahui_id" INTEGER NOT NULL,
    "mengetahui_name" VARCHAR(255) NOT NULL,
    "wo_ro_int_number" VARCHAR(100),
    "status" "item_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handovers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handover_items" (
    "id" SERIAL NOT NULL,
    "handover_id" TEXT NOT NULL,
    "asset_id" TEXT,
    "item_name" VARCHAR(255) NOT NULL,
    "item_type_brand" VARCHAR(255) NOT NULL,
    "condition_notes" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" VARCHAR(50),
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "handover_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" "customer_status" NOT NULL,
    "installation_date" DATE NOT NULL,
    "service_package" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installed_materials" (
    "id" SERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "material_asset_id" TEXT,
    "item_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "installation_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installed_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installations" (
    "id" TEXT NOT NULL,
    "doc_number" VARCHAR(50) NOT NULL,
    "request_number" VARCHAR(50),
    "installation_date" TIMESTAMP(3) NOT NULL,
    "technician_id" INTEGER NOT NULL,
    "technician_name" VARCHAR(255) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "notes" TEXT NOT NULL,
    "status" "item_status" NOT NULL,
    "acknowledger_id" INTEGER,
    "acknowledger_name" VARCHAR(255),
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installation_materials" (
    "id" SERIAL NOT NULL,
    "installation_id" TEXT NOT NULL,
    "material_asset_id" TEXT,
    "item_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,

    CONSTRAINT "installation_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "doc_number" VARCHAR(50) NOT NULL,
    "request_number" VARCHAR(50),
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "technician_id" INTEGER NOT NULL,
    "technician_name" VARCHAR(255) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "problem_description" TEXT NOT NULL,
    "actions_taken" TEXT NOT NULL,
    "work_types" TEXT[],
    "priority" VARCHAR(50),
    "status" "item_status" NOT NULL,
    "completed_by_id" INTEGER,
    "completed_by_name" VARCHAR(255),
    "completion_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_materials" (
    "id" SERIAL NOT NULL,
    "maintenance_id" TEXT NOT NULL,
    "material_asset_id" TEXT,
    "item_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,

    CONSTRAINT "maintenance_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_replacements" (
    "id" SERIAL NOT NULL,
    "maintenance_id" TEXT NOT NULL,
    "old_asset_id" TEXT NOT NULL,
    "new_asset_id" TEXT NOT NULL,
    "retrieved_asset_condition" "asset_condition" NOT NULL,

    CONSTRAINT "maintenance_replacements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dismantles" (
    "id" TEXT NOT NULL,
    "doc_number" VARCHAR(50) NOT NULL,
    "request_number" VARCHAR(50),
    "asset_id" TEXT NOT NULL,
    "asset_name" VARCHAR(255) NOT NULL,
    "dismantle_date" TIMESTAMP(3) NOT NULL,
    "technician_id" INTEGER NOT NULL,
    "technician_name" VARCHAR(255) NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_address" TEXT NOT NULL,
    "retrieved_condition" "asset_condition" NOT NULL,
    "notes" TEXT,
    "acknowledger_id" INTEGER,
    "acknowledger_name" VARCHAR(255),
    "status" "item_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dismantles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
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

-- CreateTable
CREATE TABLE "whatsapp_logs" (
    "id" BIGSERIAL NOT NULL,
    "target_group" VARCHAR(100) NOT NULL,
    "group_name" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "reference_id" TEXT,
    "reference_type" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "sent_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "data_type" VARCHAR(20) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "updated_by_id" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DivisionCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DivisionCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InstalledAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstalledAssets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MaintenanceAssets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MaintenanceAssets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_division_id_idx" ON "users"("role", "division_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_categories_name_key" ON "asset_categories"("name");

-- CreateIndex
CREATE INDEX "asset_types_classification_tracking_method_idx" ON "asset_types"("classification", "tracking_method");

-- CreateIndex
CREATE UNIQUE INDEX "asset_types_category_id_name_key" ON "asset_types"("category_id", "name");

-- CreateIndex
CREATE INDEX "standard_items_name_brand_idx" ON "standard_items"("name", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "standard_items_type_id_name_brand_key" ON "standard_items"("type_id", "name", "brand");

-- CreateIndex
CREATE INDEX "assets_status_category_id_idx" ON "assets"("status", "category_id");

-- CreateIndex
CREATE INDEX "assets_serial_number_idx" ON "assets"("serial_number");

-- CreateIndex
CREATE INDEX "assets_mac_address_idx" ON "assets"("mac_address");

-- CreateIndex
CREATE INDEX "assets_current_user_id_idx" ON "assets"("current_user_id");

-- CreateIndex
CREATE INDEX "assets_brand_name_idx" ON "assets"("brand", "name");

-- CreateIndex
CREATE INDEX "assets_name_brand_notes_idx" ON "assets"("name", "brand", "notes");

-- CreateIndex
CREATE INDEX "stock_thresholds_item_name_brand_idx" ON "stock_thresholds"("item_name", "brand");

-- CreateIndex
CREATE INDEX "stock_thresholds_alert_enabled_idx" ON "stock_thresholds"("alert_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "stock_thresholds_item_name_brand_key" ON "stock_thresholds"("item_name", "brand");

-- CreateIndex
CREATE INDEX "stock_movements_asset_name_brand_date_idx" ON "stock_movements"("asset_name", "brand", "date");

-- CreateIndex
CREATE INDEX "stock_movements_date_idx" ON "stock_movements"("date");

-- CreateIndex
CREATE INDEX "stock_movements_type_idx" ON "stock_movements"("type");

-- CreateIndex
CREATE INDEX "stock_movements_actor_id_idx" ON "stock_movements"("actor_id");

-- CreateIndex
CREATE INDEX "attachments_entity_type_entity_id_idx" ON "attachments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "attachments_uploaded_at_idx" ON "attachments"("uploaded_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_timestamp_idx" ON "activity_logs"("timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "requests_doc_number_key" ON "requests"("doc_number");

-- CreateIndex
CREATE INDEX "requests_status_request_date_idx" ON "requests"("status", "request_date");

-- CreateIndex
CREATE INDEX "requests_requester_id_division_id_idx" ON "requests"("requester_id", "division_id");

-- CreateIndex
CREATE INDEX "requests_doc_number_idx" ON "requests"("doc_number");

-- CreateIndex
CREATE INDEX "requests_is_registered_idx" ON "requests"("is_registered");

-- CreateIndex
CREATE INDEX "request_items_request_id_idx" ON "request_items"("request_id");

-- CreateIndex
CREATE INDEX "request_items_item_name_item_type_brand_idx" ON "request_items"("item_name", "item_type_brand");

-- CreateIndex
CREATE INDEX "request_activities_request_id_timestamp_idx" ON "request_activities"("request_id", "timestamp");

-- CreateIndex
CREATE INDEX "loan_requests_status_request_date_idx" ON "loan_requests"("status", "request_date");

-- CreateIndex
CREATE INDEX "loan_requests_requester_id_idx" ON "loan_requests"("requester_id");

-- CreateIndex
CREATE INDEX "loan_items_loan_request_id_idx" ON "loan_items"("loan_request_id");

-- CreateIndex
CREATE INDEX "loan_asset_assignments_asset_id_idx" ON "loan_asset_assignments"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "loan_asset_assignments_loan_request_id_loan_item_id_asset_i_key" ON "loan_asset_assignments"("loan_request_id", "loan_item_id", "asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_returns_doc_number_key" ON "asset_returns"("doc_number");

-- CreateIndex
CREATE INDEX "asset_returns_loan_request_id_idx" ON "asset_returns"("loan_request_id");

-- CreateIndex
CREATE INDEX "asset_returns_doc_number_idx" ON "asset_returns"("doc_number");

-- CreateIndex
CREATE INDEX "asset_return_items_asset_id_idx" ON "asset_return_items"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_return_items_return_id_asset_id_key" ON "asset_return_items"("return_id", "asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "handovers_doc_number_key" ON "handovers"("doc_number");

-- CreateIndex
CREATE INDEX "handovers_doc_number_idx" ON "handovers"("doc_number");

-- CreateIndex
CREATE INDEX "handovers_handover_date_idx" ON "handovers"("handover_date");

-- CreateIndex
CREATE INDEX "handover_items_handover_id_idx" ON "handover_items"("handover_id");

-- CreateIndex
CREATE INDEX "handover_items_asset_id_idx" ON "handover_items"("asset_id");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customers_name_address_idx" ON "customers"("name", "address");

-- CreateIndex
CREATE INDEX "installed_materials_customer_id_idx" ON "installed_materials"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "installations_doc_number_key" ON "installations"("doc_number");

-- CreateIndex
CREATE INDEX "installations_doc_number_idx" ON "installations"("doc_number");

-- CreateIndex
CREATE INDEX "installations_customer_id_idx" ON "installations"("customer_id");

-- CreateIndex
CREATE INDEX "installation_materials_installation_id_idx" ON "installation_materials"("installation_id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenances_doc_number_key" ON "maintenances"("doc_number");

-- CreateIndex
CREATE INDEX "maintenances_doc_number_idx" ON "maintenances"("doc_number");

-- CreateIndex
CREATE INDEX "maintenances_customer_id_idx" ON "maintenances"("customer_id");

-- CreateIndex
CREATE INDEX "maintenances_priority_idx" ON "maintenances"("priority");

-- CreateIndex
CREATE INDEX "maintenance_materials_maintenance_id_idx" ON "maintenance_materials"("maintenance_id");

-- CreateIndex
CREATE INDEX "maintenance_replacements_maintenance_id_idx" ON "maintenance_replacements"("maintenance_id");

-- CreateIndex
CREATE UNIQUE INDEX "dismantles_doc_number_key" ON "dismantles"("doc_number");

-- CreateIndex
CREATE INDEX "dismantles_doc_number_idx" ON "dismantles"("doc_number");

-- CreateIndex
CREATE INDEX "dismantles_asset_id_idx" ON "dismantles"("asset_id");

-- CreateIndex
CREATE INDEX "dismantles_customer_id_idx" ON "dismantles"("customer_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_idx" ON "notifications"("recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_timestamp_idx" ON "notifications"("timestamp");

-- CreateIndex
CREATE INDEX "whatsapp_logs_reference_id_reference_type_idx" ON "whatsapp_logs"("reference_id", "reference_type");

-- CreateIndex
CREATE INDEX "whatsapp_logs_status_created_at_idx" ON "whatsapp_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "whatsapp_logs_sent_by_id_idx" ON "whatsapp_logs"("sent_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_category_idx" ON "system_configs"("category");

-- CreateIndex
CREATE INDEX "system_configs_key_idx" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "_DivisionCategories_B_index" ON "_DivisionCategories"("B");

-- CreateIndex
CREATE INDEX "_InstalledAssets_B_index" ON "_InstalledAssets"("B");

-- CreateIndex
CREATE INDEX "_MaintenanceAssets_B_index" ON "_MaintenanceAssets"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_types" ADD CONSTRAINT "asset_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standard_items" ADD CONSTRAINT "standard_items_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "asset_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "asset_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_thresholds" ADD CONSTRAINT "stock_thresholds_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_thresholds" ADD CONSTRAINT "stock_thresholds_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_related_asset_id_fkey" FOREIGN KEY ("related_asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_dismantle_id_fkey" FOREIGN KEY ("dismantle_id") REFERENCES "dismantles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_activities" ADD CONSTRAINT "request_activities_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_requests" ADD CONSTRAINT "loan_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_items" ADD CONSTRAINT "loan_items_loan_request_id_fkey" FOREIGN KEY ("loan_request_id") REFERENCES "loan_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_asset_assignments" ADD CONSTRAINT "loan_asset_assignments_loan_request_id_fkey" FOREIGN KEY ("loan_request_id") REFERENCES "loan_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_asset_assignments" ADD CONSTRAINT "loan_asset_assignments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_returns" ADD CONSTRAINT "asset_returns_loan_request_id_fkey" FOREIGN KEY ("loan_request_id") REFERENCES "loan_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_returns" ADD CONSTRAINT "asset_returns_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_return_items" ADD CONSTRAINT "asset_return_items_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "asset_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_return_items" ADD CONSTRAINT "asset_return_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_menyerahkan_id_fkey" FOREIGN KEY ("menyerahkan_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_penerima_id_fkey" FOREIGN KEY ("penerima_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_mengetahui_id_fkey" FOREIGN KEY ("mengetahui_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handover_items" ADD CONSTRAINT "handover_items_handover_id_fkey" FOREIGN KEY ("handover_id") REFERENCES "handovers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handover_items" ADD CONSTRAINT "handover_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installed_materials" ADD CONSTRAINT "installed_materials_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installations" ADD CONSTRAINT "installations_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installations" ADD CONSTRAINT "installations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_materials" ADD CONSTRAINT "installation_materials_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_materials" ADD CONSTRAINT "maintenance_materials_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_replacements" ADD CONSTRAINT "maintenance_replacements_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dismantles" ADD CONSTRAINT "dismantles_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dismantles" ADD CONSTRAINT "dismantles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DivisionCategories" ADD CONSTRAINT "_DivisionCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "asset_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DivisionCategories" ADD CONSTRAINT "_DivisionCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstalledAssets" ADD CONSTRAINT "_InstalledAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstalledAssets" ADD CONSTRAINT "_InstalledAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaintenanceAssets" ADD CONSTRAINT "_MaintenanceAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaintenanceAssets" ADD CONSTRAINT "_MaintenanceAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN_LOGISTIK', 'ADMIN_PURCHASE', 'LEADER', 'STAFF', 'TEKNISI');

-- CreateEnum
CREATE TYPE "AssetClassification" AS ENUM ('ASSET', 'MATERIAL');

-- CreateEnum
CREATE TYPE "TrackingMethod" AS ENUM ('INDIVIDUAL', 'BULK');

-- CreateEnum
CREATE TYPE "BulkType" AS ENUM ('COUNT', 'MEASUREMENT');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('IN_STORAGE', 'IN_USE', 'ON_LOAN', 'IN_CUSTODY', 'UNDER_REPAIR', 'OUT_FOR_SERVICE', 'DAMAGED', 'AWAITING_RETURN', 'CONSUMED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('BRAND_NEW', 'GOOD', 'USED_OKAY', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'BROKEN', 'FOR_PARTS');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'LOGISTIC_APPROVED', 'LOGISTIC_REJECTED', 'PURCHASE_APPROVED', 'PURCHASE_REJECTED', 'ORDERED', 'ARRIVED', 'AWAITING_HANDOVER', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('REGULAR_STOCK', 'URGENT', 'PROJECT_BASED');

-- CreateEnum
CREATE TYPE "AllocationTarget" AS ENUM ('USAGE', 'INVENTORY');

-- CreateEnum
CREATE TYPE "ItemApprovalStatus" AS ENUM ('APPROVED', 'REJECTED', 'PARTIAL', 'STOCK_ALLOCATED', 'PROCUREMENT_NEEDED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ON_LOAN', 'RETURNED');

-- CreateEnum
CREATE TYPE "AssetReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('INTERNAL', 'CUSTOMER', 'VENDOR');

-- CreateEnum
CREATE TYPE "HandoverStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InstallationStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DismantleStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'SWAP');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CHURNED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('RECEIVED', 'ISSUED', 'CONSUMED', 'ADJUSTED', 'TRANSFERRED', 'RETURNED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'REQUEST_CREATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'LOAN_APPROVED', 'ASSET_ASSIGNED', 'MAINTENANCE_DUE');

-- CreateTable
CREATE TABLE "Division" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "divisionId" INTEGER,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "passwordResetRequested" BOOLEAN NOT NULL DEFAULT false,
    "passwordResetRequestDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isCustomerInstallable" BOOLEAN NOT NULL DEFAULT false,
    "associatedDivisions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetType" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "classification" "AssetClassification" NOT NULL DEFAULT 'ASSET',
    "trackingMethod" "TrackingMethod" NOT NULL DEFAULT 'INDIVIDUAL',
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'Unit',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssetType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetModel" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "bulkType" "BulkType",
    "unitOfMeasure" TEXT,
    "baseUnitOfMeasure" TEXT,
    "quantityPerUnit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssetModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "modelId" INTEGER,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'IN_STORAGE',
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "initialBalance" DOUBLE PRECISION,
    "currentBalance" DOUBLE PRECISION,
    "quantity" INTEGER,
    "location" TEXT,
    "locationDetail" TEXT,
    "currentUserId" INTEGER,
    "customerId" TEXT,
    "purchasePrice" DECIMAL(15,2),
    "purchaseDate" TIMESTAMP(3),
    "vendor" TEXT,
    "poNumber" TEXT,
    "invoiceNumber" TEXT,
    "warrantyEndDate" TIMESTAMP(3),
    "woRoIntNumber" TEXT,
    "isDismantled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "division" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL,
    "orderType" "OrderType" NOT NULL DEFAULT 'REGULAR_STOCK',
    "justification" TEXT,
    "project" TEXT,
    "allocationTarget" "AllocationTarget" NOT NULL DEFAULT 'USAGE',
    "logisticApprover" TEXT,
    "logisticApprovalDate" TIMESTAMP(3),
    "finalApprover" TEXT,
    "finalApprovalDate" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "rejectionDate" TIMESTAMP(3),
    "totalValue" DECIMAL(15,2),
    "purchaseDetails" JSONB,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "partiallyRegisteredItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestItem" (
    "id" SERIAL NOT NULL,
    "requestId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemTypeBrand" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT,
    "status" "ItemApprovalStatus",
    "approvedQuantity" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRequest" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT,
    "expectedReturn" TIMESTAMP(3),
    "actualReturnDate" TIMESTAMP(3),
    "items" JSONB NOT NULL,
    "assignedAssets" JSONB,
    "returnedAssets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approver" TEXT,
    "approvalDate" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "rejectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetReturn" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "loanRequestId" TEXT NOT NULL,
    "status" "AssetReturnStatus" NOT NULL DEFAULT 'PENDING',
    "returnDate" TIMESTAMP(3) NOT NULL,
    "returnedBy" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "notes" TEXT,
    "verifiedBy" TEXT,
    "verificationDate" TIMESTAMP(3),
    "processedBy" TEXT,
    "processedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Handover" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "handoverDate" TIMESTAMP(3) NOT NULL,
    "giverName" TEXT NOT NULL,
    "giverType" "PartyType" NOT NULL DEFAULT 'INTERNAL',
    "receiverName" TEXT NOT NULL,
    "receiverType" "PartyType" NOT NULL DEFAULT 'INTERNAL',
    "status" "HandoverStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Handover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverItem" (
    "id" SERIAL NOT NULL,
    "handoverId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandoverItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "installDate" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "technician" TEXT NOT NULL,
    "status" "InstallationStatus" NOT NULL DEFAULT 'COMPLETED',
    "assetsInstalled" JSONB NOT NULL,
    "materialsUsed" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dismantle" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "dismantleDate" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "technician" TEXT NOT NULL,
    "status" "DismantleStatus" NOT NULL DEFAULT 'PENDING',
    "assetsRetrieved" JSONB NOT NULL,
    "receivedBy" TEXT,
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dismantle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "maintenanceDate" TIMESTAMP(3) NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "problemDescription" TEXT,
    "actionTaken" TEXT,
    "technician" TEXT NOT NULL,
    "replacementAssetId" TEXT,
    "materialsUsed" JSONB,
    "laborCost" DECIMAL(15,2),
    "partsCost" DECIMAL(15,2),
    "completedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "serviceType" TEXT,
    "serviceSpeed" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT,
    "movementType" "MovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "previousBalance" DOUBLE PRECISION,
    "newBalance" DOUBLE PRECISION,
    "performedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_key" ON "Division"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_divisionId_idx" ON "User"("divisionId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "AssetCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetType_categoryId_name_key" ON "AssetType"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetModel_typeId_name_brand_key" ON "AssetModel"("typeId", "name", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_name_brand_idx" ON "Asset"("name", "brand");

-- CreateIndex
CREATE INDEX "Asset_customerId_idx" ON "Asset"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Request_docNumber_key" ON "Request"("docNumber");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_requesterId_idx" ON "Request"("requesterId");

-- CreateIndex
CREATE INDEX "Request_requestDate_idx" ON "Request"("requestDate");

-- CreateIndex
CREATE UNIQUE INDEX "LoanRequest_docNumber_key" ON "LoanRequest"("docNumber");

-- CreateIndex
CREATE INDEX "LoanRequest_status_idx" ON "LoanRequest"("status");

-- CreateIndex
CREATE INDEX "LoanRequest_requesterId_idx" ON "LoanRequest"("requesterId");

-- CreateIndex
CREATE INDEX "LoanRequest_requestDate_idx" ON "LoanRequest"("requestDate");

-- CreateIndex
CREATE UNIQUE INDEX "AssetReturn_docNumber_key" ON "AssetReturn"("docNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Handover_docNumber_key" ON "Handover"("docNumber");

-- CreateIndex
CREATE INDEX "Handover_status_idx" ON "Handover"("status");

-- CreateIndex
CREATE INDEX "Handover_handoverDate_idx" ON "Handover"("handoverDate");

-- CreateIndex
CREATE INDEX "Handover_receiverName_idx" ON "Handover"("receiverName");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_docNumber_key" ON "Installation"("docNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Dismantle_docNumber_key" ON "Dismantle"("docNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_docNumber_key" ON "Maintenance"("docNumber");

-- CreateIndex
CREATE INDEX "StockMovement_assetId_idx" ON "StockMovement"("assetId");

-- CreateIndex
CREATE INDEX "StockMovement_movementType_idx" ON "StockMovement"("movementType");

-- CreateIndex
CREATE INDEX "StockMovement_referenceType_referenceId_idx" ON "StockMovement"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetType" ADD CONSTRAINT "AssetType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetModel" ADD CONSTRAINT "AssetModel_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AssetModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReturn" ADD CONSTRAINT "AssetReturn_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "LoanRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverItem" ADD CONSTRAINT "HandoverItem_handoverId_fkey" FOREIGN KEY ("handoverId") REFERENCES "Handover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverItem" ADD CONSTRAINT "HandoverItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

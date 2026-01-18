import {
  PrismaClient,
  UserRole,
  AssetStatus,
  AssetCondition,
  CustomerStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter and client
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // --- Divisions ---
  const divisions = await Promise.all([
    prisma.division.upsert({
      where: { name: 'Network Engineering' },
      update: {},
      create: { name: 'Network Engineering' },
    }),
    prisma.division.upsert({
      where: { name: 'IT Support' },
      update: {},
      create: { name: 'IT Support' },
    }),
    prisma.division.upsert({
      where: { name: 'NOC' },
      update: {},
      create: { name: 'NOC' },
    }),
    prisma.division.upsert({
      where: { name: 'Field Technician' },
      update: {},
      create: { name: 'Field Technician' },
    }),
  ]);

  console.log(`✅ Created ${divisions.length} divisions`);

  // --- Users ---
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@trinity.id' },
      update: {},
      create: {
        email: 'admin@trinity.id',
        password: hashedPassword,
        name: 'Super Admin',
        role: UserRole.SUPER_ADMIN,
        permissions: ['*'],
      },
    }),
    prisma.user.upsert({
      where: { email: 'logistik@trinity.id' },
      update: {},
      create: {
        email: 'logistik@trinity.id',
        password: hashedPassword,
        name: 'Admin Logistik',
        role: UserRole.ADMIN_LOGISTIK,
        divisionId: divisions[1].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'purchase@trinity.id' },
      update: {},
      create: {
        email: 'purchase@trinity.id',
        password: hashedPassword,
        name: 'Admin Purchase',
        role: UserRole.ADMIN_PURCHASE,
      },
    }),
    prisma.user.upsert({
      where: { email: 'teknisi@trinity.id' },
      update: {},
      create: {
        email: 'teknisi@trinity.id',
        password: hashedPassword,
        name: 'Budi Teknisi',
        role: UserRole.TEKNISI,
        divisionId: divisions[3].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'staff@trinity.id' },
      update: {},
      create: {
        email: 'staff@trinity.id',
        password: hashedPassword,
        name: 'Staff Biasa',
        role: UserRole.STAFF,
        divisionId: divisions[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // --- Asset Categories ---
  const categories = await Promise.all([
    prisma.assetCategory.upsert({
      where: { name: 'Perangkat Jaringan' },
      update: {},
      create: {
        name: 'Perangkat Jaringan',
        isCustomerInstallable: true,
      },
    }),
    prisma.assetCategory.upsert({
      where: { name: 'Peralatan Kantor' },
      update: {},
      create: {
        name: 'Peralatan Kantor',
        isCustomerInstallable: false,
      },
    }),
    prisma.assetCategory.upsert({
      where: { name: 'Material Jaringan' },
      update: {},
      create: {
        name: 'Material Jaringan',
        isCustomerInstallable: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} asset categories`);

  // --- Asset Types ---
  const types = await Promise.all([
    prisma.assetType.upsert({
      where: {
        categoryId_name: { categoryId: categories[0].id, name: 'Router' },
      },
      update: {},
      create: {
        categoryId: categories[0].id,
        name: 'Router',
        classification: 'ASSET',
        trackingMethod: 'INDIVIDUAL',
        unitOfMeasure: 'Unit',
      },
    }),
    prisma.assetType.upsert({
      where: { categoryId_name: { categoryId: categories[0].id, name: 'ONU' } },
      update: {},
      create: {
        categoryId: categories[0].id,
        name: 'ONU',
        classification: 'ASSET',
        trackingMethod: 'INDIVIDUAL',
        unitOfMeasure: 'Unit',
      },
    }),
    prisma.assetType.upsert({
      where: {
        categoryId_name: { categoryId: categories[2].id, name: 'Kabel Fiber' },
      },
      update: {},
      create: {
        categoryId: categories[2].id,
        name: 'Kabel Fiber',
        classification: 'MATERIAL',
        trackingMethod: 'BULK',
        unitOfMeasure: 'Meter',
      },
    }),
  ]);

  console.log(`✅ Created ${types.length} asset types`);

  // --- Asset Models ---
  const models = await Promise.all([
    prisma.assetModel.upsert({
      where: {
        typeId_name_brand: {
          typeId: types[0].id,
          name: 'RB450Gx4',
          brand: 'Mikrotik',
        },
      },
      update: {},
      create: {
        typeId: types[0].id,
        name: 'RB450Gx4',
        brand: 'Mikrotik',
      },
    }),
    prisma.assetModel.upsert({
      where: {
        typeId_name_brand: {
          typeId: types[1].id,
          name: 'HG8245H5',
          brand: 'Huawei',
        },
      },
      update: {},
      create: {
        typeId: types[1].id,
        name: 'HG8245H5',
        brand: 'Huawei',
      },
    }),
    prisma.assetModel.upsert({
      where: {
        typeId_name_brand: {
          typeId: types[2].id,
          name: 'Dropcore 1 Core',
          brand: 'Fiberhome',
        },
      },
      update: {},
      create: {
        typeId: types[2].id,
        name: 'Dropcore 1 Core',
        brand: 'Fiberhome',
        bulkType: 'MEASUREMENT',
        unitOfMeasure: 'Hasbal',
        baseUnitOfMeasure: 'Meter',
        quantityPerUnit: 1000,
      },
    }),
  ]);

  console.log(`✅ Created ${models.length} asset models`);

  // --- Sample Assets ---
  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { id: 'AST-2025-0001' },
      update: {},
      create: {
        id: 'AST-2025-0001',
        name: 'Router RB450Gx4',
        brand: 'Mikrotik',
        modelId: models[0].id,
        serialNumber: 'D4CA6D123456',
        status: AssetStatus.IN_STORAGE,
        condition: AssetCondition.GOOD,
        location: 'Gudang A - Rak 1',
      },
    }),
    prisma.asset.upsert({
      where: { id: 'AST-2025-0002' },
      update: {},
      create: {
        id: 'AST-2025-0002',
        name: 'ONU HG8245H5',
        brand: 'Huawei',
        modelId: models[1].id,
        serialNumber: 'HWTC98765432',
        status: AssetStatus.IN_STORAGE,
        condition: AssetCondition.GOOD,
        location: 'Gudang A - Rak 2',
      },
    }),
    prisma.asset.upsert({
      where: { id: 'AST-2025-0003' },
      update: {},
      create: {
        id: 'AST-2025-0003',
        name: 'Dropcore 1 Core',
        brand: 'Fiberhome',
        modelId: models[2].id,
        status: AssetStatus.IN_STORAGE,
        condition: AssetCondition.GOOD,
        initialBalance: 1000,
        currentBalance: 1000,
        location: 'Gudang B - Rak Material',
      },
    }),
  ]);

  console.log(`✅ Created ${assets.length} sample assets`);

  // --- Sample Customers ---
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: 'CUST-0001' },
      update: {},
      create: {
        id: 'CUST-0001',
        name: 'PT. Maju Bersama',
        address: 'Jl. Sudirman No. 123, Jakarta',
        phone: '021-12345678',
        email: 'info@majubersama.co.id',
        status: CustomerStatus.ACTIVE,
        serviceType: 'Fiber',
        serviceSpeed: '100Mbps',
      },
    }),
    prisma.customer.upsert({
      where: { id: 'CUST-0002' },
      update: {},
      create: {
        id: 'CUST-0002',
        name: 'CV. Teknologi Nusantara',
        address: 'Jl. Gatot Subroto No. 456, Bandung',
        phone: '022-87654321',
        status: CustomerStatus.ACTIVE,
        serviceType: 'Wireless',
        serviceSpeed: '50Mbps',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} sample customers`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

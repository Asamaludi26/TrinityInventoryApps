// 1. Load Environment Variables (WAJIB agar DATABASE_URL terbaca)
import 'dotenv/config';

// 2. Import dari library standar, BUKAN dari generated folder
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// 3. Import Driver Adapter (Sama seperti di prisma.service.ts)
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 4. Inisialisasi Prisma dengan Adapter
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding...');

  // Create divisions
  const divisionLogistik = await prisma.division.upsert({
    where: { name: 'Logistik' },
    update: {},
    create: { name: 'Logistik' },
  });

  const divisionPurchase = await prisma.division.upsert({
    where: { name: 'Purchase' },
    update: {},
    create: { name: 'Purchase' },
  });

  // Create admin user
  // (Menggunakan 10 rounds sudah cukup aman dan lebih cepat daripada 12 untuk dev)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@trinity.com' }, // Pastikan ini sesuai dengan logic login Anda
    update: {
      password: hashedPassword, // Paksa update password
      isActive: true, // Sekalian pastikan aktif
    },
    create: {
      name: 'Super Admin',
      email: 'admin@trinity.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN', // PERHATIKAN: Pastikan value ini ada di ENUM Role Anda di schema.prisma
      divisionId: divisionLogistik.id,
      isActive: true,
      // permissions: ['*'], // Hapus baris ini jika kolom permissions tidak ada di schema User
    },
  });
  console.log('👤 Admin created:', admin.email);

  const logistik = await prisma.user.upsert({
    where: { email: 'logistik@trinity.com' }, // Pastikan ini sesuai dengan logic login Anda
    update: {
      password: hashedPassword, // Paksa update password
      isActive: true, // Sekalian pastikan aktif
    },
    create: {
      name: 'Logistik',
      email: 'logistik@trinity.com',
      password: hashedPassword,
      role: 'ADMIN_LOGISTIK', // PERHATIKAN: Pastikan value ini ada di ENUM Role Anda di schema.prisma
      divisionId: divisionLogistik.id,
      isActive: true,
      // permissions: ['*'], // Hapus baris ini jika kolom permissions tidak ada di schema User
    },
  });
  console.log('👤 Admin created:', logistik.email);

  // Create asset categories
  // const categories = [
  //   { name: 'Network Equipment', isCustomerInstallable: true },
  //   { name: 'Computer Hardware', isCustomerInstallable: false },
  //   { name: 'Office Equipment', isCustomerInstallable: false },
  //   { name: 'Cable & Accessories', isCustomerInstallable: true },
  // ];

  // for (const cat of categories) {
  //   await prisma.assetCategory.upsert({
  //     where: { name: cat.name },
  //     update: {},
  //     create: cat,
  //   });
  // }

  console.log('✅ Seeding completed.');
}

// Jalankan fungsi main dan tangani error
main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Tutup koneksi dengan benar
    await prisma.$disconnect();
  });

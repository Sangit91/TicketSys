import { PrismaClient, UserRole, ShiftStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('123');

  const users = [
    { id: 'USER-ADMIN', username: 'admin', name: 'Quản Trị Viên CNTT (Admin)', roleType: 'ADMIN', email: 'admin.cntt@benhvien.gov.vn', specialty: 'Toàn Quyền Quản Trị Hệ Thống', shiftStatus: 'DANG_TRUC' },
    { id: 'USER-DOCTOR-NAM', username: 'bacsi.nam', name: 'BS. CKII. Nguyễn Văn Nam', roleType: 'DOCTOR', email: 'nam.bs@benhvien.gov.vn', specialty: 'Chẩn Đoán Khẩn Cấp, HIS', shiftStatus: 'DANG_TRUC' },
    { id: 'USER-NURSE-HONG', username: 'dieuduong.hong', name: 'ĐD. Trần Thị Hồng', roleType: 'NURSE', email: 'hong.dd@benhvien.gov.vn', specialty: 'Máy In Tem Bệnh Nhân', shiftStatus: 'DANG_TRUC' },
    { id: 'USER-HW-NHAT', username: 'tech.nhat', name: 'KS. Phạm Minh Nhật', roleType: 'HARDWARE_TECH', email: 'nhat.pm@benhvien.gov.vn', specialty: 'Bảo Trì Tủ Rack, Máy Chủ', shiftStatus: 'DANG_TRUC' },
    { id: 'USER-SW-MAI', username: 'tech.mai', name: 'KTV. Nguyễn Thị Mai', roleType: 'SOFTWARE_TECH', email: 'mai.nt@benhvien.gov.vn', specialty: 'HIS/PACS/LIS, Chữ Ký Số', shiftStatus: 'SAN_SANG' },
  ] as const;

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, email: u.email, specialty: u.specialty, shiftStatus: u.shiftStatus as ShiftStatus },
      create: {
        id: u.id,
        username: u.username,
        passwordHash,
        roleType: u.roleType as UserRole,
        name: u.name,
        email: u.email,
        specialty: u.specialty,
        shiftStatus: u.shiftStatus as ShiftStatus,
        isActive: true,
      },
    });
    console.log(`  user: ${u.username}`);
  }

  const departments = [
    { id: 'DEP-HIS', name: 'Khoa Khám Bệnh & Cấp Cứu', code: 'KB-CC', lead: 'BS. CKII. Nguyễn Văn Nam', networkBandwidth: 10 },
    { id: 'DEP-PACS', name: 'Khoa Chẩn Đoán Hình Ảnh (PACS)', code: 'CDHA-PACS', lead: 'BS. CKI. Trần Thị Thu', networkBandwidth: 40 },
    { id: 'DEP-LIS', name: 'Khoa Xét Nghiệm (LIS)', code: 'XN-LIS', lead: 'CN. Đặng Quốc Huy', networkBandwidth: 10 },
    { id: 'DEP-DUOC', name: 'Khoa Dược & Vật Tư Y Tế', code: 'DUOC-VT', lead: 'DS. CKI. Phạm Hoàng Anh', networkBandwidth: 5 },
    { id: 'DEP-ICU', name: 'Khoa Hồi Sức Tích Cực - Cấp Cứu (ICU)', code: 'ICU-CC', lead: 'BS. CKII. Võ Văn Tuấn', networkBandwidth: 10 },
    { id: 'DEP-NGOAI', name: 'Khoa Ngoại & Phẫu Thuật Cấp Cứu', code: 'NGOAI-PT', lead: 'BS. CKII. Lê Hoàng Đức', networkBandwidth: 10 },
  ] as const;

  for (const d of departments) {
    await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, lead: d.lead, networkBandwidth: d.networkBandwidth },
      create: { id: d.id, name: d.name, code: d.code, lead: d.lead, networkBandwidth: d.networkBandwidth },
    });
  }
  console.log('  departments: 6');

  // Gán khoa phụ trách cho KTV (USER-ADMIN, USER-HW-NHAT, USER-SW-MAI)
  const assign = [
    ['USER-ADMIN', ['DEP-HIS', 'DEP-PACS', 'DEP-LIS', 'DEP-DUOC', 'DEP-ICU', 'DEP-NGOAI']],
    ['USER-HW-NHAT', ['DEP-HIS', 'DEP-PACS', 'DEP-ICU']],
    ['USER-SW-MAI', ['DEP-PACS', 'DEP-LIS', 'DEP-DUOC']],
  ] as const;
  for (const [uid, deptIds] of assign) {
    for (const did of deptIds) {
      await prisma.userDepartment.upsert({
        where: { userId_departmentId: { userId: uid, departmentId: did } },
        update: {},
        create: { userId: uid, departmentId: did },
      });
    }
  }
  console.log('  assignments: done');

  console.log('Seed hoàn tất. Tài khoản mẫu: admin / 123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
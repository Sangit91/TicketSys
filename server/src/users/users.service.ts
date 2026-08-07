import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShiftStatus, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

// Mặt nạ user không để lộ passwordHash
const USER_SELECT = {
  id: true,
  username: true,
  name: true,
  phone: true,
  email: true,
  specialty: true,
  roleType: true,
  shiftStatus: true,
  avatarUrl: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: { roleType?: string; shiftStatus?: string; q?: string }) {
    const { roleType, shiftStatus, q } = query;
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(roleType ? { roleType: roleType as UserRole } : {}),
        ...(shiftStatus ? { shiftStatus: shiftStatus as ShiftStatus } : {}),
        ...(q
          ? { OR: [{ name: { contains: q } }, { username: { contains: q } }, { email: { contains: q } }] }
          : {}),
      },
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async create(dto: {
    username: string;
    password: string;
    name: string;
    email: string;
    roleType: UserRole;
    phone?: string;
    specialty?: string;
    shiftStatus?: ShiftStatus;
  }) {
    const passwordHash = await argon2.hash(dto.password || '123456');
    return this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        name: dto.name,
        email: dto.email,
        roleType: dto.roleType,
        phone: dto.phone,
        specialty: dto.specialty,
        shiftStatus: dto.shiftStatus || 'SAN_SANG',
      },
      select: USER_SELECT,
    });
  }

  async update(
    id: string,
    dto: Partial<{ name: string; phone: string; email: string; specialty: string; shiftStatus: ShiftStatus; signatureImageUrl: string }>
  ) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Tài khoản không tồn tại');
    return this.prisma.user.update({ where: { id }, data: dto, select: USER_SELECT });
  }

  async assignDepartments(id: string, departmentIds: string[]) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Tài khoản không tồn tại');
    await this.prisma.userDepartment.deleteMany({ where: { userId: id } });
    if (departmentIds.length > 0) {
      await this.prisma.userDepartment.createMany({
        data: departmentIds.map((departmentId) => ({ userId: id, departmentId })),
      });
    }
    return this.departments(id);
  }

  async departments(id: string) {
    const departments = await this.prisma.department.findMany({
      where: { deletedAt: null, users: { some: { userId: id } } },
      orderBy: { name: 'asc' },
    });
    return departments;
  }

  async softDelete(id: string, deletedBy: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Tài khoản không tồn tại');
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), deletedBy } });
  }
}
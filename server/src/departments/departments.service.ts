import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async detail(id: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException('Khoa không tồn tại');

    // Summary tính động (không lưu bảng tổng hợp — checklist §2)
    const [assetCount, activeTicketsCount] = await this.prisma.$transaction([
      this.prisma.asset.count({ where: { departmentId: id, deletedAt: null } }),
      this.prisma.ticket.count({
        where: {
          departmentId: id,
          status: { notIn: ['CLOSED', 'CANCELED'] },
        },
      }),
    ]);
    return { ...dept, assetCount, activeTicketsCount };
  }

  async create(dto: {
    name: string;
    code: string;
    lead?: string;
    headcount?: number;
    allocatedBudget?: string;
    networkBandwidth?: number;
  }) {
    const existing = await this.prisma.department.findFirst({ where: { code: dto.code } });
    if (existing) {
      throw new Error('DEP_CODE_EXISTS');
    }
    return this.prisma.department.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        lead: dto.lead,
        headcount: dto.headcount ?? 0,
        allocatedBudget: dto.allocatedBudget,
        networkBandwidth: dto.networkBandwidth ?? 10,
      },
    });
  }

  async update(id: string, dto: Partial<{ name: string; lead: string; headcount: number; networkBandwidth: number }>) {
    const existing = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Khoa không tồn tại');
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async softDelete(id: string, deletedBy: string) {
    const existing = await this.prisma.department.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Khoa không tồn tại');
    return this.prisma.department.update({ where: { id }, data: { deletedAt: new Date(), deletedBy } });
  }
}
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Priority, Prisma, TicketStatus, TicketType } from '@prisma/client';

export type TicketFilters = {
  status?: string;
  priority?: string;
  category?: string;
  departmentId?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};

// Workflow chuẩn hoá (docs §3.5) — transition do backend kiểm soát
const WORKFLOW: Partial<Record<TicketStatus, TicketStatus[]>> = {
  OPEN: ['ASSIGNED', 'CANCELED'],
  ASSIGNED: ['WORKING', 'CANCELED'],
  WORKING: ['WAIT_USER', 'DONE', 'CANCELED'],
  WAIT_USER: ['WORKING', 'DONE'],
  DONE: ['CLOSED', 'CANCELED'],
  CLOSED: [],
  CANCELED: [],
};

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private async audit(actorId: string, action: string, details: string, target: string) {
    await this.prisma.auditLog.create({
      data: { userId: actorId, level: 'INFO', category: 'TICKETS', action, details, targetId: target },
    });
  }

  async list(filters: TicketFilters, user: { sub: string; roleType: string }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(50, Number(filters.pageSize) || 10);
    const where: Prisma.TicketWhereInput = {
      deletedAt: null,
      ...(filters.status ? { status: filters.status as TicketStatus } : {}),
      ...(filters.priority ? { priority: filters.priority as Priority } : {}),
      ...(filters.category ? { category: filters.category as never } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.q
        ? { OR: [{ title: { contains: filters.q } }, { id: { contains: filters.q } }] }
        : {}),
    };

    // Scope: KTV chỉ thấy ticket thuộc khoa phụ trách
    if (user.roleType !== 'ADMIN') {
      const deptIds = (
        await this.prisma.userDepartment.findMany({ where: { userId: user.sub }, select: { departmentId: true } })
      ).map((d) => d.departmentId);
      where.departmentId = { in: deptIds };
    }

    const total = await this.prisma.ticket.count({ where });
    const items = await this.prisma.ticket.findMany({
      where,
      include: {
        department: true,
        assignedEngineer: { select: { id: true, name: true } },
        e2e: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    return { items, page, pageSize, total, pageCount: Math.ceil(total / pageSize) };
  }

  async detail(id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
        assignedEngineer: { select: { id: true, name: true, phone: true } },
        e2e: { include: { signedBy: { select: { id: true, name: true } } } },
        logs: { include: { actor: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
        comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
        slaPolicy: true,
      },
    });
    if (!ticket) throw new NotFoundException('Không tìm thấy yêu cầu');
    return ticket;
  }

  async create(dto: {
    title: string;
    description: string;
    category: string;
    priority: Priority;
    type?: TicketType;
    requestorName?: string;
    departmentId: string;
    assetId?: string;
    slaPolicyId?: string;
    requiresE2E?: boolean;
    createdById: string;
  }) {
    const dept = await this.prisma.department.findFirst({ where: { id: dto.departmentId, deletedAt: null } });
    if (!dept) throw new BadRequestException('Khoa/phòng không hợp lệ');

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category as never,
        priority: dto.priority,
        type: dto.type || 'INCIDENT',
        requestorName: dto.requestorName || 'Cán bộ y tế',
        departmentId: dto.departmentId,
        assetId: dto.assetId,
        slaPolicyId: dto.slaPolicyId,
        requiresE2E: dto.requiresE2E ?? false,
        status: 'OPEN',
        createdById: dto.createdById,
      },
    });

    await this.prisma.ticketLog.create({
      data: { ticketId: ticket.id, action: 'CREATE', note: 'Khởi tạo yêu cầu', actorId: dto.createdById },
    });
    await this.audit(dto.createdById, 'CREATE_TICKET', `Tạo yêu cầu [${ticket.id}]: ${ticket.title}`, ticket.id);
    return ticket;
  }

  async changeStatus(id: string, next: TicketStatus, note: string | undefined, actorId: string, ip?: string) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new NotFoundException('Không tìm thấy yêu cầu');

    const allowed = WORKFLOW[ticket.status] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(`Không thể chuyển ${ticket.status} → ${next}`);
    }
    if (ticket.status === 'DONE' && next === 'CLOSED' && ticket.requiresE2E && !ticket.e2eVerified) {
      throw new BadRequestException('Yêu cầu có ký xác nhận — phải kỹ trước khi đóng');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: next,
        ...(next === 'DONE' ? { resolvedAt: new Date() } : {}),
        ...(next === 'CLOSED' ? { closedAt: new Date() } : {}),
      },
    });
    await this.prisma.ticketLog.create({
      data: { ticketId: id, action: `STATUS:${next}`, note: note || `Đổi trạng thái ${ticket.status} → ${next}`, actorId },
    });
    await this.audit(actorId, 'UPDATE_TICKET_STATUS', `[${id}] ${ticket.status} → ${next}`, id);
    return updated;
  }

  async assign(id: string, engineerId: string, actorId: string) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new NotFoundException('Không tìm thấy yêu cầu');
    const engineer = await this.prisma.user.findFirst({ where: { id: engineerId, deletedAt: null } });
    if (!engineer) throw new NotFoundException('Kỹ thuật viên không tồn tại');

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { assignedEngineerId: engineerId, status: ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status },
      include: { assignedEngineer: { select: { id: true, name: true } } },
    });
    await this.prisma.ticketLog.create({
      data: { ticketId: id, action: 'ASSIGN', note: `Phân công cho ${engineer.name}`, actorId },
    });
    return updated;
  }

  async comment(id: string, content: string, authorId: string) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new NotFoundException('Không tìm thấy yêu cầu');
    return this.prisma.ticketComment.create({
      data: { ticketId: id, authorId, content },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  /** Ký xác nhận NỘI BỘ — gắn ảnh chữ ký map sẵn của nhân viên (thay cho token crypto; để sau) */
  async sign(id: string, signerId: string, _ip?: string) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, deletedAt: null } });
    if (!ticket) throw new NotFoundException('Không tìm thấy yêu cầu');
    const signer = await this.prisma.user.findUnique({ where: { id: signerId } });
    if (!signer) throw new NotFoundException('Người ký không tồn tại');

    const signatureImageUrl = signer.signatureImageUrl;
    if (!signatureImageUrl) {
      throw new BadRequestException('Nhân viên chưa khai báo ảnh chữ ký (signatureImageUrl)');
    }

    await this.prisma.ticketE2E.upsert({
      where: { ticketId: id },
      update: {
        verificationMethod: 'SIGNATURE_IMAGE',
        signatureImageUrl,
        signedById: signer.id,
        userSignature: signer.name,
        verifiedAt: new Date(),
      },
      create: {
        ticketId: id,
        verificationMethod: 'SIGNATURE_IMAGE',
        signatureImageUrl,
        signedById: signer.id,
        userSignature: signer.name,
        verifiedAt: new Date(),
      },
    });
    await this.prisma.ticket.update({ where: { id }, data: { e2eVerified: true } });
    await this.prisma.ticketLog.create({
      data: { ticketId: id, action: 'SIGN', note: `Ký xác nhận nội bộ: ${signer.name}`, actorId: signer.id },
    });
    await this.audit(signer.id, 'SIGN_TICKET', `[${id}] ký xác nhận nội bộ bởi ${signer.name} (ảnh chữ ký)`, id);

    return this.detail(id);
  }
}
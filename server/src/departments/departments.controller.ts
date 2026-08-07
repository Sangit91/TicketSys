import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthJwtUser, CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  @Get()
  list() {
    return this.departments.list().then((data) => ({ data }));
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.departments.detail(id).then((data) => ({ data }));
  }

  @Post()
  @Roles('ADMIN')
  async create(
    @Body()
    body: {
      name?: string;
      code?: string;
      lead?: string;
      headcount?: number;
      allocatedBudget?: string;
      networkBandwidth?: number;
    }
  ) {
    if (!body.name || !body.code) {
      throw new BadRequestException('Thiếu name/code');
    }
    try {
      const data = await this.departments.create({
        name: body.name,
        code: body.code,
        lead: body.lead,
        headcount: body.headcount,
        allocatedBudget: body.allocatedBudget,
        networkBandwidth: body.networkBandwidth,
      });
      return { data };
    } catch (e) {
      if ((e as { message?: string }).message === 'DEP_CODE_EXISTS') {
        throw new BadRequestException('Mã khoa đã tồn tại');
      }
      throw e;
    }
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const patch: { name?: string; lead?: string; headcount?: number; networkBandwidth?: number } = {};
    if (typeof body.name === 'string') patch.name = body.name;
    if (typeof body.lead === 'string') patch.lead = body.lead;
    if (typeof body.headcount === 'number') patch.headcount = body.headcount;
    if (typeof body.networkBandwidth === 'number') patch.networkBandwidth = body.networkBandwidth;
    return this.departments.update(id, patch).then((r) => ({ data: r }));
  }

  @Delete(':id')
  @Roles('ADMIN')
  softDelete(@Param('id') id: string, @CurrentUser() actor: AuthJwtUser) {
    return this.departments
      .softDelete(id, actor.sub)
      .then((r) => ({ data: { id: r.id, deletedAt: r.deletedAt } }));
  }
}
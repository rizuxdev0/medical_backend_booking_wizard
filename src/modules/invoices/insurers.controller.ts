import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insurer } from './entities/insurer.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('insurers')
export class InsurersController {
  constructor(
    @InjectRepository(Insurer)
    private repo: Repository<Insurer>,
  ) {}

  @Get()
  @Roles('admin', 'accountant', 'secretary')
  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  @Post()
  @Roles('admin', 'accountant')
  create(@Body() dto: any) {
    const insurer = this.repo.create(dto);
    return this.repo.save(insurer);
  }

  @Patch(':id')
  @Roles('admin', 'accountant')
  async update(@Param('id') id: string, @Body() dto: any) {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  @Delete(':id')
  @Roles('admin', 'accountant')
  remove(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}

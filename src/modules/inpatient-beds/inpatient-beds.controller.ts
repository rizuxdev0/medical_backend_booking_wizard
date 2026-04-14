import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InpatientBedsService } from './inpatient-beds.service';
import { CreateInpatientBedDto } from './dto/create-inpatient-bed.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('inpatient-beds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inpatient-beds')
export class InpatientBedsController {
  constructor(private readonly service: InpatientBedsService) {}

  @Post()
  @Roles('admin', 'nurse')
  @ApiOperation({ summary: 'Créer un lit' })
  create(@Body() createDto: CreateInpatientBedDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'nurse', 'secretary')
  @ApiOperation({ summary: 'Liste des lits' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse', 'secretary')
  @ApiOperation({ summary: 'Détail d\'un lit' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'nurse', 'doctor')
  @ApiOperation({ summary: 'Mettre à jour un lit (occupation, statut)' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateInpatientBedDto>) {
    return this.service.update(id, updateDto);
  }

  @Post(':id/transfer/:targetId')
  @Roles('admin', 'nurse', 'doctor')
  @ApiOperation({ summary: 'Transférer un patient vers un autre lit' })
  transfer(@Param('id') id: string, @Param('targetId') targetId: string) {
    return this.service.transfer(id, targetId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un lit' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

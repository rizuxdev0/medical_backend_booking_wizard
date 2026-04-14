import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LabRequestsService } from './lab-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('lab-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lab-requests')
export class LabRequestsController {
  constructor(private readonly service: LabRequestsService) {}

  @Post()
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Créer une demande de labo' })
  create(@Body() createDto: any) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'nurse', 'secretary')
  @ApiOperation({ summary: 'Liste des demandes de labo' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Détail d\'une demande' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Mettre à jour une demande (résultats)' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer une demande' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

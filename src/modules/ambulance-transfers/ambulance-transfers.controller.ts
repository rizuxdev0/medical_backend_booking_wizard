import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AmbulanceTransfersService } from './ambulance-transfers.service';
import { CreateAmbulanceTransferDto } from './dto/create-ambulance-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('ambulance-transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ambulance-transfers')
export class AmbulanceTransfersController {
  constructor(private readonly service: AmbulanceTransfersService) {}

  @Post()
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Planifier un transfert' })
  create(@Body() createDto: CreateAmbulanceTransferDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Liste des transferts' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Mettre à jour un transfert' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateAmbulanceTransferDto>) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un transfert' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

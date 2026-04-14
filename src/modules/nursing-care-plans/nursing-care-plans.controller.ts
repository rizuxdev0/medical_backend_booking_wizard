import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NursingCarePlansService } from './nursing-care-plans.service';
import { CreateNursingCarePlanDto } from './dto/create-nursing-care-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('nursing-care-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nursing-care-plans')
export class NursingCarePlansController {
  constructor(private readonly service: NursingCarePlansService) {}

  @Post()
  @Roles('admin', 'nurse', 'doctor')
  @ApiOperation({ summary: 'Créer un plan de soin' })
  create(@Body() createDto: CreateNursingCarePlanDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Liste des soins infirmiers' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @Roles('admin', 'nurse')
  @ApiOperation({ summary: 'Valider ou modifier un soin' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateNursingCarePlanDto>) {
    return this.service.update(id, updateDto);
  }
}

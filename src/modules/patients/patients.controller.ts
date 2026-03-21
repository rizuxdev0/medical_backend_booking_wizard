import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Liste tous les patients' })
  findAll(
    @Query() query: PatientQueryDto,
  ): Promise<PatientResponseDto[] | Partial<PatientResponseDto>[]> {
    if (query.fields === 'id,first_name,last_name') {
      return this.patientsService.findAllForSelect();
    }
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: "Détail d'un patient" })
  findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Créer un nouveau patient' })
  create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user,
  ): Promise<PatientResponseDto> {
    return this.patientsService.create(createPatientDto, user.id);
  }

  @Put(':id')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Mettre à jour un patient (PUT)' })
  replace(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Modifier un patient (PATCH)' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un patient' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.patientsService.remove(id);
  }

  @Get(':id/appointments')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Rendez-vous du patient' })
  getAppointments(@Param('id') id: string): Promise<any[]> {
    return this.patientsService.getAppointments(id);
  }

  @Get(':id/invoices')
  @Roles('admin', 'doctor', 'secretary', 'accountant')
  @ApiOperation({ summary: 'Factures du patient' })
  getInvoices(@Param('id') id: string): Promise<any[]> {
    return this.patientsService.getInvoices(id);
  }
}

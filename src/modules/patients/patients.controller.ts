import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  Req,
} from '@nestjs/common';
import * as express from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SignConsentDto } from './dto/sign-consent.dto';
import { PatientConsent } from './entities/patient-consent.entity';

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Permissions('patients.view')
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
  @Permissions('patients.view')
  @ApiOperation({ summary: "Détail d'un patient" })
  findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientsService.findOne(id);
  }

  @Post()
  @Permissions('patients.create')
  @ApiOperation({ summary: 'Créer un nouveau patient' })
  create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user,
  ): Promise<PatientResponseDto> {
    return this.patientsService.create(createPatientDto, user.id);
  }

  @Put(':id')
  @Permissions('patients.edit')
  @ApiOperation({ summary: 'Mettre à jour un patient (PUT)' })
  replace(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Patch(':id')
  @Permissions('patients.edit')
  @ApiOperation({ summary: 'Modifier un patient (PATCH)' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Get('user/:userId')
  @Permissions('patients.view')
  @ApiOperation({ summary: 'Trouver un patient par son ID utilisateur' })
  findByUserId(@Param('userId') userId: string): Promise<PatientResponseDto | null> {
    return this.patientsService.findByUserId(userId);
  }

  @Delete(':id')
  @Permissions('patients.delete')
  @ApiOperation({ summary: 'Supprimer un patient' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.patientsService.remove(id);
  }

  @Get(':id/appointments')
  @Permissions('appointments.view')
  @ApiOperation({ summary: 'Rendez-vous du patient' })
  getAppointments(@Param('id') id: string): Promise<any[]> {
    return this.patientsService.getAppointments(id);
  }

  @Get(':id/invoices')
  @Permissions('billing.view')
  @ApiOperation({ summary: 'Factures du patient' })
  getInvoices(@Param('id') id: string): Promise<any[]> {
    return this.patientsService.getInvoices(id);
  }

  @Get(':id/consents')
  @Permissions('patients.view')
  @ApiOperation({ summary: 'Consentements signés du patient' })
  getConsents(@Param('id') id: string): Promise<PatientConsent[]> {
    return this.patientsService.getConsents(id);
  }

  @Post(':id/consents')
  @Permissions('patients.edit')
  @ApiOperation({ summary: 'Signer un nouveau consentement' })
  signConsent(
    @Param('id') id: string,
    @Body() dto: SignConsentDto,
    @Req() req: express.Request,
    @CurrentUser() user,
  ): Promise<PatientConsent> {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const practitionerId = user.role === 'doctor' ? user.practitioner_id : null;
    
    return this.patientsService.signConsent(id, dto, practitionerId, ipAddress, userAgent);
  }
}

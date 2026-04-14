import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConsultationNotesService } from './consultation-notes.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ConsultationNoteResponseDto,
  CreateConsultationNoteDto,
  UpdateConsultationNoteDto,
} from './dto/create-consultation-note.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('consultations')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationNotesController {
  constructor(
    private readonly consultationNotesService: ConsultationNotesService,
  ) {}

  @Get('consultations')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Liste toutes les consultations' })
  findAll() {
    return this.consultationNotesService.findAll();
  }

  @Get('appointments/:appointmentId/consultation')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: "Récupérer la note de consultation d'un rendez-vous",
  })
  findByAppointment(
    @Param('appointmentId') appointmentId: string,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.findByAppointment(appointmentId);
  }

  @Get('consultations/patient/:patientId/today')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: "Récupérer la note de consultation d'un patient pour aujourd'hui",
  })
  findByPatientToday(
    @Param('patientId') patientId: string,
  ): Promise<ConsultationNoteResponseDto | null> {
    return this.consultationNotesService.findByPatientToday(patientId);
  }

  @Get('consultations/:id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Récupérer une note de consultation par son ID' })
  findOne(@Param('id') id: string): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.findOne(id);
  }

  @Post('consultations')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Créer une note de consultation' })
  create(
    @Body() createNoteDto: CreateConsultationNoteDto,
    @CurrentUser() user,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.create(createNoteDto, user.id);
  }

  @Patch('consultations/:id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Modifier une note de consultation' })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateConsultationNoteDto,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.update(id, updateNoteDto);
  }

  @Post('consultations/:id/close')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Fermer une note de consultation' })
  close(
    @Param('id') id: string,
    @CurrentUser() user,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.close(id, user.id);
  }

  @Post('consultations/:id/send-summary')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Envoyer le résumé de consultation par email' })
  sendSummary(
    @Param('id') id: string,
    @Body('customMessage') customMessage?: string,
  ): Promise<void> {
    return this.consultationNotesService.sendSummaryEmail(id, customMessage);
  }

  @Post('consultations/:id/sign')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Signer électroniquement une note de consultation' })
  sign(@Param('id') id: string): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.sign(id);
  }
}

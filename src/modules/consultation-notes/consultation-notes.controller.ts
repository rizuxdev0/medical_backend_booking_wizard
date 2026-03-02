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

@ApiTags('consultation-notes')
@ApiBearerAuth()
@Controller('consultation-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationNotesController {
  constructor(
    private readonly consultationNotesService: ConsultationNotesService,
  ) {}

  @Get('by-appointment/:appointmentId')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: "Récupérer la note de consultation d'un rendez-vous",
  })
  findByAppointment(
    @Param('appointmentId') appointmentId: string,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.findByAppointment(appointmentId);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Récupérer une note de consultation par son ID' })
  findOne(@Param('id') id: string): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.findOne(id);
  }

  @Post()
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Créer une note de consultation' })
  create(
    @Body() createNoteDto: CreateConsultationNoteDto,
    @CurrentUser() user,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.create(createNoteDto, user.id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Modifier une note de consultation' })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateConsultationNoteDto,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.update(id, updateNoteDto);
  }

  @Post(':id/close')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Fermer une note de consultation' })
  close(
    @Param('id') id: string,
    @CurrentUser() user,
  ): Promise<ConsultationNoteResponseDto> {
    return this.consultationNotesService.close(id, user.id);
  }
}

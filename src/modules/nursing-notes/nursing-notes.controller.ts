import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NursingNotesService } from './nursing-notes.service';

@Controller('nursing-notes')
export class NursingNotesController {
  constructor(private readonly service: NursingNotesService) {}

  @Get()
  findAll(@Query('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }
}

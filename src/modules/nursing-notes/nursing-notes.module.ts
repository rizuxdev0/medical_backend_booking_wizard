import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NursingNote } from './entities/nursing-note.entity';
import { NursingNotesService } from './nursing-notes.service';
import { NursingNotesController } from './nursing-notes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NursingNote])],
  controllers: [NursingNotesController],
  providers: [NursingNotesService],
  exports: [NursingNotesService],
})
export class NursingNotesModule {}

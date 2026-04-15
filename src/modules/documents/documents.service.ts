import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
  ) {}

  async findByPatient(patientId: string) {
    return this.documentRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(createDocumentDto: CreateDocumentDto) {
    const document = this.documentRepo.create({
      patientId: createDocumentDto.patient_id,
      practitionerId: createDocumentDto.practitioner_id,
      name: createDocumentDto.name,
      fileUrl: createDocumentDto.file_url,
      fileType: createDocumentDto.file_type,
      fileSize: createDocumentDto.file_size,
      notes: createDocumentDto.notes,
      type: createDocumentDto.type,
    });
    return this.documentRepo.save(document);
  }

  async remove(id: string) {
    const document = await this.documentRepo.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Supprimer le fichier physique s'il existe
    if (document.fileUrl) {
      const filePath = join(__dirname, '..', '..', '..', document.fileUrl);
      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
      }
    }

    await this.documentRepo.remove(document);
    return { message: 'Document deleted successfully' };
  }
}

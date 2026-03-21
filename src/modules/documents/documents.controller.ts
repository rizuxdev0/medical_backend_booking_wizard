import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('patients/:patientId/documents')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Liste des documents d'un patient" })
  findByPatient(@Param('patientId') patientId: string) {
    return this.documentsService.findByPatient(patientId);
  }

  @Post('documents')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Enregistrer un nouveau document' })
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Delete('documents/:id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Supprimer un document' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Post('documents/upload')
  @Roles('admin', 'doctor', 'secretary')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Uploader un fichier (Simulation)' })
  uploadFile(@UploadedFile() file: any) {
    // Dans une vraie implémentation, on uploaderait vers S3/Cloudinary ici
    return {
      message: 'Fichier uploadé avec succès',
      file_url: `https://storage.example.com/${file.originalname}`,
      file_size: file.size,
      file_type: file.mimetype,
    };
  }
}

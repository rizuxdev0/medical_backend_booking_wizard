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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('patients/:patientId/documents')
  @Permissions('patients.documents')
  @ApiOperation({ summary: "Liste des documents d'un patient" })
  findByPatient(@Param('patientId') patientId: string) {
    return this.documentsService.findByPatient(patientId);
  }

  @Post('documents')
  @Permissions('patients.documents')
  @ApiOperation({ summary: 'Enregistrer un nouveau document' })
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Delete('documents/:id')
  @Permissions('patients.documents')
  @ApiOperation({ summary: 'Supprimer un document' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Post('documents/upload')
  @Permissions('patients.documents')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/patient-documents',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
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
  @ApiOperation({ summary: 'Uploader un fichier (Local Storage)' })
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      return { message: 'Aucun fichier reçu' };
    }
    
    // On retourne l'URL relative. Le frontend ajoutera le domaine.
    return {
      message: 'Fichier uploadé avec succès',
      file_url: `/uploads/patient-documents/${file.filename}`,
      file_name: file.originalname,
      file_size: file.size,
      file_type: file.mimetype,
    };
  }
}

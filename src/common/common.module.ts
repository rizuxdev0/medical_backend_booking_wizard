import { Module, Global } from '@nestjs/common';
import { PdfGeneratorService } from './services/pdf-generator.service';

@Global()
@Module({
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class CommonModule {}

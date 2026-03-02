import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import {
  CreateCurrencyDto,
  UpdateCurrencyDto,
  CurrencyResponseDto,
} from './dto/create-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepo: Repository<Currency>,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<CurrencyResponseDto[]> {
    const whereCondition = activeOnly ? { isActive: true } : {};

    const currencies = await this.currencyRepo.find({
      where: whereCondition,
      order: { isDefault: 'DESC', code: 'ASC' },
    });

    return currencies.map((c) => this.mapToResponse(c));
  }

  async findOne(id: string): Promise<CurrencyResponseDto> {
    const currency = await this.currencyRepo.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Devise avec l'ID ${id} non trouvée`);
    }

    return this.mapToResponse(currency);
  }

  async findByCode(code: string): Promise<CurrencyResponseDto> {
    const currency = await this.currencyRepo.findOne({
      where: { code },
    });

    if (!currency) {
      throw new NotFoundException(`Devise avec le code ${code} non trouvée`);
    }

    return this.mapToResponse(currency);
  }

  async getDefault(): Promise<CurrencyResponseDto> {
    const currency = await this.currencyRepo.findOne({
      where: { isDefault: true },
    });

    if (!currency) {
      // Si aucune devise par défaut, prendre la première active
      const firstActive = await this.currencyRepo.findOne({
        where: { isActive: true },
        order: { code: 'ASC' },
      });

      if (!firstActive) {
        throw new NotFoundException('Aucune devise trouvée');
      }

      return this.mapToResponse(firstActive);
    }

    return this.mapToResponse(currency);
  }

  async create(
    createCurrencyDto: CreateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    // Vérifier si le code existe déjà
    const existing = await this.currencyRepo.findOne({
      where: { code: createCurrencyDto.code },
    });

    if (existing) {
      throw new BadRequestException(
        `Une devise avec le code ${createCurrencyDto.code} existe déjà`,
      );
    }

    // Si c'est la devise par défaut, retirer le statut par défaut des autres
    if (createCurrencyDto.is_default) {
      await this.currencyRepo.update({ isDefault: true }, { isDefault: false });
    }

    const currencyData: Partial<Currency> = {
      code: createCurrencyDto.code,
      name: createCurrencyDto.name,
      symbol: createCurrencyDto.symbol,
    };

    if (createCurrencyDto.decimal_places !== undefined) {
      currencyData.decimalPlaces = createCurrencyDto.decimal_places;
    }

    if (createCurrencyDto.decimal_separator) {
      currencyData.decimalSeparator = createCurrencyDto.decimal_separator;
    }

    if (createCurrencyDto.thousands_separator) {
      currencyData.thousandsSeparator = createCurrencyDto.thousands_separator;
    }

    if (createCurrencyDto.symbol_position) {
      currencyData.symbolPosition = createCurrencyDto.symbol_position;
    }

    if (createCurrencyDto.is_active !== undefined) {
      currencyData.isActive = createCurrencyDto.is_active;
    }

    if (createCurrencyDto.is_default !== undefined) {
      currencyData.isDefault = createCurrencyDto.is_default;
    }

    if (createCurrencyDto.exchange_rate !== undefined) {
      currencyData.exchangeRate = createCurrencyDto.exchange_rate;
    }

    const currency = this.currencyRepo.create(currencyData);
    await this.currencyRepo.save(currency);

    return this.mapToResponse(currency);
  }

  async update(
    id: string,
    updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    const currency = await this.currencyRepo.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Devise avec l'ID ${id} non trouvée`);
    }

    // Vérifier si le code est modifié et déjà existant
    if (updateCurrencyDto.code && updateCurrencyDto.code !== currency.code) {
      const existing = await this.currencyRepo.findOne({
        where: { code: updateCurrencyDto.code },
      });
      if (existing) {
        throw new BadRequestException(
          `Une devise avec le code ${updateCurrencyDto.code} existe déjà`,
        );
      }
    }

    // Si c'est la devise par défaut, retirer le statut par défaut des autres
    if (updateCurrencyDto.is_default && !currency.isDefault) {
      await this.currencyRepo.update({ isDefault: true }, { isDefault: false });
    }

    const updateData: Partial<Currency> = {};

    if (updateCurrencyDto.code !== undefined) {
      updateData.code = updateCurrencyDto.code;
    }

    if (updateCurrencyDto.name !== undefined) {
      updateData.name = updateCurrencyDto.name;
    }

    if (updateCurrencyDto.symbol !== undefined) {
      updateData.symbol = updateCurrencyDto.symbol;
    }

    if (updateCurrencyDto.decimal_places !== undefined) {
      updateData.decimalPlaces = updateCurrencyDto.decimal_places;
    }

    if (updateCurrencyDto.decimal_separator !== undefined) {
      updateData.decimalSeparator = updateCurrencyDto.decimal_separator;
    }

    if (updateCurrencyDto.thousands_separator !== undefined) {
      updateData.thousandsSeparator = updateCurrencyDto.thousands_separator;
    }

    if (updateCurrencyDto.symbol_position !== undefined) {
      updateData.symbolPosition = updateCurrencyDto.symbol_position;
    }

    if (updateCurrencyDto.is_active !== undefined) {
      updateData.isActive = updateCurrencyDto.is_active;
    }

    if (updateCurrencyDto.is_default !== undefined) {
      updateData.isDefault = updateCurrencyDto.is_default;
    }

    if (updateCurrencyDto.exchange_rate !== undefined) {
      updateData.exchangeRate = updateCurrencyDto.exchange_rate;
    }

    if (Object.keys(updateData).length > 0) {
      await this.currencyRepo.update(id, updateData);
    }

    const updated = await this.currencyRepo.findOne({
      where: { id },
    });

    if (!updated) {
      throw new NotFoundException(
        `Devise avec l'ID ${id} non trouvée après mise à jour`,
      );
    }

    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<{ message: string }> {
    const currency = await this.currencyRepo.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Devise avec l'ID ${id} non trouvée`);
    }

    if (currency.isDefault) {
      throw new BadRequestException(
        'Impossible de supprimer la devise par défaut',
      );
    }

    await this.currencyRepo.remove(currency);
    return { message: `Devise ${currency.code} supprimée avec succès` };
  }

  private mapToResponse(currency: Currency): CurrencyResponseDto {
    return {
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimal_places: currency.decimalPlaces,
      decimal_separator: currency.decimalSeparator,
      thousands_separator: currency.thousandsSeparator,
      symbol_position: currency.symbolPosition,
      is_active: currency.isActive,
      is_default: currency.isDefault,
      exchange_rate: currency.exchangeRate,
      created_at: currency.createdAt,
      updated_at: currency.updatedAt,
    };
  }
}

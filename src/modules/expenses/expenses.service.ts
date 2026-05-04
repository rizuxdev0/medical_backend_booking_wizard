import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async findAll() {
    return this.expenseRepository.find({ order: { date: 'DESC', createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) throw new NotFoundException(`Dépense avec l'ID ${id} introuvable`);
    return expense;
  }

  async create(createDto: Partial<Expense>) {
    const expense = this.expenseRepository.create(createDto);
    return this.expenseRepository.save(expense);
  }

  async update(id: string, updateDto: Partial<Expense>) {
    await this.findOne(id);
    await this.expenseRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const expense = await this.findOne(id);
    return this.expenseRepository.remove(expense);
  }

  async getSummary() {
    const expenses = await this.expenseRepository.find();
    
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byCategory,
      count: expenses.length
    };
  }
}

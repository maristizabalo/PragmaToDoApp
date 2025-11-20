import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly STORAGE_KEY = 'pragma_todo_categories';

  getCategories(): Category[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as Category[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveCategories(categories: Category[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
  }

  createCategory(name: string, color?: string): Category {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      color,
    };
  }
}
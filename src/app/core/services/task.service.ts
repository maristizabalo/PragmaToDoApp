import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY = 'pragma_todo_tasks';

  getTasks(): Task[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as Task[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  }

  createTask(title: string, categoryId?: string | null): Task {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      completed: false,
      categoryId: categoryId ?? null,
    };
  }
}
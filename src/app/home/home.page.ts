import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

import { Task } from '../core/models/task.model';
import { TaskService } from '../core/services/task.service';
import { Category } from '../core/models/category.model';
import { CategoryService } from '../core/services/category.service';

import { TasksListComponent } from './components/tasks-list/tasks-list.component';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';

type TaskSegment = 'all' | 'pending' | 'done';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TasksListComponent,
    TaskFiltersComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  tasks: Task[] = [];
  categories: Category[] = [];

  currentSegment: TaskSegment = 'all';
  selectedCategoryId: string | null = null;

  constructor(
    private readonly taskService: TaskService,
    private readonly categoryService: CategoryService,
    private readonly alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();
  }

  // TASK METHODS

  private loadTasks(): void {
    this.tasks = this.taskService.getTasks();
  }

  private persistTasks(): void {
    this.taskService.saveTasks(this.tasks);
  }

  get filteredTasks(): Task[] {
    let tasks = [...this.tasks];

    if (this.selectedCategoryId) {
      tasks = tasks.filter((t) => t.categoryId === this.selectedCategoryId);
    }

    switch (this.currentSegment) {
      case 'pending':
        return tasks.filter((t) => !t.completed);
      case 'done':
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }

  onSegmentChange(segment: TaskSegment) {
    this.currentSegment = segment;
  }

  async openCreateTaskModal() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva tarea',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: '¿Qué necesitas hacer?',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const title = (data?.title || '').trim();
            if (!title) return false;

            const newTask = this.taskService.createTask(title, null);
            this.tasks = [newTask, ...this.tasks];
            this.persistTasks();
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  toggleTask(task: Task) {
    this.tasks = this.tasks.map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    this.persistTasks();
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
    this.persistTasks();
  }

  // CATEGORY METHODS

  private loadCategories(): void {
    const stored = this.categoryService.getCategories();

    if (!stored.length) {
      const defaults = [
        this.categoryService.createCategory('Personal', '#14b8a6'),
        this.categoryService.createCategory('Trabajo', '#7c3aed'),
        this.categoryService.createCategory('Estudios', '#f97316'),
      ];

      this.categories = defaults;
      this.categoryService.saveCategories(this.categories);
      return;
    }

    this.categories = stored;
  }

  private persistCategories(): void {
    this.categoryService.saveCategories(this.categories);
  }

  selectCategory(categoryId: string | null) {
    this.selectedCategoryId = categoryId;
  }

  async openCreateCategoryAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Ej: Trabajo, Personal...',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const name = (data?.name || '').trim();
            if (!name) return false;

            const colors = ['#7c3aed', '#14b8a6', '#f97316', '#22c55e', '#eab308'];
            const randomColor =
              colors[Math.floor(Math.random() * colors.length)];

            const newCategory = this.categoryService.createCategory(
              name,
              randomColor
            );
            this.categories = [...this.categories, newCategory];
            this.persistCategories();
            return true;
          },
        },
      ],
    });

    await alert.present();
  }
}
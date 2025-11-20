import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';

import { TaskFormComponent } from './components/task-form/task-form.component';

import { Task } from '../core/models/task.model';
import { TaskService } from '../core/services/task.service';
import { Category } from '../core/models/category.model';
import { CategoryService } from '../core/services/category.service';

import { TasksListComponent } from './components/tasks-list/tasks-list.component';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';

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
    TaskFormComponent,
    CategoryManagerComponent,
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
    private readonly alertCtrl: AlertController,
    private readonly modalCtrl: ModalController
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
    let filteredTasks = [...this.tasks];

    if (this.selectedCategoryId) {
      filteredTasks = filteredTasks.filter(
        (task) => task.categoryId === this.selectedCategoryId
      );
    }

    switch (this.currentSegment) {
      case 'pending':
        return filteredTasks.filter((task) => !task.completed);
      case 'done':
        return filteredTasks.filter((task) => task.completed);
      default:
        return filteredTasks;
    }
  }

  onSegmentChange(segment: TaskSegment) {
    this.currentSegment = segment;
  }

  async openCreateTaskModal() {
    const modal = await this.modalCtrl.create({
      component: TaskFormComponent,
      componentProps: {
        header: 'Nueva tarea',
        categories: this.categories,
        initialTitle: '',
        initialCategoryId: this.selectedCategoryId,
      },
      breakpoints: [0, 0.4, 0.8],
      initialBreakpoint: 0.5,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'save' && data) {
      const { title, categoryId } = data as {
        title: string;
        categoryId: string | null;
      };

      const newTask = this.taskService.createTask(title, categoryId);
      this.tasks = [newTask, ...this.tasks];
      this.persistTasks();
    }
  }

  async openCategoryManagerModal() {
    const modal = await this.modalCtrl.create({
      component: CategoryManagerComponent,
      componentProps: {
        categories: this.categories,
      },
      breakpoints: [0, 0.6, 0.9],
      initialBreakpoint: 0.7,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'save' && data) {
      const {
        categories: updatedCategories,
        deletedCategoryIds,
      }: { categories: Category[]; deletedCategoryIds: string[] } = data;

      // Actualizamos categorías
      this.categories = updatedCategories;
      this.persistCategories();

      // Para cada tarea que tenga una categoría eliminada, le quitamos la categoría
      if (Array.isArray(deletedCategoryIds) && deletedCategoryIds.length) {
        const deletedCategoryIdsSet = new Set(deletedCategoryIds);

        this.tasks = this.tasks.map((task) =>
          task.categoryId && deletedCategoryIdsSet.has(task.categoryId)
            ? { ...task, categoryId: null }
            : task
        );
        this.persistTasks();

        // Si el filtro estaba seleccionado en una categoría eliminada, limpiamos el filtro
        if (
          this.selectedCategoryId &&
          deletedCategoryIdsSet.has(this.selectedCategoryId)
        ) {
          this.selectedCategoryId = null;
        }
      }
    }
  }

  toggleTask(task: Task) {
    this.tasks = this.tasks.map((existingTask) =>
      existingTask.id === task.id
        ? { ...existingTask, completed: !existingTask.completed }
        : existingTask
    );
    this.persistTasks();
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter(
      (existingTask) => existingTask.id !== task.id
    );
    this.persistTasks();
  }

  // CATEGORY METHODS

  private loadCategories(): void {
    const storedCategories = this.categoryService.getCategories();

    if (!storedCategories.length) {
      const defaultCategories = [
        this.categoryService.createCategory('Personal', '#14b8a6'),
        this.categoryService.createCategory('Trabajo', '#7c3aed'),
        this.categoryService.createCategory('Estudios', '#f97316'),
      ];

      this.categories = defaultCategories;
      this.categoryService.saveCategories(this.categories);
      return;
    }

    this.categories = storedCategories;
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
            const categoryName = (data?.name || '').trim();
            if (!categoryName) return false;

            const availableColors = [
              '#7c3aed',
              '#14b8a6',
              '#f97316',
              '#22c55e',
              '#eab308',
            ];
            const randomColorIndex = Math.floor(
              Math.random() * availableColors.length
            );
            const randomColor = availableColors[randomColorIndex];

            const newCategory = this.categoryService.createCategory(
              categoryName,
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

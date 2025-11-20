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
import { FeatureFlagsService } from '../core/services/feature-flags.service';

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

  // feature flag para habilitar/deshabilitar categorías
  categoriesEnabled = true;

  constructor(
    private readonly taskService: TaskService,
    private readonly categoryService: CategoryService,
    private readonly alertCtrl: AlertController,
    private readonly modalCtrl: ModalController,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();

    // suscripción al feature flag de categorías
    this.featureFlagsService.categoriesEnabled$.subscribe((enabled) => {
      this.categoriesEnabled = enabled;

      // si por alguna razon se deshabilitan las categorías, limpiamos el filtro de categoría seleccionado
      if (!enabled) {
        this.selectedCategoryId = null;
      }
    });
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
      tasks = tasks.filter(
        (task) => task.categoryId === this.selectedCategoryId,
      );
    }

    switch (this.currentSegment) {
      case 'pending':
        return tasks.filter((task) => !task.completed);
      case 'done':
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
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
        categories: this.categoriesEnabled ? this.categories : [],
        initialTitle: '',
        initialCategoryId: this.categoriesEnabled
          ? this.selectedCategoryId
          : null,
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

      const newTask = this.taskService.createTask(
        title,
        this.categoriesEnabled ? categoryId : null,
      );
      this.tasks = [newTask, ...this.tasks];
      this.persistTasks();
    }
  }

  async openCategoryManagerModal() {
    if (!this.categoriesEnabled) {
      return;
    }

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
        categories,
        deletedCategoryIds,
      }: { categories: Category[]; deletedCategoryIds: string[] } = data;

      this.categories = categories;
      this.persistCategories();

      if (Array.isArray(deletedCategoryIds) && deletedCategoryIds.length) {
        const deletedSet = new Set(deletedCategoryIds);

        this.tasks = this.tasks.map((task) =>
          task.categoryId && deletedSet.has(task.categoryId)
            ? { ...task, categoryId: null }
            : task,
        );
        this.persistTasks();

        if (
          this.selectedCategoryId &&
          deletedSet.has(this.selectedCategoryId)
        ) {
          this.selectedCategoryId = null;
        }
      }
    }
  }

  toggleTask(task: Task) {
    this.tasks = this.tasks.map((taskItem) =>
      taskItem.id === task.id
        ? { ...taskItem, completed: !taskItem.completed }
        : taskItem,
    );
    this.persistTasks();
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter((taskItem) => taskItem.id !== task.id);
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

            const colors = [
              '#7c3aed',
              '#14b8a6',
              '#f97316',
              '#22c55e',
              '#eab308',
            ];
            const randomColor =
              colors[Math.floor(Math.random() * colors.length)];

            const newCategory = this.categoryService.createCategory(
              name,
              randomColor,
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
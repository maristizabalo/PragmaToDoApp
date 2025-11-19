import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

import { Task } from '../core/models/task.model';
import { TaskService } from '../core/services/task.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  tasks: Task[] = [];
  currentSegment: 'all' | 'pending' | 'done' = 'all';

  constructor(
    private readonly taskService: TaskService,
    private readonly alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.tasks = this.taskService.getTasks();
  }

  private persist(): void {
    this.taskService.saveTasks(this.tasks);
  }

  get filteredTasks(): Task[] {
    switch (this.currentSegment) {
      case 'pending':
        return this.tasks.filter((t) => !t.completed);
      case 'done':
        return this.tasks.filter((t) => t.completed);
      default:
        return this.tasks;
    }
  }

  onSegmentChange(event: CustomEvent) {
    this.currentSegment = event.detail.value;
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
            if (!title) {
              return false;
            }

            const newTask = this.taskService.createTask(title);
            this.tasks = [newTask, ...this.tasks];
            this.persist();
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
    this.persist();
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
    this.persist();
  }

  trackByTaskId(index: number, task: Task) {
    return task.id;
  }
}
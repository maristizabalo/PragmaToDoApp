import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Task } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.scss'],
})
export class TasksListComponent {
  @Input() tasks: Task[] = [];
  @Input() categories: Category[] = [];

  @Output() toggle = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();

  onToggle(task: Task) {
    this.toggle.emit(task);
  }

  onDelete(task: Task) {
    this.delete.emit(task);
  }

  trackByTaskId(index: number, task: Task) {
    return task.id;
  }

  getCategoryForTask(task: Task): Category | undefined {
    if (!task.categoryId) return undefined;
    return this.categories.find(
      (category) => category.id === task.categoryId
    );
  }

  get hasTasks(): boolean {
    return this.tasks && this.tasks.length > 0;
  }
}

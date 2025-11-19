import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Category } from '../../../core/models/category.model';

type TaskSegment = 'all' | 'pending' | 'done';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './task-filters.component.html',
  styleUrls: ['./task-filters.component.scss'],
})
export class TaskFiltersComponent {
  @Input() currentSegment: TaskSegment = 'all';
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: string | null = null;

  @Output() segmentChange = new EventEmitter<TaskSegment>();
  @Output() categoryChange = new EventEmitter<string | null>();
  @Output() createCategory = new EventEmitter<void>();

  onSegmentChange(event: CustomEvent) {
    this.segmentChange.emit(event.detail.value);
  }

  onSelectCategory(id: string | null) {
    this.categoryChange.emit(id);
  }

  onCreateCategory() {
    this.createCategory.emit();
  }
}
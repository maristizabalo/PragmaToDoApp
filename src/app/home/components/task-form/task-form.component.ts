import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  @Input() header: string = 'Tarea';
  @Input() categories: Category[] = [];
  @Input() initialTitle: string | null = null;
  @Input() initialCategoryId: string | null = null;

  title = '';
  categoryId: string | null = null;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.title = this.initialTitle ?? '';
    this.categoryId = this.initialCategoryId ?? null;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    const trimmed = this.title.trim();
    if (!trimmed) return;

    this.modalCtrl.dismiss(
      { title: trimmed, categoryId: this.categoryId || null },
      'save'
    );
  }
}

import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryManagerComponent implements OnInit {
  @Input() categories: Category[] = [];

  localCategories: Category[] = [];
  deletedCategoryIds: string[] = [];

  private readonly colorPalette = [
    '#7c3aed',
    '#14b8a6',
    '#f97316',
    '#22c55e',
    '#eab308',
  ];

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController,
    private readonly categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.localCategories = [...this.categories];
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    this.modalCtrl.dismiss(
      {
        categories: this.localCategories,
        deletedCategoryIds: this.deletedCategoryIds,
      },
      'save',
    );
  }

  private getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.colorPalette.length);
    return this.colorPalette[randomIndex];
  }

  async addCategory() {
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

            const color = this.getRandomColor();
            const newCategory = this.categoryService.createCategory(
              name,
              color,
            );
            this.localCategories = [...this.localCategories, newCategory];
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editCategory(category: Category) {
    const alert = await this.alertCtrl.create({
      header: 'Editar categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: category.name,
          placeholder: 'Nombre de la categoría',
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

            this.localCategories = this.localCategories.map(
              (categoryItem) =>
                categoryItem.id === category.id
                  ? { ...categoryItem, name }
                  : categoryItem,
            );
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteCategory(category: Category) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: `¿Seguro que quieres eliminar <strong>${category.name}</strong>? Las tareas quedarán sin categoría.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.localCategories = this.localCategories.filter(
              (categoryItem) => categoryItem.id !== category.id,
            );
            this.deletedCategoryIds.push(category.id);
          },
        },
      ],
    });

    await alert.present();
  }

  trackByCategoryId(index: number, category: Category) {
    return category.id;
  }
}
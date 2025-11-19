import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  categoryName?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  tasks: Task[] = [
    // Datos de ejemplo para que veas la UI
    { id: 1, title: 'Configurar estructura base de la app', completed: true, categoryName: 'Setup' },
    { id: 2, title: 'Definir modelo de tareas y categorías', completed: false, categoryName: 'Arquitectura' },
    { id: 3, title: 'Integrar Firebase Remote Config', completed: false, categoryName: 'Integración' },
  ];

  currentSegment: 'all' | 'pending' | 'done' = 'all';

  onSegmentChange(event: CustomEvent) {
    this.currentSegment = event.detail.value;
    // Luego filtraremos en base a este valor
  }

  toggleTask(task: Task) {
    task.completed = !task.completed;
    // Luego aquí dispararemos persistencia en storage/local
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
    // Luego persistimos cambios
  }

  openCreateTaskModal() {
    // Más adelante: abrir modal o página para crear tarea
  }

  trackByTaskId(index: number, task: Task) {
    return task.id;
  }
}
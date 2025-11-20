import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// imports para iconos
import { addIcons } from 'ionicons';
import {
  addOutline,
  pricetagsOutline,
  trashOutline,
  createOutline,
} from 'ionicons/icons';

import { environment } from './environments/environment';

// imports deFirebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

addIcons({
  'add-outline': addOutline,
  'pricetags-outline': pricetagsOutline,
  'trash-outline': trashOutline,
  'create-outline': createOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  ],
}).catch((err) => console.error(err));

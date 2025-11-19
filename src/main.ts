import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// imports para iconos
import { addIcons } from 'ionicons';
import { addOutline, pricetagsOutline, trashOutline } from 'ionicons/icons';

addIcons({
  'add-outline': addOutline,
  'pricetags-outline': pricetagsOutline,
  'trash-outline': trashOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});

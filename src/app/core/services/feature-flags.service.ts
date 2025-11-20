import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  RemoteConfig,
} from 'firebase/remote-config';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  private remoteConfig: RemoteConfig;

  // exponer el feature flag de categorías como observable para que otros servicios o componentes puedan suscribirse
  private categoriesEnabledSubject = new BehaviorSubject<boolean>(
    environment.featureFlags.categoriesEnabledDefault,
  );
  categoriesEnabled$ = this.categoriesEnabledSubject.asObservable();

  constructor(private readonly firebaseApp: FirebaseApp) {
    // inicializar remote config
    this.remoteConfig = getRemoteConfig(this.firebaseApp);

    // config de remote config para pruebas en desarrollo
    // this.remoteConfig.settings = {
    //   minimumFetchIntervalMillis: 60_000, // para pruebas   1 min
    //   // minimumFetchIntervalMillis:
    // };

    // forma correctaasignar directamente la propiedad sin reemplazar el objeto completo
    this.remoteConfig.settings.minimumFetchIntervalMillis = 5_000; // para pruebas   5seg

    this.remoteConfig.defaultConfig = {
      categories_enabled:
        environment.featureFlags.categoriesEnabledDefault,
    };

    this.initRemoteConfig();
  }

  private async initRemoteConfig(): Promise<void> {
    try {
      await fetchAndActivate(this.remoteConfig);
      // consle para revisar que Remote Config se activó
      console.log('feature flags Remote Config activado');
    } catch (error) {
      console.error('feature-flag error desde remote config', error);
    } finally {
      const value = getValue(this.remoteConfig, 'categories_enabled');
      const enabled = value.asBoolean();
      this.categoriesEnabledSubject.next(enabled);
      // consolepara revisar si el feature flag se cargó bien
      console.log('feature flag catewgories_enabled is', enabled);
    }
  }

  getBooleanFlag(key: string, fallback: boolean): boolean {
    try {
      const value = getValue(this.remoteConfig, key);
      return value.asBoolean();
    } catch {
      return fallback;
    }
  }
}

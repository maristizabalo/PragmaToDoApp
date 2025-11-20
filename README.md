# Pragma To-Do App con Ionic + Angular + Firebase Remote Config

Este repo es mi solucion a la prueba tecnica de desarrollador mobile usando **Ionic 8**, **Angular 20** y **Capacitor 7**.

En esta app se puede encontrar que cumple con:

- Crear nuevas tareas.
- Marcar tareas como completadas.
- Eliminar tareas.
- Manejar **categorias** (crear, editar, eliminar).
- Asignar categoria a cada tarea.
- Filtrar por estado (**Todo / Pendientes / Completadas**).
- Filtrar por categoria.
- Guardar todo en almacenamiento local (LocalStorage).
- Usar un **feature flag** con **Firebase Remote Config** para prender o apagar toda la parte de categorias.

El objetivo y foco de la prueba se centra en:

- Mantener el codigo lo mas limpio posible.
- Mantuve una UX en modo dark.
- Cuidar rendimiento y memoria.
- Dejar listo el proyecto para Android e iOS.

---

## 1. Stack tecnologico

- **Framework UI**: Ionic 8 (`@ionic/angular`)
- **Framework web**: Angular 20 (standalone components)
- **Runtime nativo**: Capacitor 7
  - `@capacitor/core`
  - `@capacitor/android`
  - `@capacitor/ios`
- **Lenguaje**: TypeScript
- **Firebase**:
  - Web SDK (`firebase`)
  - `@angular/fire` para integrarlo con Angular
  - Remote Config para feature flags
- **Almacenamiento**:
  - LocalStorage via servicios (`TaskService` y `CategoryService`)

> Nota: aunque la prueba menciona Cordova, para Ionic 8 el runtime recomendado es Capacitor (https://ionicframework.com/docs/angular/overview), que es el runtime nativo oficial de Ionic. Por eso este proyecto genera los binarios nativos usando Capacitor (android / ios).


## 2. Firebase y Remote Config

La app se conecta a un proyecto Firebase usando la config definida en los archivos:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Firebase y Remote Config se inicializan en `main.ts` a traves de AngularFire.

Para el feature flag cree un servicio `FeatureFlagsService` (`src/app/core/services/feature-flags.service.ts`), donde:

- Inicializo **Remote Config**.
- Defino un flag booleano llamado `categories_enabled`.
- Leo ese flag al arrancar la app y lo expongo como observable.

`HomePage` se suscribe a ese flag y, segun el valor:

- Si esta activado, se muestra toda la parte de **categorias**  y se permite asignar categoria al crear tareas.
- Si esta desactivado, se ocultan las categorias y las tareas nuevas se guardan sin categoria.

## 3. Requisitos

- Node.js 20+
- npm
- Ionic CLI:

  ```bash
  npm install -g @ionic/cli
  ```

- Angular CLI (opcional):

  ```bash
  npm install -g @angular/cli
  ```

- Capacitor CLI (opcional global):

  ```bash
  npm install -g @capacitor/cli
  ```

- Android Studio (para Android).
- Xcode en macOS (para iOS).

---

## 4. Como correr en desarrollo (web)

1. Clonar repo:

   ```bash
   git clone https://github.com/maristizabalo/PragmaToDoApp.git
   cd PragmaToDoApp
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Levantar en modo dev:

   ```bash
   ionic serve
   ```

   URL por defecto: `http://localhost:8100`

---

## 5. Build web (carpeta `www`)

Para generar el build que usara Capacitor:

```bash
ionic build
```

Eso genera la carpeta `www/`.

Para probar el build estatico:

```bash
npx http-server ./www -c-1
```

- `-c-1` es para evitar problemas de cache cuando estoy probando cambios.

---

## 6. Android: APK

### 6.1. Agregar plataforma Android

```bash
npx cap add android
```

Crea la carpeta `android/`.

### 6.2. Sincronizar cambios

Cada vez que cambio algo en la app:

```bash
ionic build
npx cap sync android
```

### 6.3. Abrir en Android Studio

```bash
npx cap open android
```

Desde Android Studio puedo:

- Ejecutar en emulador o dispositivo.
- Generar un APK:
  - `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`.

Para la prueba estoy usando un APK de debug generado desde ahi.

---

## 7. iOS: IPA

> Requiere macOS + Xcode.

### 7.1. Agregar plataforma iOS

```bash
npx cap add ios
```

### 7.2. Sincronizar

```bash
ionic build
npx cap sync ios
```

### 7.3. Abrir en Xcode

```bash
npx cap open ios
```

En Xcode:

- Ejecutar en simulador / dispositivo.
- Crear un **Archive** y exportar el IPA segun los certificados disponibles.

---

## 8. Rendimiento

Para el tema de rendimiento tuve en cuenta tres cosas que pide la prueba: carga inicial, muchas tareas y memoria.

A nivel de estructura deje una sola pagina principal (`HomePage`) y varios componentes pequenos para no mezclar logica de UI con logica de negocio. Tambien mantuve los estilos globales sencillos, sin meter librerias pesadas extra.

Cuando trabajo con listas grandes de tareas y categorias siempre creo nuevos arreglos (uso map y filter) en lugar de modificar los existentes, asi es mas facil controlar los cambios y que la pantalla se actualice solo cuando toca. En la lista de tareas uso una funcion `trackBy` para que Angular no tenga que re pintar todo de nuevo cada vez.

Por el lado de memoria, las suscripciones que hago al feature flag de Firebase las limpio cuando la pagina se destruye, para que no queden escuchas vivas en segundo plano. Ademas los componentes de presentacion son simples y solo reciben datos por inputs, lo que tambien ayuda a que la app se mantenga ligera.

## 9. Notas del build Angular + Ionic

Mientras armaba el build para la carpeta `www` me encontré con un bug raro:  
con `ionic serve` todo se veía perfecto, pero al hacer `ionic build` y servir `www` con `http-server` los componentes de Ionic parecian texto normal, no se veian como botones ni segment, y no respondian a los clicks.

Después de revisar, el problema venia de la configuracion de build en `angular.json`. Ajuste la parte de `build` para que el `outputPath` apunte bien a `www` y para que la configuracion de produccion no aplique optimizaciones que rompan Ionic en esta combinacion de versiones.

Con eso la app ya se comporta igual en:
- `ionic serve`
- `http-server ./www`
- y en el APK instalado en Android.

Para esta prueba preferi priorizar que todo funcione estable en los dispositivos antes que activar todas las optimizaciones posibles.
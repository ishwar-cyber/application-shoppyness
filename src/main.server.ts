import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';

import { App } from './app/app';
import { config as serverAppConfig } from './app/app.config.server';

// IMPORTANT: must accept and forward BootstrapContext
export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(
    App,
    serverAppConfig,
    context   // <-- REQUIRED in Angular 20 SSR
  );
}

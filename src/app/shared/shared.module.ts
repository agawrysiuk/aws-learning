import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SERVICES_DECLARATIONS} from "./services/services.declarations";
import {PRIMENG_DECLARATIONS} from "./primeng.declarations";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PRIMENG_DECLARATIONS
  ],
  exports: [
    PRIMENG_DECLARATIONS
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        SERVICES_DECLARATIONS
      ]
    }
  }
}


import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {CoreModule} from "./core/core.module";
import {SharedModule} from "./shared/shared.module";
import {registerLocaleData} from "@angular/common";
import localePl from '@angular/common/locales/pl';
import {Amplify} from "aws-amplify";
import {amplifySecretInfo} from "../environments/secret-info";
import {InitService} from "./shared/services/init/init.service";
import {HttpClientModule} from "@angular/common/http";

registerLocaleData(localePl);

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: amplifySecretInfo.region,
    userPoolId: amplifySecretInfo.userPoolId,
    userPoolWebClientId: amplifySecretInfo.userPoolWebClientId,
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
});

export function initData(initService: InitService) {
  return () => initService.init();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    HttpClientModule,
    SharedModule.forRoot()
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initData,
      deps: [InitService],
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'pl' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

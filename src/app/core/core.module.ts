import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginComponent} from "./login/login.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import { HeaderComponent } from './header/header.component';
import { OnlineListComponent } from './online-list/online-list.component';
import { WritingComponent } from './writing/writing.component';
import { ChatHistoryComponent } from './chat-history/chat-history.component';

@NgModule({
  declarations: [
    LoginComponent,
    HeaderComponent,
    OnlineListComponent,
    WritingComponent,
    ChatHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    LoginComponent,
    HeaderComponent,
    OnlineListComponent,
    WritingComponent
  ]
})
export class CoreModule { }

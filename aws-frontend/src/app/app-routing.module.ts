import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChatHistoryComponent} from "./core/chat-history/chat-history.component";

const routes: Routes = [
  {
    path: ":userId",
    component: ChatHistoryComponent
  },
  {
    path: "**",
    component: ChatHistoryComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

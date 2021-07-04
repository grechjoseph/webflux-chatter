import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {DatePipe} from '@angular/common';


import { AppComponent } from './app.component';

import { ChatService } from './chat/service/chat.service';
import { ChatComponent } from './chat/component/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    ChatService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

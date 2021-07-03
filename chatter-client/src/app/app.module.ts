import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {DatePipe} from '@angular/common';


import { AppComponent } from './app.component';

import { ChatService } from './services/chat.service';

@NgModule({
  declarations: [
    AppComponent
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

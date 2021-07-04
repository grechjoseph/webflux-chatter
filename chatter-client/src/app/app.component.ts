import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import {DatePipe} from '@angular/common';

import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'app';
  userId: string;
  chatId: string;
  events: any[] = [];
  eventsSubscription: any;

  @ViewChild('messagesContainer') private myScrollContainer: ElementRef;
  @ViewChild('txtCompose') private txtCompose: ElementRef;

  constructor(private chatService: ChatService, private datePipe: DatePipe, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

  /** Server Access **/

  public startOrJoinChat(_chatId: string, _nickname: string) {
    this.leaveChat();
    this.resetFields();
    this.chatService.startOrJoinChat(_chatId, _nickname)
      .subscribe(chatInfo => {
        this.userId = chatInfo.userId;
        this.chatId = chatInfo.chat.id;
        this.scrollToBottom();

        this.eventsSubscription = this.chatService.subscribeToChat(this.chatId)
          .subscribe(event => {
            console.log(event);
            this.events.push(event);
            this.scrollToBottom();
          });
      });
  }

  public sendMessage(_message: string) {
    this.chatService.sendMessage(this.chatId, this.userId, _message);
    this.txtCompose.nativeElement.value = '';
  }

  public leaveChat() {
    if (this.chatId && this.userId) {
      this.chatService.leaveChat(this.chatId, this.userId).subscribe();
    }
    this.resetFields();
  }

  resetFields() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }

    this.userId = null;
    this.chatId = null;
    this.events = [];
  }

  /** Utils **/

  public getNicknameByMemberId(_memberId): string {
    return this.events.find(event => event.type === 'MEMBER' && event.payload.id === _memberId).payload.nickname;
  }

  public didNotLeave(userId: string) {
    return this.events.find(event => event.type === 'LEFT_CHAT' && event.payload.id === userId) == null;
  }

  public formatDateTime(_dateTime): string {
    let date = new Date(_dateTime);
    return this.datePipe.transform(date,"dd-MM-yyyy HH:mm");
  }

  public parseMessage(_message: string): string {
    return _message;
  }

  /** UX **/

  public preventDefault(event){
    event.preventDefault();
  }

  public scrollToBottom(): void {
      // Wait for template to update.
      this.changeDetectorRef.detectChanges();
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight
  }

  public copyToClipboard(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

}

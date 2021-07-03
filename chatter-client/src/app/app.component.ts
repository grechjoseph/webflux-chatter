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
    this.resetFields();
    this.chatService.startOrJoinChat(_chatId, _nickname)
      .subscribe(chatInfo => {
        this.userId = chatInfo.userId;
        console.log('MemberId: ' + this.userId);
        this.chatId = chatInfo.chat.id;
        console.log('ChatId: ' + this.chatId);
        this.scrollToBottom();

        // Subscribe to chat messages
        this.eventsSubscription = this.chatService.subscribeToChat(this.chatId)
          .subscribe(event => {
            console.log(event);
            this.events.push(event);
            this.scrollToBottom();
          });
        console.log("Subscribed to Chat messages.");
      });
  }

  public sendMessage(_message: string) {
    this.chatService.sendMessage(this.chatId, this.userId, _message);
    this.txtCompose.nativeElement.value = '';
  }

  public leaveChat() {
    this.chatService.leaveChat(this.chatId, this.userId).subscribe();
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

  /** UX **/

  public onKeydown(event){
    event.preventDefault();
  }

  public scrollToBottom(): void {
      // Wait for template to update.
      this.changeDetectorRef.detectChanges();
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight
  }

  public didNotLeave(userId: string) {
    return this.events.find(event => event.type === 'LEFT_CHAT' && event.payload.id === userId) == null;
  }

  /** Utils **/

  public getNicknameByMemberId(_memberId): string {
    return this.events.find(event => event.type === 'MEMBER' && event.payload.id === _memberId).payload.nickname;
  }

  public formatDateTime(_dateTime): any {
    let date = new Date(_dateTime);
    return this.datePipe.transform(date,"dd-MM-yyyy HH:mm");
  }

}

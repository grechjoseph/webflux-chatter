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

  constructor(private chatService: ChatService, private datePipe: DatePipe, private changeDetectorRef: ChangeDetectorRef) { }

  userId: string;
  chatId: string;
  members: any[] = [];
  messages: any[] = [];

  messagesSubscription: any;
  membersSubscription: any;

  /** Scroll **/
  ngOnInit() {
      this.scrollToBottom();
  }

  @ViewChild('messagesContainer') private myScrollContainer: ElementRef;
  @ViewChild('txtCompose') private txtCompose: ElementRef;

  scrollToBottom(): void {
      // Wait for template to update.
      this.changeDetectorRef.detectChanges();
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight
  }

  public startOrJoinChat(_chatId: string, _nickname: string) {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    if (this.membersSubscription) {
      this.membersSubscription.unsubscribe();
    }

    this.userId = null;
    this.chatId = null;
    this.members = [];
    this.messages = [];

    // Start or Join Chat
    this.chatService.startOrJoinChat(_chatId, _nickname)
      .subscribe(chatInfo => {
        this.userId = chatInfo.userId;
        console.log('MemberId: ' + this.userId);
        this.chatId = chatInfo.chat.id;
        console.log('ChatId: ' + this.chatId);
        this.members = chatInfo.chat.members;
        this.messages = chatInfo.chat.messages;
        this.scrollToBottom();

        // Subscribe to chat messages
        this.messagesSubscription = this.chatService.subscribeToChatMessages(this.chatId)
          .subscribe(message => {
            console.log(message);
            this.messages.push(message);
            this.scrollToBottom();
          });
        console.log("Subscribed to Chat messages.");

        // Subscribe to chat members
        this.membersSubscription = this.chatService.subscribeToChatMembers(this.chatId)
          .subscribe(member => {
            console.log(member);
            this.members.push(member);
          });
        console.log("Subscribed to Chat members.");
      });
  }

  public addMessageToView(_message: any) {
  }

  public onKeydown(event){
    event.preventDefault();
  }

  public sendMessage(_message: string) {
    this.chatService.sendMessage(this.chatId, this.userId, _message);
    this.txtCompose.nativeElement.value = '';
  }

  public getNicknameByMemberId(_memberId): string {
    return this.members.find(member => member.id === _memberId).nickname;
  }

  public formatDateTime(_dateTime): any {
    let date = new Date(_dateTime);
    return this.datePipe.transform(date,"dd-MM-yyyy HH:mm");
  }

}

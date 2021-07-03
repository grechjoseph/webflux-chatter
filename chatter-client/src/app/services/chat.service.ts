import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SSE } from 'sse.js';

import { StartOrJoinRequest } from '../models/start-or-join-request.model';
import { PostMessageRequest } from '../models/post-message-request.model';

@Injectable()
export class ChatService {

  constructor() { }

  public startOrJoinChat(_chatId: string, _nickname: string) : Observable<any> {
      return new Observable((observer) => {
            let url = 'http://localhost:8080/start';
            let requestBody = new StartOrJoinRequest(_chatId, _nickname);
            let requestHeaders = {
              'Content-Type': 'application/json',
              'Access-Control-Expose-Headers': 'user-id'
            };
            let httpMethod = 'POST';

            let request = {
              headers: requestHeaders,
              payload: JSON.stringify(requestBody),
              method: httpMethod
            };

            let source = new SSE(url, request);
            source.onmessage = (event) => {
              observer.next(JSON.parse(source.chunk));
            }
            source.stream();
          });
    }

  public subscribeToChatMessages(_chatId: string) : Observable<any> {
      return new Observable((observer) => {
            let url = 'http://localhost:8080//chats/' + _chatId + '/messages/subscribe';
            let requestHeaders = {
              'Content-Type': 'application/json'
            };
            let httpMethod = 'GET';

            let request = {
              headers: requestHeaders,
              method: httpMethod
            };

            let source = new SSE(url, request);
            source.onmessage = (event) => {
              observer.next(JSON.parse(event.data));
            }
            source.stream();
          });
    }

  public subscribeToChatMembers(_chatId: string) : Observable<any> {
      return new Observable((observer) => {
            let url = 'http://localhost:8080/chats/' + _chatId + '/members/subscribe';
            let requestHeaders = {
              'Content-Type': 'application/json'
            };
            let httpMethod = 'GET';

            let request = {
              headers: requestHeaders,
              method: httpMethod
            };

            let source = new SSE(url, request);
            source.onmessage = (event) => {
              observer.next(JSON.parse(event.data));
            }
            source.stream();
          });
    }

    public sendMessage(_chatId: string, _memberId: string, _message: string) {
      let url = 'http://localhost:8080/chats/' + _chatId;
      let requestBody = new PostMessageRequest(_chatId, _memberId, _message);
      let requestHeaders = {
        'Content-Type': 'application/json'
      };
      let httpMethod = 'POST';

      let request = {
        headers: requestHeaders,
        payload: JSON.stringify(requestBody),
        method: httpMethod
      };

      let source = new SSE(url, request);
      source.onmessage = (event) => {
        console.log("Posted message: " + _message);
      }
      source.stream();
    }

}

package com.jg.chatter.controller;

import com.jg.chatter.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static com.jg.chatter.dto.ChatEventType.*;
import static io.netty.util.internal.StringUtil.isNullOrEmpty;
import static java.util.Objects.nonNull;

@Slf4j
@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
public class ChatController {

    private final Set<ChatDto> chats = new HashSet<>();

    @PostMapping(value = "/start", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StartOrJoinChatResponseDto> startChat(@RequestBody final StartChatRequest request) {
        final UserDto user = UserDto.builder()
                .nickname(request.getNickname())
                .build();

        final ChatDto chat = chats.stream()
                .filter(c -> nonNull(request.getChatId()) && c.getId().equals(request.getChatId()))
                .findFirst()
                .map(existingChat -> {
                    // Chat exists. Return existing chat.
                    existingChat.getMembers().add(user);
                    existingChat.eventSink().tryEmitNext(ChatEventDto.builder()
                            .type(MEMBER)
                            .payload(user)
                            .build());
                    return existingChat;
                })
                .orElseGet(() -> {
                    // Chat does not exist. Create new chat, and return it.
                    final ChatDto newChat = ChatDto.builder()
                            .build();
                    newChat.getMembers().add(user);
                    newChat.eventSink().tryEmitNext(ChatEventDto.builder()
                            .type(MEMBER)
                            .payload(user)
                            .build());
                    chats.add(newChat);
                    return newChat;
                });

        return ResponseEntity.ok()
                .header("user-id", user.getId().toString())
                .body(StartOrJoinChatResponseDto.builder()
                        .userId(user.getId())
                        .chat(chat)
                        .build());

    }

    @GetMapping(value = "/chats/{chatId}/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatEventDto> subscribeToChat(@PathVariable final UUID chatId) {
        final SubscribeToChatMessagesRequest request = SubscribeToChatMessagesRequest.builder()
                .chatId(chatId)
                .build();

        return chats.stream()
                .filter(chat -> chat.getId().equals(request.getChatId()))
                .findFirst()
                .map(chat -> chat.eventSink().asFlux())
                .orElseThrow(() -> new RuntimeException("Chat Not Found with ID: " + request.getChatId()));
    }

    @PostMapping("/chats/{chatId}")
    public void postMessageToChat(@RequestBody final PostMessageRequest request, @PathVariable final UUID chatId) {
        if (isNullOrEmpty(request.getMessage())) {
            return;
        }

        request.setChatId(chatId);

        chats.stream()
                .filter(chat -> chat.getId().equals(request.getChatId()))
                .findFirst()
                .ifPresent(chat -> {
                    final MessageDto message = MessageDto.builder()
                            .senderId(request.getMemberId())
                            .message(request.getMessage())
                            .build();
                    chat.getMessages().add(message);
                    chat.eventSink().tryEmitNext(ChatEventDto.builder()
                            .type(MESSAGE)
                            .payload(message)
                            .build());
                });
    }

    @DeleteMapping("/chats/{chatId}/members/{memberId}")
    public void removeMemberFromChat(@PathVariable final UUID chatId, @PathVariable final UUID memberId) {
        chats.stream()
                .filter(chat -> chat.getId().equals(chatId))
                .findFirst()
                .ifPresent(chat -> {
                    chat.getMembers().stream()
                            .filter(member -> member.getId().equals(memberId))
                            .findFirst()
                            .ifPresent(member -> {
                                chat.getMembers().remove(member);
                                chat.eventSink().tryEmitNext(ChatEventDto.builder()
                                        .type(LEFT_CHAT)
                                        .payload(member)
                                        .build());
                            });
                });
    }

}

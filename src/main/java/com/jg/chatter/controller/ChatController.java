package com.jg.chatter.controller;

import com.jg.chatter.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static java.util.Objects.nonNull;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin("*")
@EnableAsync
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
                    existingChat.getMembers().add(user);
                    existingChat.membersSink().tryEmitNext(user);
                    return existingChat;
                })
                .orElseGet(() -> {
                    final ChatDto newChat = ChatDto.builder()
                            .build();
                    newChat.getMembers().add(user);
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

    @GetMapping(value = "/chats/{chatId}/messages/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<MessageDto> subscribeToChatMessages(@PathVariable final UUID chatId) {
        final SubscribeToChatMessagesRequest request = SubscribeToChatMessagesRequest.builder()
                .chatId(chatId)
                .build();

        log.debug("Finding chat to fetch flux from.");
        return chats.stream()
                .filter(chat -> {
                    log.debug("Finding chat by ID.");
                    return chat.getId().equals(request.getChatId());
                })
                .findFirst()
                .map(chat -> {
                    log.debug("Mapping chat to flux.");
                    return chat.messagesSink().asFlux();
                })
                .orElseThrow(() -> new RuntimeException("Chat Not Found with ID: " + request.getChatId()));
    }

    @GetMapping(value = "/chats/{chatId}/members/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<UserDto> subscribeToChatMembers(@PathVariable final UUID chatId) {
        final SubscribeToChatMembersRequest request = SubscribeToChatMembersRequest.builder()
                .chatId(chatId)
                .build();
        return chats.stream()
                .filter(chat -> chat.getId().equals(request.getChatId()))
                .findFirst()
                .map(chat -> chat.membersSink().asFlux())
                .orElseThrow(() -> new RuntimeException("Chat Not Found with ID: " + request.getChatId()));
    }

    @PostMapping("/chats/{chatId}")
    public void postMessageToChat(@RequestBody final PostMessageRequest request, @PathVariable final UUID chatId) {
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
                    chat.messagesSink().tryEmitNext(message);
                });
    }

}

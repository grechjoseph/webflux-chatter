package com.jg.chatter.dto;

import lombok.*;
import reactor.core.publisher.Sinks;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {

    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Builder.Default
    private List<UserDto> members = new ArrayList<>();

    @Builder.Default
    private List<MessageDto> messages = new ArrayList<>();

    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Sinks.Many<ChatEventDto> eventSink = Sinks.many().replay().all();

    public Sinks.Many<ChatEventDto> eventSink() {
        return this.eventSink;
    }

}

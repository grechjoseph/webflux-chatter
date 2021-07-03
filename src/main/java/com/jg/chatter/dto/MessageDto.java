package com.jg.chatter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {

    @Builder.Default
    private UUID id = UUID.randomUUID();
    private UUID senderId;
    @Builder.Default
    private LocalDateTime dateTime = LocalDateTime.now();
    private String message;

}

package com.jg.chatter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartOrJoinChatResponseDto {

    private UUID userId;
    private ChatDto chat;

}

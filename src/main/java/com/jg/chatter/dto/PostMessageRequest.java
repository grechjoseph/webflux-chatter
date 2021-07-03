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
public class PostMessageRequest {

    private UUID chatId;
    private UUID memberId;
    private String message;

}

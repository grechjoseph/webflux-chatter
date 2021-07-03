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
public class UserDto {

    @Builder.Default
    private UUID id = UUID.randomUUID();

    private String nickname;

    @Builder.Default
    private LocalDateTime joinDateTime = LocalDateTime.now();

}

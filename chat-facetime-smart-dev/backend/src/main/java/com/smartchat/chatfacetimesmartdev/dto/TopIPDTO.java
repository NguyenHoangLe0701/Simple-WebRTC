package com.smartchat.chatfacetimesmartdev.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopIPDTO {
    private String ip;
    private long count;
}
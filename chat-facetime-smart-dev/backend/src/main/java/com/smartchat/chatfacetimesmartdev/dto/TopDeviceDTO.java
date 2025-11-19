package com.smartchat.chatfacetimesmartdev.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopDeviceDTO {
    private String device;
    private long count;
}
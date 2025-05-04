package com.LinkVerse.Support.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Questionn {
    private String question;  // Không dùng static

    public String getQuestion() {
        return question;
    }
}

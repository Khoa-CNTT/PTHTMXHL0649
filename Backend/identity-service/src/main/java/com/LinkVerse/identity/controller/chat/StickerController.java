package com.LinkVerse.identity.controller.chat;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.LinkVerse.identity.service.chat.GiphyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stickers")
@RequiredArgsConstructor
public class StickerController {

    private final GiphyService giphyService;

    @GetMapping("/trending") // mở trang sticker, fe xử lý sao cho ấn vào -> gửi messsage type = sticker
    public ResponseEntity<List<String>> getTrendingStickers(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(giphyService.getTrendingStickers(limit));
    }

    @GetMapping("/search")
    public ResponseEntity<List<String>> searchStickers(
            @RequestParam String keyword, @RequestParam(defaultValue = "5") int limit // limit là số lượng xổ ra
            ) {
        return ResponseEntity.ok(giphyService.searchStickers(keyword, limit));
    }

    @GetMapping("/emoji")
    public ResponseEntity<List<String>> getEmoji(@RequestParam(defaultValue = "5") int limit) {
        List<String> emojiUrls = giphyService.getEmojis(limit);
        return new ResponseEntity<>(emojiUrls, HttpStatus.OK);
    }
}

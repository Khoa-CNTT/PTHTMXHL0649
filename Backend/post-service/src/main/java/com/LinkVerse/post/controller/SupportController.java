package com.LinkVerse.post.controller;

import com.LinkVerse.post.service.PsychologicalSupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SupportController {

    @Autowired
    private PsychologicalSupportService psychologicalSupportService;

//    @GetMapping("/request-support")
//    public String requestSupport(@RequestParam String email) {
//        return psychologicalSupportService.requestSupport(email);
//    }
}
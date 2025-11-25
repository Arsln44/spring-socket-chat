package sphynx.springsocketchat.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import sphynx.springsocketchat.model.ChatMessage;

@Controller
public class ChatController {

    @MessageMapping("/sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(ChatMessage chatMessage){
        return chatMessage;
    }
}
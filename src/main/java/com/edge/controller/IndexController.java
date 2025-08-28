package com.edge.controller;

import com.edge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class IndexController {

    @Autowired
    private UserService userService;

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
    @ResponseBody
    public String index() {
        return "<h3>Hello World</h3>" +
               "<p>JSON Database is running!</p>" +
               "<p><a href='/api/users'>View Users API</a></p>";
    }
    
    @GetMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    @ResponseBody
    public String status() {
        long userCount = userService.getAllUsers().size();
        return "{\"status\": \"running\", \"users\": " + userCount + "}";
    }
}

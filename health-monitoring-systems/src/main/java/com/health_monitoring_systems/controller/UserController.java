package com.health_monitoring_systems.controller;

import com.health_monitoring_systems.model.User;
import com.health_monitoring_systems.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public ResponseEntity<User> login (@RequestParam String email, @RequestParam String password){
        return ResponseEntity.ok(userService.login(email, password));
    }

    @PostMapping("/")
    public void saveUser(@RequestBody User user){
        userService.saveUser(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return ResponseEntity.ok(userService.updateUser(id, userDetails));
    }


}

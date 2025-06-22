package com.acortadorURL.backend.controller;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.acortadorURL.backend.clases.UrlRequest;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import jakarta.servlet.http.HttpServletResponse;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/URL")
public class URLController {

    @GetMapping
    public String listar() {
        return "Perfil Foto o Usuario";
    }

    @GetMapping("/verificar")
    public ResponseEntity<String> verificarUrl(@RequestParam String url) {
        // 1. Verifica que no esté vacío
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("error: vacío");
        }

        // 2. Verifica que tenga formato válido
        String regex = "^(https?://)([\\w.-]+)(:[0-9]+)?(/.*)?$";
        if (!Pattern.matches(regex, url)) {
            return ResponseEntity.badRequest().body("error: formato");
        }

        try {
            // 3. Verifica si la URL responde
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(3000); // 3 segundos
            connection.connect();

            int code = connection.getResponseCode();
            if (code >= 200 && code < 400) {
                return ResponseEntity.ok("ok");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error: inaccesible");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("error: inaccesible");
        }
    }

    @PostMapping("/acortar")
    public ResponseEntity<String> acortarUrl(@RequestBody UrlRequest request) {
        try {
            String originalUrl = request.getUrl();

            String shortId = UUID.randomUUID().toString().substring(0, 6);

            DatabaseReference ref = FirebaseDatabase
                    .getInstance()
                    .getReference("urls")
                    .child(shortId);

            Map<String, Object> data = new HashMap<>();
            data.put("originalUrl", originalUrl);

            ref.setValueAsync(data);

            String shortUrl = "http://localhost:8080/" + shortId;
            return ResponseEntity.ok(shortUrl);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al acortar URL");
        }
    }

    @GetMapping("/{shortId}")
    public void redirigir(@PathVariable String shortId, HttpServletResponse response) throws IOException {
        DatabaseReference ref = FirebaseDatabase
                .getInstance()
                .getReference("urls")
                .child(shortId);

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    String originalUrl = snapshot.child("originalUrl").getValue(String.class);
                    try {
                        response.sendRedirect(originalUrl);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        });
    }
}

package com.acortadorURL.backend.controller;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;

import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

//Clase de configuración para conectarse a la base de datos de firebase y ejecutar todo lo necesario.
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            String firebaseConfigBase64 = System.getenv("FIREBASE_CONFIG_BASE64");

            if (firebaseConfigBase64 == null || firebaseConfigBase64.isEmpty()) {
                throw new IllegalStateException("La variable de entorno FIREBASE_CONFIG_BASE64 no está configurada");
            }

            byte[] decodedBytes = Base64.getDecoder().decode(firebaseConfigBase64);

            InputStream serviceAccount = new ByteArrayInputStream(decodedBytes);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://acortadorurls-6df6f-default-rtdb.firebaseio.com")
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

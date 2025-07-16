package com.acortadorURL.backend.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;
import java.security.Key;

import org.springframework.stereotype.Component;

// Clase para controlar los Jwt
@Component
public class JwtUtil {

    // Se genera una contraseña para mandar codifcadas las Jwt
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Metodo para crear una Jwt codificada con el nombre y correo del usuario
    public String generateToken(String correo, String nombre) {
        long expirationMillis = 1000 * 60 * 60 * 24 * 30 * 2; // 2 meses de caducidad
        return Jwts.builder()
                .setSubject(correo)
                .claim("nombre", nombre)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(key)
                .compact();
    }

    public Key getKey() {
        return key;
    }
}
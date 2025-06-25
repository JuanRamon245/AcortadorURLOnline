package com.acortadorURL.backend.controller;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.DeferredResult;

import com.acortadorURL.backend.clases.UrlRequest;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/URL")
public class URLController {

    @GetMapping
    public ResponseEntity<String> getUsuario(HttpSession session) {
        Object usuario = session.getAttribute("usuarioNombreLogueado");
        if (usuario != null) {
            return ResponseEntity.ok("" + usuario);
        } else {
            return ResponseEntity.status(401).body("Registrarse");
        }
    }

    @GetMapping("/ver")
    public ResponseEntity<String> getCorreo(HttpSession session) {
        Object correo = session.getAttribute("usuarioCorreoLogueado");
        if (correo != null) {
            return ResponseEntity.ok("" + correo);
        } else {
            return ResponseEntity.status(401).body("Registrarse");
        }
    }

    @GetMapping("/verificar")
    public ResponseEntity<String> verificarUrl(@RequestParam String url) {
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("error: vacío");
        }

        String regex = "^(https?://)([\\w.-]+)(:[0-9]+)?(/.*)?$";
        if (!Pattern.matches(regex, url)) {
            return ResponseEntity.badRequest().body("error: formato");
        }

        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setConnectTimeout(3000);
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

            String shortId = UUID.randomUUID().toString().substring(0, 6);

            String originalUrl = request.getUrl();
            String correo = request.getCorreo();
            int usos = 20;

            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls").child(shortId);

            Map<String, Object> data = new HashMap<>();
            data.put("originalUrl", originalUrl);
            data.put("correoUsuario", correo);
            data.put("usos", usos);

            ref.setValueAsync(data);

            String shortUrl = "http://localhost:8080/" + shortId;
            return ResponseEntity.ok(shortUrl);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al acortar URL");
        }
    }

    @GetMapping("/r/{shortId}")
    public void redirigir(@PathVariable String shortId, HttpServletResponse response) throws IOException {
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls").child(shortId);

        final CompletableFuture<Map<String, Object>> future = new CompletableFuture<>();

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    String originalUrl = snapshot.child("originalUrl").getValue(String.class);
                    Long usos = snapshot.child("usos").getValue(Long.class);

                    if (originalUrl != null && usos != null && usos > 0) {
                        Map<String, Object> data = new HashMap<>();
                        data.put("originalUrl", originalUrl);
                        data.put("usos", usos - 1);
                        future.complete(data);
                    } else if (usos != null && usos <= 0) {
                        future.completeExceptionally(new RuntimeException("La URL ya no tiene usos disponibles"));
                    } else {
                        future.complete(null);
                    }
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Error al acceder a Firebase"));
            }
        });

        try {
            Map<String, Object> result = future.get(3, TimeUnit.SECONDS);

            if (result != null) {
                String originalUrl = (String) result.get("originalUrl");
                Long nuevosUsos = (Long) result.get("usos");

                if (nuevosUsos <= 0) {
                    ref.removeValueAsync();
                } else {
                    ref.child("usos").setValueAsync(nuevosUsos);
                }

                response.sendRedirect(originalUrl);
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "URL no encontrada");
            }
        } catch (Exception e) {
            if (e.getMessage().contains("usos disponibles")) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Esta URL ya no tiene usos disponibles");
            } else {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al redirigir");
            }
        }
    }

    @PostMapping("/registrarUsuario")
    public DeferredResult<ResponseEntity<String>> registrarUsuario(@RequestBody Map<String, String> datos,
            HttpSession session) {
        DeferredResult<ResponseEntity<String>> resultado = new DeferredResult<>();

        try {
            String nombre = datos.get("nombre");
            String correo = datos.get("correo");
            String contrasena = datos.get("contrasena");

            String correoNormalizado = correo.replace(".", "_");
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("usuarios").child(correoNormalizado);
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    if (snapshot.exists()) {
                        resultado.setResult(ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Ya existe un usuario con ese correo"));
                    } else {
                        Map<String, Object> data = new HashMap<>();
                        data.put("nombre", nombre);
                        data.put("correo", correo);
                        data.put("contrasena", contrasena);

                        ref.setValueAsync(data);
                        session.setAttribute("usuarioNombreLogueado", nombre);
                        session.setAttribute("usuarioCorreoLogueado", correo);
                        resultado.setResult(ResponseEntity.ok("Usuario registrado correctamente"));
                    }
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    resultado.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Error al acceder a Firebase: " + error.getMessage()));
                }
            });

        } catch (Exception e) {
            resultado.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar usuario: " + e.getMessage()));
        }

        return resultado;
    }

    @PostMapping("/accederUsuario")
    public DeferredResult<ResponseEntity<String>> iniciarSesion(@RequestBody Map<String, String> datos,
            HttpSession session) {
        DeferredResult<ResponseEntity<String>> resultado = new DeferredResult<>();

        String correo = datos.get("correo");
        String contrasena = datos.get("contrasena");

        if (correo == null || contrasena == null) {
            resultado.setResult(ResponseEntity.badRequest().body("Correo o contraseña faltan"));
            return resultado;
        }

        String correoNormalizado = correo.replace(".", "_");

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("usuarios").child(correoNormalizado);

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (!snapshot.exists()) {
                    resultado.setResult(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado"));
                    return;
                }

                String contrasenaGuardada = snapshot.child("contrasena").getValue(String.class);
                String nombre = snapshot.child("nombre").getValue(String.class);

                if (contrasena.equals(contrasenaGuardada)) {
                    session.setAttribute("usuarioNombreLogueado", nombre);
                    session.setAttribute("usuarioCorreoLogueado", correo);
                    resultado.setResult(ResponseEntity.ok("Inicio de sesión exitoso"));
                } else {
                    resultado.setResult(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta"));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                resultado.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al acceder a Firebase: " + error.getMessage()));
            }
        });

        return resultado;
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Sesión cerrada");
    }

    @GetMapping("/urls-usuario")
    public ResponseEntity<List<Map<String, Object>>> obtenerUrlsDelUsuario(HttpSession session) {
        Object correoObj = session.getAttribute("usuarioCorreoLogueado");

        if (correoObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String correoUsuario = correoObj.toString();

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls");
        CompletableFuture<List<Map<String, Object>>> future = new CompletableFuture<>();

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<Map<String, Object>> urlsUsuario = new ArrayList<>();

                for (DataSnapshot child : snapshot.getChildren()) {
                    Map<String, Object> data = new HashMap<>();
                    String correo = child.child("correoUsuario").getValue(String.class);

                    if (correo != null && correo.equals(correoUsuario)) {
                        data.put("shortId", child.getKey());
                        data.put("originalUrl", child.child("originalUrl").getValue(String.class));
                        data.put("usos", child.child("usos").getValue(Long.class));
                        urlsUsuario.add(data);
                    }
                }

                future.complete(urlsUsuario);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return ResponseEntity.ok(future.get(3, TimeUnit.SECONDS));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/actualizar-usos/{shortId}")
    public ResponseEntity<String> actualizarUsos(@PathVariable String shortId, @RequestBody Map<String, Integer> body) {
        Integer nuevosUsos = body.get("usos");

        if (nuevosUsos == null || nuevosUsos < 1 || nuevosUsos > 99) {
            return ResponseEntity.badRequest().body("Número de usos inválido");
        }

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls").child(shortId).child("usos");
        ref.setValueAsync(nuevosUsos);
        return ResponseEntity.ok("Usos actualizados correctamente");
    }

    @DeleteMapping("/eliminar/{shortId}")
    public ResponseEntity<String> eliminarUrl(@PathVariable String shortId) {
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls").child(shortId);
        ref.removeValueAsync();
        return ResponseEntity.ok("URL eliminada correctamente");
    }

}

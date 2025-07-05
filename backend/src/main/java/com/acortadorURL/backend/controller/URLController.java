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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.acortadorURL.backend.servicio.EmailService;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

//Controlador con todos los métodos y llamadas con la bbdd de Firebase y que permite también conectar el back con el front.
@CrossOrigin(origins = "https://juanramon245.github.io/AcortadorURLOnline/#/", allowCredentials = "true")
@RestController
@RequestMapping("/api/URL")
public class URLController {

    @Autowired
    private EmailService emailService;

    // Método que verifica si en la web hay un usario logueado o no, permitendo
    // registrarse en caso contrario, también envia al front el nombre del usuario
    // logueado.
    @GetMapping
    public ResponseEntity<String> getUsuario(HttpSession session) {
        Object usuario = session.getAttribute("usuarioNombreLogueado");
        if (usuario != null) {
            return ResponseEntity.ok("" + usuario);
        } else {
            return ResponseEntity.status(401).body("Registrarse");
        }
    }

    // Método que verifica si en la web hay un usario logueado o no, permitendo
    // registrarse en caso contrario, también envia al front el correo del usuario
    // logueado.
    @GetMapping("/ver")
    public ResponseEntity<String> getCorreo(HttpSession session) {
        Object correo = session.getAttribute("usuarioCorreoLogueado");
        if (correo != null) {
            return ResponseEntity.ok("" + correo);
        } else {
            return ResponseEntity.status(401).body("Registrarse");
        }
    }

    // Método que verifica si en la web hay un usario logueado o no, permitendo
    // registrarse en caso contrario, también envia al front la contraseña del
    // usuario logueado.
    @GetMapping("/con")
    public ResponseEntity<String> getContrasena(HttpSession session) {
        Object contrasena = session.getAttribute("usuarioContrasenaLogueado");
        if (contrasena != null) {
            return ResponseEntity.ok("" + contrasena);
        } else {
            return ResponseEntity.status(401).body("Registrarse");
        }
    }

    // Método encargado de verificar la URL introducida por el usuario en el front,
    // primero se mira si esta vacía, luego sí cumple el formato general y por
    // último si es una pagina web accesible.
    @GetMapping("/verificar")
    public ResponseEntity<String> verificarUrl(@RequestParam String url) {
        // Se revisa si la URL esta vacia
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("error: vacío");
        }

        // Se revisa si la URL tiene un formato aceptable
        String regex = "^(https?://)([\\w.-]+)(:[0-9]+)?(/.*)?$";
        if (!Pattern.matches(regex, url)) {
            return ResponseEntity.badRequest().body("error: formato");
        }

        // Se revisa si la URL es accesible por cualquiera
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

    // Método encargado de generar la url acortada para la url larga obtenida del
    // front, ademas de su correo para asociarlo y limitarlo a un número de usos,
    // primero se encarga de mirar si hay una url acortada con el mismo indicador y
    // correo que coincida, ene se caso se generará una nueva y así sucesivamente.
    // Después si la url que se va a acortar ya fue acortada previamente por el
    // usuario lo que se hará será devolver la que se recortó previamente o si no,
    // generar una nueva.
    @PostMapping("/acortar")
    public ResponseEntity<String> acortarUrl(@RequestBody UrlRequest request) {
        try {

            String shortId = UUID.randomUUID().toString().substring(0, 6);

            String originalUrl = request.getUrl();
            String correo = request.getCorreo();
            int usos = 20;

            DatabaseReference urlsRef = FirebaseDatabase.getInstance().getReference("urls");

            CountDownLatch latch = new CountDownLatch(1);
            final String[] resultadoUrl = { null };

            // Se mira si ya hay una url acortada por el usuario con el mismo correo y url
            // original
            urlsRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot child : snapshot.getChildren()) {
                        String dbUrl = child.child("originalUrl").getValue(String.class);
                        String dbCorreo = child.child("correoUsuario").getValue(String.class);

                        if (originalUrl.equals(dbUrl) && correo.equals(dbCorreo)) {
                            resultadoUrl[0] = child.getKey();
                            break;
                        }
                    }
                    latch.countDown();
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    latch.countDown();
                }
            });

            latch.await();

            // Se mira si la url que se va a acortar ya existe en la bbdd con un mismo id y
            // en caso de serlo nos devuelve la url acortada existente para poderla copiar
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls").child(shortId);

            if (resultadoUrl[0] != null) {
                System.out.println("URL ya existente con ID: " + resultadoUrl[0]);
                String existingShortUrl = "https://juanramon245.github.io/AcortadorURLOnline/#/" + resultadoUrl[0];
                return ResponseEntity.ok(existingShortUrl);
            }

            // Se crea una url acortada nueva en caso de no existir en la bbdd y luego se
            // envia al front para poderse copiar
            Map<String, Object> data = new HashMap<>();
            data.put("originalUrl", originalUrl);
            data.put("correoUsuario", correo);
            data.put("usos", usos);

            ref.setValueAsync(data);

            String shortUrl = "https://juanramon245.github.io/AcortadorURLOnline/#/" + shortId;
            return ResponseEntity.ok(shortUrl);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al acortar URL");
        }
    }

    // Método de redireción, se encarga que cuando se introduzca una url parecida a
    // la del 'get mapping', recoge el token y busca una url con ese ID, para
    // redirigir a la url guardada en el atributo 'urlOriginal' y a su vez restarle
    // un uso, en el caso de que no haya más usos pues eliminarla y también si no
    // existe la url acortada en la base redirigir a la página de
    // url-redireccion-incorrecta.
    @GetMapping("/r/{shortId}")
    public void redirigir(@PathVariable String shortId, HttpServletResponse response) throws IOException {
        // Se busca en la bbdd un url que tenga el ID igual al token de la redirección
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls").child(shortId);

        final CompletableFuture<Map<String, Object>> future = new CompletableFuture<>();

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    // Se recoge la url original para poder redirigir y el número de usos para poder
                    // restarle uno en caso de usarse esta redirección
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

        // En el caso de que la url acortada se quede con usos de 0 o menor se procede a
        // borrar de la bbdd
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
                response.sendRedirect(
                        "https://juanramon245.github.io/AcortadorURLOnline/#/pagina-redireccion-incorrecta?origen=backend");
            }
        } catch (Exception e) {
            if (e.getMessage().contains("usos disponibles")) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Esta URL ya no tiene usos disponibles");
            } else {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al redirigir");
            }
        }
    }

    // Método para registar usuarios en la bbdd, primero se mira si ya
    // existe el usuario con ese correo en la bbdd en los usuarios y luego en
    // pendientes, en el caso de no existir se crea un usuario en pendientes y se
    // envia un correo electrónico a ese gmail para verificar que existe y crear la
    // cuenta.
    @PostMapping("/registrarUsuario")
    public DeferredResult<ResponseEntity<String>> registrarUsuario(@RequestBody Map<String, String> datos,
            HttpSession session) {
        DeferredResult<ResponseEntity<String>> resultado = new DeferredResult<>();

        try {
            String nombre = datos.get("nombre");
            String correo = datos.get("correo");
            String contrasena = datos.get("contrasena");

            // Se busca un usuario que no exista en la bbdd que coincida con su correo
            String correoNormalizado = correo.replace(".", "_");
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("usuarios").child(correoNormalizado);
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    if (snapshot.exists()) {
                        resultado.setResult(ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Ya existe un usuario con ese correo."));
                    } else {
                        // Se busca un usuario pendiente en la bbdd que concida con su correo
                        DatabaseReference ref2 = FirebaseDatabase.getInstance().getReference("pendientes")
                                .child(correoNormalizado);
                        ref2.addListenerForSingleValueEvent(new ValueEventListener() {
                            @Override
                            public void onDataChange(DataSnapshot snapshot) {
                                if (snapshot.exists()) {
                                    resultado.setResult(ResponseEntity.status(HttpStatus.CONFLICT)
                                            .body("Ya se esta verificando un usario con este correo."));
                                } else {
                                    // En el caso de que haya un usuario que no cumpla las 2 condiciones anteriores
                                    // se creará un usuario pendiente con los datos del registro y se mandará un
                                    // correo para verificar la cuenta
                                    String token = UUID.randomUUID().toString();

                                    Map<String, Object> data = new HashMap<>();
                                    data.put("nombre", nombre);
                                    data.put("correo", correo);
                                    data.put("contrasena", contrasena);
                                    data.put("token", token);

                                    ref2.setValueAsync(data);
                                    emailService.enviarCorreoVerificacion(correo, token);

                                    resultado.setResult(
                                            ResponseEntity.ok("Verifica tu correo antes de completar el registro."));
                                }
                            }

                            @Override
                            public void onCancelled(DatabaseError error) {
                                resultado.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Error en Firebase: " + error.getMessage()));
                            }
                        });

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

    // Método para crear un usuario con los datos de un pendiente una vez que se
    // haya verificado por correo, primero se crea el usuario y luego se elimina el
    // pendiente con los mismos datos.
    @GetMapping("/verificarUsuario")
    public DeferredResult<ResponseEntity<String>> verificarUsuario(@RequestParam String token) {
        DeferredResult<ResponseEntity<String>> resultado = new DeferredResult<>();

        // Se buscan en la bbdd todos los usuarios de la clase pendiente hasta
        // que se encuentre uno que coincida con el token de la solicitud
        DatabaseReference pendientesRef = FirebaseDatabase.getInstance().getReference("pendientes");

        pendientesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot userSnap : snapshot.getChildren()) {
                    String tokenGuardado = userSnap.child("token").getValue(String.class);
                    if (token.equals(tokenGuardado)) {
                        String correo = userSnap.child("correo").getValue(String.class);
                        String nombre = userSnap.child("nombre").getValue(String.class);
                        String contrasena = userSnap.child("contrasena").getValue(String.class);

                        String correoNormalizado = correo.replace(".", "_");

                        // En el caso de encontrar uno que sí coincida, se procederá a crear un usuario
                        // con los datos proporcionados previamente y después borrar el usuario que está
                        // en pendientes conn el mismo correo
                        DatabaseReference usuariosRef = FirebaseDatabase.getInstance().getReference("usuarios")
                                .child(correoNormalizado);
                        Map<String, Object> usuario = new HashMap<>();
                        usuario.put("nombre", nombre);
                        usuario.put("correo", correo);
                        usuario.put("contrasena", contrasena);
                        usuario.put("verificado", true);

                        usuariosRef.setValueAsync(usuario);

                        userSnap.getRef().removeValueAsync();

                        resultado.setResult(ResponseEntity.ok("Cuenta verificada correctamente"));
                        return;
                    }
                }

                resultado.setResult(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Token inválido o ya usado"));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                resultado.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error en Firebase: " + error.getMessage()));
            }
        });

        return resultado;
    }

    // Método para iniciar sesión en la web usando el correo electrónico y la
    // contraseña, buscando en la bbdd en los usuarios uno que coincida con los
    // datos, en caso de hacerlo se logueará y guardará los datos del usuario en
    // la sesión para enviarlos del back al front cuando sea necesario y poderlos
    // usar.
    @PostMapping("/accederUsuario")
    public DeferredResult<ResponseEntity<String>> iniciarSesion(@RequestBody Map<String, String> datos,
            HttpSession session) {
        DeferredResult<ResponseEntity<String>> resultado = new DeferredResult<>();

        String correo = datos.get("correo");
        String contrasena = datos.get("contrasena");

        // Se mira si la contraseña y el correo están vacios
        if (correo == null || contrasena == null) {
            resultado.setResult(ResponseEntity.badRequest().body("Correo o contraseña faltan"));
            return resultado;
        }

        String correoNormalizado = correo.replace(".", "_");

        // Se busca si hay algún usuario que coincida el correo electrónico con la bbdd
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("usuarios").child(correoNormalizado);

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (!snapshot.exists()) {
                    resultado.setResult(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado"));
                    return;
                }

                // En caso de existir un usuario en la bbdd, y que coincida su contraseña con el
                // de la bbdd y luego se accede en caso de coincidir y se guarda en la sesión
                // sus datos importantes
                String contrasenaGuardada = snapshot.child("contrasena").getValue(String.class);
                String nombre = snapshot.child("nombre").getValue(String.class);

                if (contrasena.equals(contrasenaGuardada)) {
                    session.setAttribute("usuarioNombreLogueado", nombre);
                    session.setAttribute("usuarioCorreoLogueado", correo);
                    session.setAttribute("usuarioContrasenaLogueado", contrasena);
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

    // Método para cerrar sesión en el front y en el back borrando todos los datos
    // del usuario que estuviera.
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Sesión cerrada");
    }

    // Método para cargar todas las urls acortadas por el usuario que esta en la
    // sesión, sus datos y todo, no tiene nigún orden.
    @GetMapping("/urls-usuario")
    public ResponseEntity<List<Map<String, Object>>> obtenerUrlsDelUsuario(HttpSession session) {
        Object correoObj = session.getAttribute("usuarioCorreoLogueado");

        // Se busca si hay algún usuario en la sesión
        if (correoObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String correoUsuario = correoObj.toString();

        // Se buscan las urls que contengan el correo del usuario de la sesión en
        // coincidencia y cargar los en el front en cards con sus datos
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

    // Método para la url acortada variar su número de usos por los nuevos que se
    // han introducido en el front.
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

    // Método para eliminar al url acortada que en el front se ha seleccionado.
    @DeleteMapping("/eliminar/{shortId}")
    public ResponseEntity<String> eliminarUrl(@PathVariable String shortId) {
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("urls").child(shortId);
        ref.removeValueAsync();
        return ResponseEntity.ok("URL eliminada correctamente");
    }

    // Método para cargar todos los datos del usuario del back al front.
    @GetMapping("/usuario/datos")
    public ResponseEntity<Map<String, String>> obtenerDatosUsuario(HttpSession session) {
        // Se recoge los datos de la sesión del usuario del back
        String nombre = (String) session.getAttribute("usuarioNombreLogueado");
        String correo = (String) session.getAttribute("usuarioCorreoLogueado");
        String contrasena = (String) session.getAttribute("usuarioContrasenaLogueado");

        if (nombre == null || correo == null || contrasena == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        // Se mandan al front
        Map<String, String> datos = new HashMap<>();
        datos.put("nombre", nombre);
        datos.put("correo", correo);
        datos.put("contrasena", contrasena);
        return ResponseEntity.ok(datos);
    }

    // Método para actualizar los datos del usuario que esta en la sesión, cambiando
    // todo lo que han introducido nuevo excepto el correo.
    @PutMapping("/usuario/actualizar")
    public void actualizarDatosUsuario(
            @RequestBody Map<String, String> nuevosDatos,
            HttpServletResponse response,
            HttpSession session) throws IOException {

        // Recoge los datos enviados del front
        String nombre = nuevosDatos.get("nombre");
        String correo = nuevosDatos.get("correo");
        String contrasena = nuevosDatos.get("contrasena");

        if (nombre == null || correo == null || contrasena == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Algún campo está vacío");
            return;
        }

        // Se busca un usuario que coincida el correo con la bbdd para ponerle los
        // nuevos datos introducidos por le usuario
        String correoCodificado = correo.replace(".", "_");
        DatabaseReference ref = FirebaseDatabase.getInstance()
                .getReference("usuarios")
                .child(correoCodificado);

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    Map<String, Object> actualizaciones = new HashMap<>();
                    actualizaciones.put("nombre", nombre);
                    actualizaciones.put("contrasena", contrasena);
                    ref.updateChildrenAsync(actualizaciones);

                    session.setAttribute("usuarioNombreLogueado", nombre);
                    session.setAttribute("usuarioCorreoLogueado", correo);
                    session.setAttribute("usuarioContrasenaLogueado", contrasena);

                    try {
                        response.setStatus(HttpServletResponse.SC_OK);
                        response.getWriter().write("Datos actualizados correctamente");
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }

                } else {
                    try {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        response.getWriter().write("Usuario no encontrado");
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                try {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.getWriter().write("Error al acceder a Firebase");
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }

    // Método para enviar un correo para cambiar la contraseña del usuario que la ha
    // solicitado con el correo, primero se mira si el correo no esta vacio, después
    // si existe en la bbdd y por último se envia un correo y genera una
    // recuperación con un token para estar asociados ambos y que nadie externo
    // pueda cambiar la contraseña.
    @PostMapping("/enviarCorreoRecuperacion")
    public DeferredResult<ResponseEntity<String>> enviarCorreoRecuperacion(@RequestBody Map<String, String> datos) {
        DeferredResult<ResponseEntity<String>> resultado = new DeferredResult<>();
        String correo = datos.get("correo");

        // Se mira si hay un correo del usuario introducido
        if (correo == null || correo.isBlank()) {
            resultado.setResult(ResponseEntity.badRequest().body("Correo no proporcionado"));
            return resultado;
        }

        // Se busca si el usuario existe en la bbdd
        String correoNormalizado = correo.replace(".", "_");
        DatabaseReference usuariosRef = FirebaseDatabase.getInstance().getReference("usuarios")
                .child(correoNormalizado);

        usuariosRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    // En caso de coincidir lo anterior se genera una recuperación en la bbdd y
                    // después se envia un correo electrónico de recuperación de contraseña al
                    // gmail introducido para cambiar la contraseña
                    String token = UUID.randomUUID().toString();

                    Map<String, Object> datosRecuperacion = new HashMap<>();
                    datosRecuperacion.put("correo", correo);
                    datosRecuperacion.put("token", token);

                    DatabaseReference recuperacionRef = FirebaseDatabase.getInstance().getReference("recuperaciones")
                            .child(correoNormalizado);
                    recuperacionRef.setValueAsync(datosRecuperacion);

                    emailService.enviarCorreoRecuperacion(correo, token);
                    resultado.setResult(ResponseEntity.ok("Correo de recuperación enviado"));
                } else {
                    resultado.setResult(ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró ese correo"));
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                resultado.setResult(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error Firebase: " + error.getMessage()));
            }
        });

        return resultado;
    }

    // Metodo para cambiar la contraseña del usuario que ha recibido el correo por
    // la nueva introducida en el front, se compara si el token que hay existe en la
    // bbdd para recoger el correo del solicitante y a partir de ahi se modifica la
    // contraseña usando un correo que coincida.
    @PutMapping("/usuario/restablecerContrasena")
    public void restablecerContrasena(
            @RequestBody Map<String, String> datos,
            HttpServletResponse response) throws IOException {

        // Se mira si el usuario tiene el token de restablecimiento y la contraseña
        // introducida
        String token = datos.get("token");
        String nuevaContrasena = datos.get("contrasena");

        if (token == null || nuevaContrasena == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Token o contraseña faltantes");
            return;
        }

        // Se busca si en las recuperaciones d econtraseña de la bbdd existe una que
        // coincida el token, en cuyo caso la contraseña se cambiará por la nueva
        DatabaseReference recuperacionesRef = FirebaseDatabase.getInstance().getReference("recuperaciones");

        recuperacionesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot userSnap : snapshot.getChildren()) {
                    String tokenGuardado = userSnap.child("token").getValue(String.class);
                    if (token.equals(tokenGuardado)) {
                        String correo = userSnap.child("correo").getValue(String.class);
                        String correoCodificado = correo.replace(".", "_");

                        DatabaseReference usuarioRef = FirebaseDatabase.getInstance().getReference("usuarios")
                                .child(correoCodificado);
                        Map<String, Object> actualizacion = new HashMap<>();
                        actualizacion.put("contrasena", nuevaContrasena);
                        usuarioRef.updateChildrenAsync(actualizacion);

                        userSnap.getRef().removeValueAsync();

                        try {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.getWriter().write("Contraseña actualizada correctamente");
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                        return;
                    }
                }

                try {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("Token no válido o expirado");
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                try {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.getWriter().write("Error al acceder a Firebase");
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }
}

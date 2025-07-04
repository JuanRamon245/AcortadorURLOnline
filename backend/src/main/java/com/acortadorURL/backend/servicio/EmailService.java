package com.acortadorURL.backend.servicio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

//Servicios para enviar gmails a los usuarios
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Correo para verificar la cuenta de un usuario
    public void enviarCorreoVerificacion(String destinatario, String token) {
        String asunto = "Verifica tu cuenta";
        String enlace = "https://acortadorurlonline-frontend.onrender.com/verificar?token=" + token;
        String cuerpo = "Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta: " + enlace;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject(asunto);
        mensaje.setText(cuerpo);

        mailSender.send(mensaje);
    }

    // Correo para cambiar la cuenta de un usuario
    public void enviarCorreoRecuperacion(String destinatario, String token) {
        String asunto = "Recuperación de contraseña";
        String enlace = "https://acortadorurlonline-frontend.onrender.com/restablecer-contrasena?token=" + token;
        String cuerpo = "Haz clic en el siguiente enlace para restablecer tu contraseña: " + enlace;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject(asunto);
        mensaje.setText(cuerpo);

        mailSender.send(mensaje);
    }
}

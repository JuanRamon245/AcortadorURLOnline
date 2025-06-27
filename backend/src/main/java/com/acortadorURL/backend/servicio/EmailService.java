package com.acortadorURL.backend.servicio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarCorreoVerificacion(String destinatario, String token) {
        String asunto = "Verifica tu cuenta";
        String enlace = "http://localhost:4200/verificar?token=" + token;
        String cuerpo = "Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta: " + enlace;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject(asunto);
        mensaje.setText(cuerpo);

        mailSender.send(mensaje);
    }
}

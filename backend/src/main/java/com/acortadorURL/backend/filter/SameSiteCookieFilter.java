package com.acortadorURL.backend.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SameSiteCookieFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        chain.doFilter(request, response);

        if (response instanceof HttpServletResponse) {
            HttpServletResponse res = (HttpServletResponse) response;
            for (String header : res.getHeaders("Set-Cookie")) {
                if (header.startsWith("JSESSIONID")) {
                    res.setHeader("Set-Cookie", header + "; SameSite=None; Secure");
                }
            }
        }
    }
}
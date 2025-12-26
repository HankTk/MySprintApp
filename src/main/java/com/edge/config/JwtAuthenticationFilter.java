package com.edge.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter
{

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip JWT validation for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()))
        {
            filterChain.doFilter(request, response);
            return;
        }
        
        try
        {
            String jwt = getJwtFromRequest(request);

            if (jwt != null)
            {
                try
                {
                    // Try to extract username and validate token
                    String userid = tokenProvider.getUsernameFromToken(jwt);
                    if (tokenProvider.validateToken(jwt, userid))
                    {
                        String role = tokenProvider.getRoleFromToken(jwt);

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userid,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
                catch (ExpiredJwtException ex)
                {
                    // Expired tokens are normal - just continue without authentication
                    // No need to log as this is expected behavior
                }
                catch (JwtException ex)
                {
                    // Other JWT exceptions (malformed, invalid signature, etc.) - log at debug level
                    logger.debug("Invalid JWT token", ex);
                }
                catch (Exception ex)
                {
                    // Unexpected errors - log at warn level
                    logger.warn("Unexpected error processing JWT token", ex);
                }
            }
        }
        catch (Exception ex)
        {
            // Catch any other unexpected errors
            logger.warn("Error processing JWT authentication", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request)
 {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer "))
        {
            return bearerToken.substring(7);
        }
        return null;
    }
}

# Actualizaciones necesarias en el backend

## 1. Modificar AuthService.java

El método `signUp` necesita recibir el rol del usuario:

```java
public Mono<Map<String, Object>> signUp(String name, String email, String password, String photoUrl, Integer userRole) {
    // ... código existente ...
    
    // Prepare DB Insertion Payload (Using HashMap for null support)
    Map<String, Object> newUser = new HashMap<>();
    newUser.put("supabaseuserid", supabaseUserId);
    newUser.put("name", name);
    newUser.put("photourl", photoUrl);
    newUser.put("iduserstatus", 1);
    newUser.put("idusertype", userRole); // Usar el rol recibido
    newUser.put("idorganization", null); 
    
    // ... resto del código ...
}
```

## 2. Modificar AuthController.java

El endpoint de signup necesita recibir el rol:

```java
@PostMapping("/signup")
public Mono<ResponseEntity<Map<String, Object>>> signup(@RequestBody Map<String, Object> body) {
    String name = (String) body.get("name");
    String email = (String) body.get("email");
    String password = (String) body.get("password");
    String photoUrl = (String) body.get("photoUrl");
    Integer userRole = (Integer) body.get("userRole"); // Nuevo campo

    return authService.signUp(name, email, password, photoUrl, userRole)
            .map(result -> ResponseEntity.ok(result))
            .onErrorResume(e -> Mono.just(ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()))));
}
```

## 3. Agregar validación de roles

Crear un enum para los roles:

```java
public enum UserRoleEnum {
    ADMIN(1),
    EXTERNAL(2);

    private final Integer id;

    UserRoleEnum(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }
}
```

## 4. Actualizar DtoUser.java

Agregar el campo email si no existe:

```java
@Column(name = "email")
private String email;

public String getEmail() {
    return email;
}

public void setEmail(String email) {
    this.email = email;
}
```

## 5. Endpoints adicionales necesarios

- `GET /users/me` - Obtener información del usuario actual
- `PUT /users/{id}/role` - Actualizar rol del usuario (solo admin)
- `GET /users/by-role/{role}` - Obtener usuarios por rol

## 6. Configuración de CORS

Asegurar que el backend permita requests desde el frontend:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

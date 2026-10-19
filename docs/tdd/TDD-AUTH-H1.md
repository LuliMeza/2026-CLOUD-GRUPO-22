# TDD-AUTH-H1: Autenticación de usuarios con correo institucional

Estado: Aprobado
Autor: Equipo 2026 Cloud Grupo 22 (Tiago Solís, Lucía Meza, César Huari)
Fecha: 2026-10-18

---

## 1. Contexto de Negocio (el "Qué")

### 1.1. Objetivo

Permitir que alumnos y autoridades de la facultad accedan al sistema validando su pertenencia real a la
UTN FRLP, sin depender de un SSO institucional directo (descartado debido a que la facultad utiliza
Microsoft 365 sin soporte ni autorización de tenant para aplicaciones de terceros, según lo relevado en
el Spike 2 de Trello).

### 1.2. User Personas

- **Alumno**: estudiante regular de la facultad. Se autoregistra en la plataforma utilizando su correo
  institucional `@alu.frlp.utn.edu.ar` y verifica su titularidad mediante un código OTP recibido en su
  bandeja de entrada.
- **Jefe Departamental**: autoridad o directivo de cátedra/departamento. Su cuenta es creada o invitada
  directamente por un Administrador, ya que su rol y pertenencia no pueden inferirse de forma automática
  únicamente por el dominio de correo.
- **Administrador**: responsable técnico y operativo de la plataforma. Gestiona la provisión y el alta de
  usuarios con roles jerárquicos o no-alumnos (Jefe Departamental u otros Administradores).

### 1.3. Criterios de Aceptación (User Stories)

#### HU-01: Registro con validación de dominio institucional y activación por OTP

- **Como** alumno de la UTN FRLP,  
  **quiero** registrarme con mi correo institucional y validarlo mediante un código de un solo uso (OTP),  
  **para** acceder a las funcionalidades de la plataforma con una identidad verificada.

  - **Escenario 1 (Registro exitoso de alumno con OTP):**  
    *Given* un alumno con dirección de correo institucional `@alu.frlp.utn.edu.ar` no registrada previamente,  
    *When* envía su correo y contraseña para solicitar el registro,  
    *Then* el sistema crea la cuenta en estado no verificado y envía un código OTP de 6 dígitos a su casilla.

  - **Escenario 2 (Activación de cuenta mediante OTP):**  
    *Given* un usuario registrado en estado no verificado con un código OTP vigente,  
    *When* envía el código OTP correcto antes de su vencimiento (15 minutos),  
    *Then* el sistema marca su correo como verificado y habilita la cuenta para iniciar sesión.

  - **Escenario 3 (Rechazo por dominio no institucional o no estudiantil):**  
    *Given* un usuario que intenta autoregistrarse con un dominio externo (ej. `@gmail.com`) o un dominio docente/institucional no estudiantil en el flujo público,  
    *When* envía la solicitud de registro,  
    *Then* el sistema rechaza la solicitud con HTTP 400 informando que el autoregistro solo admite correos `@alu.frlp.utn.edu.ar`.

  - **Escenario 4 (Intento de login con cuenta no verificada):**  
    *Given* un usuario con credenciales correctas cuyo correo aún no fue verificado mediante OTP,  
    *When* intenta iniciar sesión,  
    *Then* el sistema deniega el acceso con HTTP 403 informando que debe validar su correo antes de ingresar.

#### HU-02: Recuperación de contraseña con OTP institucional

- **Como** usuario del sistema,  
  **quiero** recuperar el acceso a mi cuenta mediante un código OTP enviado a mi correo institucional,  
  **para** restablecer mi contraseña en caso de olvido sin comprometer la seguridad.

  - **Escenario 1 (Solicitud de recuperación de contraseña):**  
    *Given* un usuario registrado y con correo verificado,  
    *When* solicita la recuperación indicando su correo institucional,  
    *Then* el sistema genera un código OTP de recuperación y lo envía a su casilla.

  - **Escenario 2 (Restablecimiento exitoso con OTP):**  
    *Given* un usuario con una solicitud de recuperación activa y un OTP vigente,  
    *When* envía el código OTP correcto junto con una nueva contraseña,  
    *Then* el sistema actualiza el hash de la contraseña, invalida el OTP y confirma el cambio con HTTP 200.

  - **Escenario 3 (OTP de recuperación expirado o inválido):**  
    *Given* un usuario en flujo de recuperación,  
    *When* envía un código OTP incorrecto o cuyo plazo de 15 minutos ha vencido,  
    *Then* el sistema rechaza la operación con HTTP 400.

  - **Escenario 4 (Solicitud con correo no registrado — prevención de enumeración):**  
    *Given* una solicitud de recuperación para un correo inexistente en el sistema,  
    *When* se envía la petición,  
    *Then* el sistema responde con HTTP 200 genérico sin enviar ningún correo, evitando revelar si la cuenta existe.

### 1.4. Qué no vamos a hacer en esta fase

- **SSO con Azure AD / Microsoft 365**: descartado por falta de habilitación de aplicaciones multi-tenant en el tenant oficial de la facultad.
- **Magic links por correo**: descartado deliberadamente debido a los filtros de protección corporativa de Microsoft 365 (Safe Links / Defender), que inspeccionan y pre-fetchean las URLs entrantes consumiendo e invalidando los tokens de un solo uso antes de que el usuario haga clic.
- **Autoregistro para roles jerárquicos**: los roles `JEFE_DEPARTAMENTO` y `ADMINISTRADOR` no cuentan con autoregistro público; su aprovisionamiento requiere intervención de un Administrador.
- **Gestión de perfiles avanzados o avatares**: no forma parte del alcance de este hito de autenticación base.

---

## 2. Diseño Técnico (el "Cómo")

### 2.1. Modelo de Dominio (Entidad)

Entidad de dominio acotada estrictamente a los requerimientos de identidad, credenciales y ciclo de vida del OTP:

```typescript
enum RolUsuario {
  ALUMNO = "ALUMNO",
  JEFE_DEPARTAMENTO = "JEFE_DEPARTAMENTO",
  ADMINISTRADOR = "ADMINISTRADOR"
}

entity User {
  id: string
  email: string
  passwordHash: string
  rol: RolUsuario
  emailVerificado: boolean
  otpCodeHash: string | null
  otpExpiresAt: Date | null
  otpAttempts: number
  createdAt: Date
  updatedAt: Date
}
```

### 2.2. Contrato de API

> **Nota sobre prefijo de ruta**: Los endpoints se listan a continuación con ruta base `/auth/*`. El prefijo global (ej. `/api` o `/api/v1`) queda formalmente **pendiente** hasta que se defina la convención transversal de ruteo del backend (conforme a [TDD-STACK-H1](file:///c:/Users/tiagu/orca/2026-CLOUD-GRUPO-22/docs/tdd/TDD-STACK-H1.md)).

#### `POST /auth/register`
Registro inicial para alumnos.
- **Body:**
  ```json
  {
    "email": "lucas.gonzalez@alu.frlp.utn.edu.ar",
    "password": "PasswordSeguro123!"
  }
  ```
- **Respuesta 201 Created:**
  ```json
  {
    "message": "Usuario registrado exitosamente. Se ha enviado un código de verificación a su correo.",
    "email": "lucas.gonzalez@alu.frlp.utn.edu.ar"
  }
  ```

#### `POST /auth/verify-otp`
Confirmación del código OTP para habilitar la cuenta tras el registro.
- **Body:**
  ```json
  {
    "email": "lucas.gonzalez@alu.frlp.utn.edu.ar",
    "otp": "482915"
  }
  ```
- **Respuesta 200 OK:**
  ```json
  {
    "message": "Correo electrónico verificado exitosamente. La cuenta ha sido activada."
  }
  ```

#### `POST /auth/login`
Autenticación con credenciales para obtener token de sesión.
- **Body:**
  ```json
  {
    "email": "lucas.gonzalez@alu.frlp.utn.edu.ar",
    "password": "PasswordSeguro123!"
  }
  ```
- **Respuesta 200 OK:**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "lucas.gonzalez@alu.frlp.utn.edu.ar",
      "rol": "ALUMNO"
    }
  }
  ```

#### `POST /auth/forgot-password`
Solicitud de código OTP para restablecimiento de contraseña.
- **Body:**
  ```json
  {
    "email": "lucas.gonzalez@alu.frlp.utn.edu.ar"
  }
  ```
- **Respuesta 200 OK:**
  ```json
  {
    "message": "Si la casilla ingresada corresponde a un usuario registrado, se ha enviado un código de recuperación."
  }
  ```

#### `POST /auth/reset-password`
Aplicación de nueva contraseña validando el OTP recibido.
- **Body:**
  ```json
  {
    "email": "lucas.gonzalez@alu.frlp.utn.edu.ar",
    "otp": "482915",
    "newPassword": "NuevaPasswordSegura456!"
  }
  ```
- **Respuesta 200 OK:**
  ```json
  {
    "message": "La contraseña ha sido restablecida correctamente."
  }
  ```

#### `POST /auth/invite`
Creación e invitación de usuarios no-alumnos (restringido a rol `ADMINISTRADOR`).
- **Headers:** `Authorization: Bearer <token_admin>`
- **Body:**
  ```json
  {
    "email": "director.sistemas@frlp.utn.edu.ar",
    "rol": "JEFE_DEPARTAMENTO"
  }
  ```
- **Respuesta 201 Created:**
  ```json
  {
    "message": "Invitación enviada exitosamente con credenciales temporales / enlace de activación.",
    "email": "director.sistemas@frlp.utn.edu.ar",
    "rol": "JEFE_DEPARTAMENTO"
  }
  ```

### 2.3. Esquema de Persistencia

Representación en pseudocódigo de la tabla relacional bajo PostgreSQL (administrada a través de Prisma ORM según [TDD-STACK-H1](file:///c:/Users/tiagu/orca/2026-CLOUD-GRUPO-22/docs/tdd/TDD-STACK-H1.md)):

```
Table users {
  id              varchar(36)   [pk, default: uuid_generate_v4()]
  email           varchar(255)  [unique, not null]
  password_hash   varchar(255)  [not null]
  rol             varchar(30)   [not null] -- 'ALUMNO', 'JEFE_DEPARTAMENTO', 'ADMINISTRADOR'
  email_verificado boolean      [not null, default: false]
  otp_code_hash   varchar(255)  [null]
  otp_expires_at  timestamp     [null]
  otp_attempts    integer       [not null, default: 0]
  created_at      timestamp     [not null, default: now()]
  updated_at      timestamp     [not null, default: now()]

  indexes {
    email [name: "idx_users_email"]
  }
}
```

**Por qué elegimos este camino y no otro**:
1. **Contraseña + OTP en lugar de SSO institucional**: la UTN FRLP gestiona sus identidades en Microsoft 365, pero no brinda soporte ni autoriza el registro de aplicaciones en su Azure AD tenant.
2. **Email OTP en lugar de Magic Link**: los sistemas de correo basados en Microsoft 365 con Defender / Safe Links analizan de forma proactiva cada hipervínculo que entra a la casilla antes de entregarlo al usuario. Dicha pre-inspección HTTP consume el enlace de un solo uso, quemándolo y provocando que el usuario final reciba un error de token expirado o inválido. Un código numérico OTP dentro del cuerpo del mensaje es inmune a la pre-lectura de hipervínculos.
3. **Hash del código OTP**: al igual que las contraseñas, el código OTP se almacena hasheado (`otp_code_hash`) para que una eventual filtración o volcado de base de datos no exponga códigos de acceso inmediatos.

---

## 3. Arquitectura y Flujo

### 3.1. Definición del Puerto (Repository Interface)

Contrato abstracto que el caso de uso requiere de la capa de persistencia:

```typescript
export interface UserRepository {
  create(data: {
    email: string;
    passwordHash: string;
    rol: RolUsuario;
    emailVerificado: boolean;
    otpCodeHash?: string;
    otpExpiresAt?: Date;
  }): Promise<User>;

  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;

  updateOtp(
    id: string,
    data: {
      otpCodeHash: string | null;
      otpExpiresAt: Date | null;
      otpAttempts: number;
    }
  ): Promise<void>;

  markEmailAsVerified(id: string): Promise<void>;

  updatePasswordHash(id: string, newPasswordHash: string): Promise<void>;
}
```

- **Consumidores**:
  - `AuthService` en el backend NestJS (orquesta la lógica de registro, validación OTP, hashing con bcrypt/argon2 y emisión de JWT).
  - Controladores HTTP NestJS (`AuthController`).

### 3.2. Lógica del Caso de Uso

#### Flujo principal: Autoregistro y activación de Alumno (Paso a Paso)

Ejemplo con datos concretos: Alumno con correo `lucas.gonzalez@alu.frlp.utn.edu.ar`.

1. **Recepción de la petición**: El backend recibe `POST /auth/register` con `email` y `password`.
2. **Validación de formato y pertenencia institucional**:
   - Se valida sintaxis de email y fortaleza de contraseña.
   - Se comprueba la regla de dominio: debe terminar estrictamente en `@alu.frlp.utn.edu.ar`.
3. **Verificación de no duplicidad**: Se invoca `userRepository.findByEmail(...)`. Si ya existe una cuenta asociada, se rechaza la operación con HTTP 409 Conflict.
4. **Hashing y generación de OTP**:
   - Se genera el hash seguro de la contraseña.
   - Se genera un código OTP numérico criptográficamente seguro de 6 dígitos (ej. `482915`).
   - Se calcula su vigencia (15 minutos: `now() + 15 min`).
   - Se genera el hash del código OTP.
5. **Persistencia inicial**: Se crea el registro en la base de datos vía `userRepository.create(...)` con `emailVerificado = false`, `rol = 'ALUMNO'`, y los campos OTP asociados.
6. **Disparo de notificación (Email OTP vía Neon Auth)**:
   - Se envía el correo con el código `482915` al buzón del alumno utilizando la capacidad transaccional de Neon Auth (sin requerir SMTP propio).
7. **Verificación posterior**:
   - El alumno consulta su correo e ingresa el código en el cliente web.
   - El cliente envía `POST /auth/verify-otp` con su correo y el código `482915`.
   - El backend recupera el usuario, valida que `otp_expires_at > now()`, comprueba que `otp_attempts < 5`, y valida el hash del código.
   - Si coincide, invoca `userRepository.markEmailAsVerified(id)`, resetea los campos OTP y responde HTTP 200 OK.
   - A partir de este momento, el usuario queda habilitado para iniciar sesión mediante `POST /auth/login`.

#### Flujo secundario: Provisión de cuentas no-alumno (Jefe Departamental / Administrador)

1. El Administrador autenticado envía `POST /auth/invite` con el correo institucional (ej. `director.sistemas@frlp.utn.edu.ar`) y rol `JEFE_DEPARTAMENTO`.
2. El backend verifica la autorización del emisor (debe poseer rol `ADMINISTRADOR`).
3. Se crea el usuario en base de datos con contraseña provisoria / token de establecimiento y se envía un correo de invitación para que configure sus credenciales de acceso iniciales.

**Por qué elegimos este camino y no otro**:
- **Invitación administrativa en vez de self-signup para roles jerárquicos**: No existe un mecanismo programático seguro para discernir si una dirección institucional pertenece a un docente, a un jefe de cátedra o a una autoridad sin consultar un padrón oficial de la facultad (al cual no se tiene acceso). Por tanto, la delegación en el Administrador garantiza la veracidad del rol asignado.
- **Email OTP con caducidad corta y límite de reintentos**: Protege la verificación frente a ataques de fuerza bruta sobre el espacio de búsqueda del código numérico de 6 dígitos.

---

## 4. Casos de Borde y Manejo de Errores

**Precondiciones**: Base de datos PostgreSQL disponible y servicio Neon Auth operativo para la entrega de correos salientes.

| Escenario de Error | Validación / Regla de Negocio | Código HTTP |
|---|---|---|
| Dominio no institucional en registro | El correo no finaliza en `@alu.frlp.utn.edu.ar` durante el self-signup público. | `400 Bad Request` |
| Correo ya registrado | La casilla ingresada ya posee una cuenta activa o en proceso de verificación. | `409 Conflict` |
| Credenciales inválidas en login | La combinación de email y contraseña no coincide con ningún registro. | `401 Unauthorized` |
| Intento de login con cuenta no verificada | El usuario tiene credenciales válidas pero `email_verificado == false`. | `403 Forbidden` |
| Código OTP inválido | El código provisto no coincide con el hash almacenado. Se incrementa `otp_attempts`. | `400 Bad Request` |
| Código OTP expirado | Se superaron los 15 minutos de ventana de validez (`now() > otp_expires_at`). | `400 Bad Request` |
| Exceso de reintentos de OTP | Se alcanzaron 5 intentos fallidos consecutivos (`otp_attempts >= 5`). Se invalida el OTP actual. | `429 Too Many Requests` |
| Solicitud de reset para email inexistente | Para evitar enumeración de usuarios, se devuelve éxito ficticio pero no se despacha correo. | `200 OK` |
| Intento de invitación sin permisos | Usuario no administrador intenta invocar el endpoint `POST /auth/invite`. | `403 Forbidden` |

---

## 5. Observaciones Adicionales

### Preguntas abiertas
- **Ampliación de roles futuros**: Si en fases posteriores se incorporan roles como moderadores externos o docentes auxiliares, se evaluará si se crean mediante invitación administrativa o mediante un formulario de postulación validado por un Jefe Departamental.
- **Políticas de Rate Limiting por IP**: Se evaluará implementar rate limiting a nivel de reverse proxy o middleware de NestJS (`@nestjs/throttler`) para mitigar spam sobre los endpoints de despacho de OTP (`/auth/register` y `/auth/forgot-password`).

### Detalles técnicos adicionales
- **Servicio de correo transaccional (Neon Auth)**: Se utiliza la infraestructura de Neon Auth para la emisión de los correos que portan los códigos OTP, evitando la necesidad de configurar, mantener y autenticar servidores SMTP propios o registrar cuentas de terceros adicionales.
- **Motor de permisos y autorización granular (CASL)**: Para este hito de autenticación, el control de acceso se basa en el atributo `rol` del usuario (`ALUMNO`, `JEFE_DEPARTAMENTO`, `ADMINISTRADOR`) y Guards de NestJS. Para los hitos posteriores donde se implementen recursos funcionales con permisos contextuales (ej. publicación, edición y moderación de comentarios en cátedras y comisiones), se adoptará la librería **CASL** (`@casl/ability`). Esto permitirá desacoplar los roles de las acciones y sujetos específicos (`can('update', 'Comentario', { authorId: user.id })`), manteniendo una arquitectura extensible y tipada.

# Animascotas System

Sistema de gestión integral para tienda de mascotas: control de inventario, ventas, vacunas, proveedores y respaldo de base de datos.

## Descripción

Animascotas es una aplicación fullstack desarrollada para automatizar la operación diaria de una tienda de mascotas, incluyendo:

- Gestión de inventario y productos
- Registro y control de ventas
- Pagos y seguimiento de vacunas
- Gestión de proveedores y facturas (con soporte de imágenes)
- Cálculo y seguimiento de utilidades
- Respaldo y restauración de la base de datos desde el panel administrativo

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3.5 (Java 21) |
| Frontend | React + Vite |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker / Docker Compose |
| Autenticación | JWT |

## Requisitos previos

- **Java 21** (JDK)
- **Node.js** (versión LTS recomendada) y npm
- **Docker Desktop**
- **PostgreSQL 16 — Command Line Tools** (`psql`, `pg_dump`) instaladas localmente, necesarias para la función de exportar/importar backups desde fuera de Docker.
  > ⚠️ La versión de las herramientas cliente (`psql`/`pg_dump`) debe coincidir con la versión mayor del servidor Postgres usado en Docker (actualmente `postgres:16-alpine`). Usar una versión distinta (ej. 17 o 18) genera dumps incompatibles y falla la restauración con errores como `unrecognized configuration parameter`.

## Estructura del proyecto

```
animascotas-system/
├── animascotas-backend/     # API REST en Spring Boot
├── animascotas-frontend/    # Aplicación en React + Vite
└── docker-compose.yml       # Orquestación de contenedores (DB, backend, frontend)
```

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd animascotas-system
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (o configura las variables según tu entorno) con al menos:

```env
DB_HOST=localhost
DB_PORT=5433
SPRING_DATASOURCE_PASSWORD=animascotas_pass
```

> En el entorno Docker, `DB_HOST` debe ser `db` (nombre del servicio en `docker-compose.yml`), lo que hace que el backend use automáticamente los binarios `pg_dump`/`psql` disponibles en el PATH del contenedor en lugar de las rutas locales de Windows.

### 3. Levantar la base de datos con Docker

```bash
docker compose up -d db
```

Esto inicia el contenedor `animascotas-db` (`postgres:16-alpine`) en el puerto `5433`.

### 4. Ejecutar el backend

```bash
cd animascotas-backend
./mvnw spring-boot:run
```

El backend queda disponible en `http://localhost:8080`.

### 5. Ejecutar el frontend

```bash
cd animascotas-frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

## Backup y restauración de base de datos

El sistema incluye un módulo de backup accesible desde el panel administrativo, respaldado por `BackupController`:

- **Exportar:** `GET /api/backup/exportar` — genera un `.sql` con `pg_dump --clean --if-exists` y lo descarga directamente.
- **Importar:** `POST /api/backup/importar` — recibe un archivo `.sql` y lo restaura con `psql --set ON_ERROR_STOP=on`.

### Notas importantes

- Los backups exportados con una versión de `pg_dump` son solo compatibles con `psql` de la **misma versión mayor o superior compatible** con el servidor de destino. No mezcles backups generados con distintas versiones mayores de PostgreSQL.
- En Windows, si no tienes las Command Line Tools de PostgreSQL 16 instaladas, descárgalas desde el [sitio oficial de EDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads), seleccionando únicamente el componente **Command Line Tools** durante la instalación (no es necesario instalar el servidor, pgAdmin ni Stack Builder).

## Despliegue en producción

El despliegue actual se realiza de forma offline mediante imágenes Docker pre-exportadas (`.tar`), transferidas por USB a un equipo Windows 11 all-in-one en sitio, evitando dependencia de conexión a internet durante la instalación.

Pasos generales:

1. Exportar las imágenes Docker necesarias: `docker save -o animascotas.tar <imagenes>`
2. Transferir el archivo `.tar` al equipo de destino vía USB.
3. Cargar las imágenes: `docker load -i animascotas.tar`
4. Levantar los contenedores con `docker compose up -d`.

## Solución de problemas comunes

| Problema | Causa probable | Solución |
|---|---|---|
| `ERROR: unrecognized configuration parameter "transaction_timeout"` al importar backup | Desajuste de versión entre `pg_dump`/`psql` local y el servidor Postgres del contenedor | Instalar Command Line Tools de la misma versión mayor que el contenedor (`postgres:16-alpine` → herramientas v16) |
| `IOException: Ha terminado la canalización` al importar | El proceso `psql` murió antes de terminar de leer el archivo (usualmente por error de conexión o versión) | Revisar el mensaje de error real devuelto en el body de la respuesta 500 |
| Backend no conecta a la base de datos | Contenedor `animascotas-db` no está corriendo, o puerto incorrecto | Verificar con `docker ps` y confirmar que el puerto expuesto coincide con `DB_PORT` |

## Licencia

Proyecto privado — uso interno para Animascotas.

# UniPulse Backend Setup Instructions

## Overview
The backend for Resources has been created with the following structure:

### Created Files
1. **Enums**: `ResourceType.java`, `ResourceStatus.java`
2. **Entity**: `Resource.java` (JPA entity for resources table)
3. **DTOs**: `ResourceRequest.java`, `ResourceResponse.java`, `ResourceStatusUpdateRequest.java`
4. **Repository**: `ResourceRepository.java` (Spring Data JPA)
5. **Service**: `ResourceService.java` (interface) + `ResourceServiceImpl.java` (implementation)
6. **Controller**: `ResourceController.java` (REST API endpoints)

### API Endpoints
The following REST endpoints are available at `http://localhost:8083/api/resources`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Get all resources |
| GET | `/api/resources/{id}` | Get resource by ID |
| POST | `/api/resources` | Create new resource |
| PUT | `/api/resources/{id}` | Update resource |
| DELETE | `/api/resources/{id}` | Delete resource |
| PATCH | `/api/resources/{id}/status` | Update resource status |
| GET | `/api/resources/type/{type}` | Get resources by type |
| GET | `/api/resources/status/{status}` | Get resources by status |
| GET | `/api/resources/search` | Search with filters |

### Resource Types
- `LECTURE_HALL`
- `LAB`
- `MEETING_ROOM`
- `EQUIPMENT`

### Resource Status
- `ACTIVE`
- `OUT_OF_SERVICE`

---

## Manual Setup Steps

### Step 1: Create application.properties

**You MUST manually create this file** (it's gitignored for security):

Create file: `backend/src/main/resources/application.properties`

Add this content:

```properties
# Application Name
spring.application.name=backend

# Server Port
server.port=8083

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/unipulse?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root1234
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Step 2: Create Database in MySQL Workbench

1. Open **MySQL Workbench**
2. Connect to your `local-mysql` connection (localhost, root/root1234)
3. Run this SQL command:

```sql
CREATE DATABASE IF NOT EXISTS unipulse;
```

Or use the provided script: `backend/database-setup.sql`

### Step 3: Build and Run the Backend

Open a terminal in the `backend` folder and run:

```bash
# Navigate to backend folder
cd /Users/avishkakanakasekara/Documents/UniPulse/UniPulse/backend

# Build the project
./mvnw clean package -DskipTests

# Run the application
./mvnw spring-boot:run
```

Or on Windows:
```cmd
cd /Users/avishkakanakasekara/Documents/UniPulse/UniPulse/backend
mvnw.cmd clean package -DskipTests
mvnw.cmd spring-boot:run
```

### Step 4: Verify the Backend

Once running, test the API:

```bash
# Get all resources
curl http://localhost:8083/api/resources

# Create a test resource
curl -X POST http://localhost:8083/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lecture Hall",
    "type": "LECTURE_HALL",
    "capacity": 100,
    "location": "Building 1, Floor 2",
    "description": "A test lecture hall",
    "availabilityWindows": "Mon-Fri 8AM-6PM",
    "status": "ACTIVE"
  }'
```

### Step 5: Run the Frontend

Your existing frontend should now connect to the backend at `http://localhost:8083/api`

Navigate to your frontend and test the resource pages:
- Add Resource Page
- Customer Facilities Page  
- Resource Details Page

---

## Troubleshooting

### Port Already in Use
If port 8083 is already in use, either:
1. Kill the process using it: `lsof -ti:8083 | xargs kill -9`
2. Or change the port in `application.properties`: `server.port=8084`

### MySQL Connection Issues
1. Verify MySQL is running: `brew services list` (macOS)
2. Check credentials in `application.properties`
3. Ensure database `unipulse` exists

### CORS Issues
The controller already has CORS configured for ports 5173-5175. If your frontend runs on a different port, update:
`@CrossOrigin(origins = {"http://localhost:5173", ...})`

### Build Errors
If Maven fails, try:
```bash
./mvnw clean install -U
```

---

## Database Schema

Hibernate will auto-create the `resources` table with this structure:

```sql
CREATE TABLE resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    availability_windows TEXT,
    status VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

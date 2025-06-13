# Docker Deployment Guide for Football Simulation Frontend

This guide provides comprehensive instructions for deploying the Football Simulation frontend application using Docker in both development and production environments.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0 or higher
- **Git** for cloning the repository
- **pnpm** (optional, for local development)

## 🚀 Quick Start

### Development Environment

1. **Clone the repository**

   ```powershell
   git clone <repository-url>
   cd Football-Simulation_frontend
   ```

2. **Set up environment variables**

   ```powershell
   Copy-Item .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development container**

   ```powershell
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Health check: http://localhost:3000/api/health

### Production Environment

1. **Set up production environment**

   ```powershell
   # Copy and configure production environment
   Copy-Item .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Start production containers**

   ```powershell
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000 (or behind Nginx on port 80)
   - Health check: http://localhost:3000/api/health

## 🏗️ Architecture Overview

### Multi-Stage Dockerfile

The `Dockerfile` uses a multi-stage build approach:

1. **Base Stage**: Common Node.js and pnpm setup
2. **Dependencies Stage**: Install npm dependencies
3. **Development Stage**: Hot reload development environment
4. **Builder Stage**: Production build compilation
5. **Production Stage**: Optimized runtime container

### Container Services

#### Development (`docker-compose.yml`)

- **football-frontend-dev**: Next.js development server with hot reload
- **Volumes**: Source code mounted for live changes
- **Network**: Isolated Docker network

#### Production (`docker-compose.prod.yml`)

- **football-frontend-prod**: Optimized Next.js production server
- **nginx**: Reverse proxy with load balancing and SSL support
- **Health checks**: Automated container health monitoring
- **Resource limits**: CPU and memory constraints

## 🔧 Configuration

### Environment Variables

Create `.env.local` (development) or `.env.production` (production):

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000/hubs

# Application
NEXT_PUBLIC_APP_NAME="Football Simulation"
NEXT_PUBLIC_APP_VERSION=0.1.0

# Security
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-here

# Database (if applicable)
DATABASE_URL=postgresql://user:password@localhost:5432/football_db

# Docker Development (use host.docker.internal for cross-container communication)
# NEXT_PUBLIC_API_URL=http://host.docker.internal:5000
```

### Network Configuration

For containerized backends, update the API URLs:

```bash
# If backend is also containerized
NEXT_PUBLIC_API_URL=http://backend-service:5000
NEXT_PUBLIC_SIGNALR_URL=http://backend-service:5000/hubs
```

## 📝 Available Commands

### Using PowerShell Scripts

```powershell
# Load the Docker scripts
. .\docker-scripts.ps1

# Development
Build-Dev              # Build development image
Start-Dev              # Start development environment
Start-DevBackground    # Start development in background
Stop-Dev               # Stop development environment
Show-DevLogs           # View development logs

# Production
Build-Prod             # Build production image
Start-Prod             # Start production environment
Start-ProdBackground   # Start production in background
Stop-Prod              # Stop production environment
Show-ProdLogs          # View production logs

# Maintenance
Clean-Docker           # Clean up Docker resources
Clean-All              # Remove all containers and images
```

### Using Docker Compose Directly

```powershell
# Development
docker-compose up --build                    # Start development
docker-compose up --build -d                # Start development (background)
docker-compose down                          # Stop development
docker-compose logs -f                       # View logs

# Production
docker-compose -f docker-compose.prod.yml up --build        # Start production
docker-compose -f docker-compose.prod.yml up --build -d     # Start production (background)
docker-compose -f docker-compose.prod.yml down              # Stop production
docker-compose -f docker-compose.prod.yml logs -f           # View logs
```

### Using Makefile (if available)

```powershell
make dev-up            # Start development
make dev-down          # Stop development
make prod-up           # Start production
make prod-down         # Stop production
make clean             # Clean Docker resources
```

## 🔍 Monitoring and Debugging

### Health Checks

The application includes built-in health monitoring:

```powershell
# Check container health
docker ps

# Manual health check
curl http://localhost:3000/api/health

# View health check logs
docker-compose logs football-frontend-prod
```

### Container Logs

```powershell
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs football-frontend-dev

# View last 100 lines
docker-compose logs --tail=100
```

### Performance Monitoring

```powershell
# Container resource usage
docker stats

# Detailed container information
docker inspect football-simulation-prod
```

## 🚀 Production Deployment

### With Nginx Reverse Proxy

1. **Configure SSL certificates** (place in `./ssl/` directory):

   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. **Update nginx.conf** for your domain:

   ```nginx
   server_name yourdomain.com;
   ```

3. **Deploy with SSL**:
   ```powershell
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

### Direct Production Deployment

```powershell
# Build production image
docker build --target production -t football-simulation:prod .

# Run production container
docker run -d \
  --name football-simulation \
  -p 3000:3000 \
  --env-file .env.production \
  football-simulation:prod
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**:

   ```powershell
   # Check what's using port 3000
   netstat -ano | findstr :3000

   # Kill process if needed
   taskkill /PID <PID> /F
   ```

2. **Volume mount issues** (Windows):

   ```powershell
   # Ensure Docker Desktop has access to the drive
   # Check Docker Desktop > Settings > Resources > File Sharing
   ```

3. **Environment variable issues**:

   ```powershell
   # Verify environment variables are loaded
   docker-compose config
   ```

4. **Memory issues**:
   ```powershell
   # Increase Docker Desktop memory allocation
   # Docker Desktop > Settings > Resources > Advanced
   ```

### Debugging Commands

```powershell
# Access container shell
docker exec -it football-simulation-dev sh

# Check container configuration
docker inspect football-simulation-dev

# View Docker Compose configuration
docker-compose config

# Check Docker system information
docker system df
docker system info
```

## 📊 Performance Optimization

### Image Size Optimization

The Dockerfile is optimized for minimal image size:

- Multi-stage builds to exclude development dependencies
- Alpine Linux base images
- Efficient layer caching
- .dockerignore to exclude unnecessary files

### Runtime Optimization

- **CPU/Memory limits** defined in production compose
- **Health checks** for automatic recovery
- **Restart policies** for high availability
- **Nginx caching** for static assets

## 🔐 Security Considerations

### Production Security

1. **Non-root user**: Container runs as `nextjs` user (UID 1001)
2. **Security headers**: Implemented in Nginx configuration
3. **Rate limiting**: API endpoints protected from abuse
4. **Environment isolation**: Separate development/production configs

### Best Practices

- Never commit sensitive environment variables
- Use Docker secrets for production secrets
- Regularly update base images for security patches
- Monitor container logs for security issues

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build --target production -t football-simulation:${{ github.sha }} .

      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up --build -d
```

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review container logs for error messages
3. Verify environment configuration
4. Check Docker Desktop status and resource allocation

---

**Note**: This setup is optimized for the Football Simulation frontend with Next.js 15, React 19, and includes support for internationalization, 3D graphics, and real-time features.

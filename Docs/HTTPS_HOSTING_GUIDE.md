# HTTPS & Hosting Guide for Football Simulation Frontend

This comprehensive guide covers HTTPS setup, security hardening, and hosting options for your Football Simulation application.

## 🔒 HTTPS and Security Setup

### Quick HTTPS Setup

1. **Run the SSL setup script**:

   ```powershell
   # For production with Let's Encrypt (free SSL)
   .\setup-ssl.ps1 -LetsEncrypt -Domain "yourdomain.com" -Email "admin@yourdomain.com"

   # For development/testing with self-signed certificates
   .\setup-ssl.ps1 -SelfSigned -Domain "localhost"
   ```

2. **Configure production environment**:

   ```powershell
   # Copy and edit production environment
   Copy-Item .env.production.example .env.production
   # Edit .env.production with your actual values
   ```

3. **Start secure production deployment**:
   ```powershell
   pnpm run docker:prod:bg
   ```

### Manual SSL Certificate Setup

If you have existing SSL certificates:

1. **Place certificate files in `ssl/` directory**:

   ```
   ssl/
   ├── cert.pem      # Your SSL certificate
   ├── key.pem       # Private key
   └── chain.pem     # Certificate chain
   ```

2. **Update `nginx.conf`** with your domain:

   ```nginx
   server_name yourdomain.com www.yourdomain.com;
   ```

3. **Deploy**:
   ```powershell
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Security Features Included

- **HTTPS redirect**: All HTTP traffic redirected to HTTPS
- **Security headers**: HSTS, XSS protection, content type sniffing protection
- **Rate limiting**: API and login endpoint protection
- **Content Security Policy**: XSS and injection attack prevention
- **OCSP stapling**: Enhanced certificate validation
- **Modern SSL/TLS**: TLS 1.2+ with secure cipher suites

---

## 🏠 Self-Hosting Options

### Option 1: Home Server / VPS

**Requirements**:

- Linux VPS or home server
- Docker and Docker Compose
- Domain name with DNS control
- Port 80/443 open on firewall

**Setup Steps**:

1. **Prepare the server**:

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Upload your application**:

   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd Football-Simulation_frontend

   # Configure environment
   cp .env.production.example .env.production
   nano .env.production  # Edit with your values
   ```

3. **Set up SSL and deploy**:

   ```bash
   # Run SSL setup (Linux version)
   chmod +x setup-ssl.sh
   ./setup-ssl.sh -LetsEncrypt -Domain "yourdomain.com" -Email "admin@yourdomain.com"

   # Start production
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Configure firewall**:
   ```bash
   # UFW (Ubuntu)
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

**Recommended VPS Providers**:

- **DigitalOcean**: $12-20/month, easy setup
- **Linode**: $10-20/month, excellent performance
- **Vultr**: $6-12/month, global locations
- **Hetzner**: €4-10/month, EU-based, great value

### Option 2: Dedicated Server

**For high-traffic production deployments**

**Setup includes**:

- Load balancing with multiple app instances
- Database clustering
- Redis for session management
- Monitoring and logging

**Enhanced docker-compose**:

```yaml
# Use the production compose with monitoring profile
docker-compose -f docker-compose.prod.yml --profile monitoring --profile with-redis up -d
```

### Option 3: Home Lab / Raspberry Pi

**Requirements**:

- Raspberry Pi 4 (4GB+ RAM recommended)
- External storage (SSD recommended)
- Dynamic DNS service
- Router port forwarding

**Setup**:

```bash
# Install Docker on Raspberry Pi
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker pi

# Configure dynamic DNS (example with NoIP)
sudo apt install noip2
sudo noip2 -C  # Configure your account

# Deploy application
git clone <your-repo>
cd Football-Simulation_frontend
docker-compose -f docker-compose.prod.yml up -d
```

---

## ☁️ Cloud Hosting Options

### Option 1: Vercel (Recommended for Next.js)

**Pros**: Zero configuration, automatic HTTPS, global CDN
**Cons**: Serverless limitations, vendor lock-in

**Setup**:

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   # From your project directory
   vercel
   # Follow the prompts
   ```

3. **Configure environment variables** in Vercel dashboard
4. **Custom domain**: Add your domain in Vercel settings

**Cost**: Free tier available, Pro starts at $20/month

### Option 2: Netlify

**Pros**: Excellent for static sites, built-in CI/CD
**Cons**: Limited server-side capabilities

**Setup**:

1. Connect GitHub repository to Netlify
2. Configure build settings:
   - Build command: `pnpm build`
   - Publish directory: `.next`
3. Add environment variables
4. Configure custom domain

**Cost**: Free tier available, Pro starts at $19/month

### Option 3: AWS (Amazon Web Services)

**Using ECS with Fargate for containerized deployment**

**Setup**:

1. **Create ECS cluster**:

   ```bash
   aws ecs create-cluster --cluster-name football-simulation
   ```

2. **Create task definition**:

   ```json
   {
     "family": "football-simulation",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "containerDefinitions": [
       {
         "name": "app",
         "image": "your-ecr-repo/football-simulation:latest",
         "portMappings": [{ "containerPort": 3000 }]
       }
     ]
   }
   ```

3. **Deploy with Load Balancer**:
   - Application Load Balancer (ALB)
   - SSL certificate from ACM
   - Route 53 for DNS

**Cost**: ~$20-50/month for small deployments

### Option 4: Google Cloud Platform

**Using Cloud Run for serverless containers**

**Setup**:

1. **Build and push to Container Registry**:

   ```bash
   # Build for GCP
   gcloud builds submit --tag gcr.io/PROJECT-ID/football-simulation
   ```

2. **Deploy to Cloud Run**:

   ```bash
   gcloud run deploy football-simulation \
     --image gcr.io/PROJECT-ID/football-simulation \
     --platform managed \
     --allow-unauthenticated
   ```

3. **Custom domain**: Configure domain mapping in Cloud Run

**Cost**: Pay-per-request, very cost-effective for low traffic

### Option 5: Azure Container Instances

**Setup**:

1. **Create container group**:

   ```bash
   az container create \
     --resource-group football-simulation \
     --name football-app \
     --image your-registry/football-simulation:latest \
     --dns-name-label football-simulation \
     --ports 3000
   ```

2. **Configure Application Gateway** for HTTPS and custom domain

**Cost**: ~$15-30/month for small deployments

---

## 🔧 Production Optimization

### Performance Optimizations

1. **Enable Redis caching**:

   ```powershell
   # Start with Redis
   docker-compose -f docker-compose.prod.yml --profile with-redis up -d
   ```

2. **Configure CDN**:

   - CloudFlare (recommended)
   - AWS CloudFront
   - Google Cloud CDN

3. **Database optimization**:
   - Connection pooling
   - Read replicas
   - Query optimization

### Monitoring and Logging

1. **Enable monitoring stack**:

   ```powershell
   # Start with monitoring
   docker-compose -f docker-compose.prod.yml --profile monitoring up -d
   ```

2. **Access monitoring dashboards**:

   - Prometheus: http://yourdomain.com:9090
   - Grafana: Configure via Prometheus

3. **Log aggregation**:
   ```powershell
   # Enable logging
   docker-compose -f docker-compose.prod.yml --profile logging up -d
   ```

### Backup Strategy

1. **Database backups**:

   ```bash
   # Automated PostgreSQL backup
   docker exec postgres pg_dump -U user football_db > backup.sql
   ```

2. **Application data**:
   ```bash
   # Backup volumes
   docker run --rm -v football_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
   ```

---

## 🛡️ Security Best Practices

### 1. Environment Security

- **Never commit secrets**: Use environment variables
- **Rotate secrets regularly**: Update JWT keys, API keys
- **Use strong passwords**: Minimum 16 characters
- **Enable 2FA**: For all admin accounts

### 2. Network Security

- **Firewall configuration**: Only open necessary ports
- **VPN access**: For administrative tasks
- **DDoS protection**: Use CloudFlare or similar
- **Regular updates**: Keep all software updated

### 3. Application Security

- **Input validation**: Sanitize all user inputs
- **Rate limiting**: Protect against abuse
- **Security headers**: Already configured in Nginx
- **Dependency scanning**: Regularly update npm packages

### 4. Monitoring and Alerts

- **Uptime monitoring**: Use services like UptimeRobot
- **Error tracking**: Implement Sentry or similar
- **Performance monitoring**: New Relic, DataDog
- **Security scanning**: Regular vulnerability assessments

---

## 💰 Cost Comparison

| Option               | Setup Time | Monthly Cost | Pros                             | Cons                 |
| -------------------- | ---------- | ------------ | -------------------------------- | -------------------- |
| **Self-Hosted VPS**  | 2-4 hours  | $10-30       | Full control, cost-effective     | Maintenance overhead |
| **Vercel**           | 15 minutes | $0-20        | Zero config, automatic scaling   | Vendor lock-in       |
| **AWS ECS**          | 4-8 hours  | $20-100      | Enterprise features, scalable    | Complex setup        |
| **Google Cloud Run** | 1-2 hours  | $5-50        | Serverless, pay-per-use          | Cold starts          |
| **Home Server**      | 4-6 hours  | $5-15        | Lowest cost, learning experience | Internet dependency  |

---

## 🚀 Quick Deployment Checklist

### Before Deployment

- [ ] Domain purchased and DNS configured
- [ ] SSL certificates obtained (or Let's Encrypt configured)
- [ ] Environment variables configured
- [ ] Database setup completed
- [ ] Backup strategy in place

### Deploy to Production

- [ ] Run SSL setup: `.\setup-ssl.ps1`
- [ ] Configure `.env.production`
- [ ] Test locally: `pnpm run docker:prod`
- [ ] Deploy to server
- [ ] Verify HTTPS working
- [ ] Test all functionality
- [ ] Configure monitoring
- [ ] Set up automated backups

### Post-Deployment

- [ ] Configure domain DNS
- [ ] Set up monitoring alerts
- [ ] Schedule regular backups
- [ ] Document deployment process
- [ ] Plan scaling strategy

---

## 🆘 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**:

   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout

   # Test SSL connection
   openssl s_client -connect yourdomain.com:443
   ```

2. **Docker Container Issues**:

   ```bash
   # Check container logs
   docker-compose -f docker-compose.prod.yml logs -f

   # Check container health
   docker ps
   ```

3. **Network Issues**:

   ```bash
   # Test connectivity
   curl -I https://yourdomain.com

   # Check DNS resolution
   nslookup yourdomain.com
   ```

---

## 📞 Support Resources

- **Docker Documentation**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

For issues with this deployment setup, check the logs first, then review the configuration files for any domain or environment variable mismatches.

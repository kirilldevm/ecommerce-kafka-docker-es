# EC2 Deployment with GitHub Self-Hosted Runner

This guide deploys the project directly on EC2 using the workflow:

- `.github/workflows/deploy-ec2-self-hosted.yml`

## 1) Create EC2 instance

Recommended baseline:

- Ubuntu 22.04 LTS
- `t3.medium` (minimum) for all services
- 30+ GB disk

Security group inbound:

- `22` (SSH) from your IP
- `80` (frontend)
- `3000` (Grafana, optional)
- `5601` (Kibana, optional)
- `8080` (Kafka UI, optional)

## 2) Install Docker + Compose plugin

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 3) Prepare app directory and env file

```bash
mkdir -p ~/apps
cd ~/apps
git clone <YOUR_REPO_URL> kafka-ec-docker-ecommerce-app
cd kafka-ec-docker-ecommerce-app
cp .env.example .env
```

Edit `.env` for production values at least:

- `JWT_SECRET`
- `GRAFANA_ADMIN_PASSWORD`
- `POSTGRES_PASSWORD`
- `CORS_ORIGINS` (your real domain)
- `FRONTEND_PORT` (usually `80`)

## 4) Install GitHub self-hosted runner on EC2

In GitHub repo:

- `Settings -> Actions -> Runners -> New self-hosted runner`
- Choose Linux x64
- Follow generated commands on EC2

Important during runner config:

- Use labels including: `ec2,linux,x64`
- Install as service:

```bash
./svc.sh install
./svc.sh start
```

Workflow expects these labels:

- `self-hosted, linux, x64, ec2`

## 5) First deploy

Option A (manual first run):

```bash
docker compose up -d --build
```

Option B (recommended):

- Open GitHub Actions
- Run workflow **Deploy to EC2 (self-hosted runner)**

## 6) Ongoing deploy flow

- Push to `main` or `master`
- Workflow runs on EC2 self-hosted runner
- It performs:
  - `docker compose pull --ignore-pull-failures`
  - `docker compose up -d --build`
  - image cleanup

## 7) Useful operations

```bash
docker compose ps
docker compose logs -f api-gateway
docker compose logs -f frontend
docker compose restart frontend api-gateway
docker compose down
```

## Notes

- Keep `.env` on EC2 host (workflow requires it).
- Frontend is served by Nginx in `frontend` container and proxies `/api/*` to `api-gateway`.
- If you use a domain, put DNS A record to EC2 public IP and update `CORS_ORIGINS`.


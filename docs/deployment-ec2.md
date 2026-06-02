# EC2 Deployment with GitHub Self-Hosted Runner

This guide deploys the project directly on EC2 using the workflow:

- `.github/workflows/deploy-ec2.yml`

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

If your instance is small (`t3.medium`) add swap to avoid Docker build OOM kills:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

## 3) Prepare app directory

```bash
mkdir -p ~/apps
cd ~/apps
git clone <YOUR_REPO_URL> kafka-ec-docker-ecommerce-app
cd kafka-ec-docker-ecommerce-app
```

## 4) Configure one GitHub environment secret

In GitHub repo:

- `Settings -> Environments -> New environment -> production`
- Open `production` -> `Secrets` -> add:
  - Name: `EC2_ENV_FILE`
  - Value: full multi-line production `.env` contents

Use strong production values at least for:

- `JWT_SECRET`
- `GRAFANA_ADMIN_PASSWORD`
- `POSTGRES_PASSWORD`
- `CORS_ORIGINS` (your real domain)
- `FRONTEND_PORT` (usually `80`)

## 5) Install GitHub self-hosted runner on EC2

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

## 6) First deploy

Option A (manual first run):

```bash
docker compose up -d --build
```

Option B (recommended):

- Open GitHub Actions
- Run workflow **Deploy to EC2**

## 7) Ongoing deploy flow

- Push to `main` or `master`
- Workflow runs on EC2 self-hosted runner
- It performs:
  - `docker compose pull --ignore-pull-failures`
  - `docker compose up -d --build`
  - image cleanup

## 8) Useful operations

```bash
docker compose ps
docker compose logs -f api-gateway
docker compose logs -f frontend
docker compose restart frontend api-gateway
docker compose down
```

## Notes

- Workflow regenerates `.env` from secret `EC2_ENV_FILE` every run.
- Workflow disables Docker Compose bake and limits build parallelism to reduce memory pressure.
- `search-service` has an extended healthcheck window because it performs Elasticsearch/index sync before opening HTTP.
- Frontend is served by Nginx in `frontend` container and proxies `/api/*` to `api-gateway`.
- If you use a domain, put DNS A record to EC2 public IP and update `CORS_ORIGINS`.


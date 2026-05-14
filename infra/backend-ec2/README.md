# Backend EC2 (Express server.js host)

Replaces Railway. Runs `node server.js` on a t3.micro behind an Elastic IP.

## Cost
- t3.micro: **Free Tier first 12 months** (750 hr/mo), then ~$8/mo
- gp3 20 GB EBS: ~$1.60/mo (Free Tier: 30 GB free first year)
- Elastic IP: free **while attached** to a running instance, $3.65/mo if detached
- Total: **~$0/mo (Free Tier)** or ~$10/mo (after Free Tier)

## Deploy

```bash
cd infra/backend-ec2
terraform init
terraform plan
terraform apply
```

Note the `public_ip` and `instance_id` outputs.

## First-time backend setup (after apply)

### 1. Shell into the instance via Session Manager
```bash
aws ssm start-session --target <instance_id> --region us-east-1
```

### 2. As ec2-app user, clone the repo
```bash
sudo -i -u ec2-app
cd /opt/app
git clone https://github.com/<your-username>/AWS-SSA03.git .
npm install --legacy-peer-deps --omit=dev
```

### 3. Upload `.env` securely
Edit on the instance directly (don't commit secrets):
```bash
nano /opt/app/.env
```
Paste the same contents as your local `.env`, **but change**:
- `DB_HOST=saa-quiz-db.ckdq8oyw05u2.us-east-1.rds.amazonaws.com` (private VPC endpoint, not localhost)
- `DB_PORT=5432`
- `REDIS_HOST=saa-quiz-cache.bowstg.0001.use1.cache.amazonaws.com`
- `REDIS_PORT=6379`
- `NODE_ENV=production`

### 4. Start with PM2
```bash
pm2 start server.js --name saa-backend
pm2 save
```

PM2 will auto-restart on crash and on boot (systemd hook installed by user_data).

### 5. Update the frontend to point here
In `.env.production` of the frontend:
```
VITE_BACKEND_URL=http://<elastic_ip>:5000
```
Rebuild + redeploy the S3 frontend.

## Day-2 ops

| Action | Command |
|---|---|
| Shell in | `aws ssm start-session --target <id> --region us-east-1` |
| Tail logs | `pm2 logs saa-backend` |
| Restart | `pm2 restart saa-backend` |
| Deploy new code | `cd /opt/app && git pull && npm install --omit=dev && pm2 restart saa-backend` |
| Stop billing | `aws ec2 stop-instances --instance-ids <id> --region us-east-1` |
| Start again | `aws ec2 start-instances --instance-ids <id> --region us-east-1` |

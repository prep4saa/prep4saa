# 🚀 Production Deployment Guide

This guide explains how to deploy `server.js` to AWS App Runner to restore problem generation functionality.

## Problem

The frontend is currently unable to generate SAA problems because:
- The backend API Gateway only has Lambda deployed for Lemon Squeezy webhooks
- The critical `/api/claudeProxy` and `/api/gemini` endpoints exist only in `server.js`
- `server.js` is only running locally (localhost:5000), not in production
- The frontend is trying to call these endpoints but they don't exist in production

## Solution

Deploy `server.js` to AWS App Runner with proper environment variables.

## Step 1: Create IAM Roles (One-time setup)

First, create the necessary IAM roles for App Runner:

```bash
# Deploy the IAM role CloudFormation template
aws cloudformation create-stack \
  --stack-name app-runner-iam-roles \
  --template-body file://lambda-webhook/app-runner-iam-setup.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

Wait for the stack to complete:

```bash
aws cloudformation wait stack-create-complete \
  --stack-name app-runner-iam-roles \
  --region us-east-1
```

## Step 2: Set GitHub Secrets

Add these secrets to your GitHub repository settings (Settings > Secrets and variables > Actions):

### Required Secrets

| Secret Name | Value | Source |
|-----------|-------|--------|
| `AWS_ACCOUNT_ID` | Your AWS Account ID | AWS Console > Account > Account ID |
| `ANTHROPIC_API_KEY` | Claude API Key | From your .env file |
| `GEMINI_API_KEY` | Google Gemini API Key | From your .env file |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON (as single-line string) | From firebase-key.json |
| `FIREBASE_DATABASE_URL` | Firebase Realtime Database URL | From your .env file |
| `LEMON_SQUEEZY_API_KEY` | Lemon Squeezy API Key | From your .env file |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook secret for signature verification | From your .env file |
| `RESEND_API_KEY` | Resend email API key | From your .env file |
| `CONTACT_EMAIL` | Contact form email address | From your .env file |
| `VITE_ADMIN_EMAIL` | Admin email for access control | From your .env file |
| `VITE_BACKEND_URL` | Will be updated after first deployment | Leave blank for now |

### Converting firebase-key.json to GitHub Secret

The FIREBASE_SERVICE_ACCOUNT secret must be a single-line JSON string:

```bash
# On macOS/Linux:
cat firebase-key.json | jq -c . | tr -d '\n' | pbcopy

# On Windows PowerShell:
$json = Get-Content firebase-key.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
[System.Windows.Forms.Clipboard]::SetText($json)
```

Then paste as the `FIREBASE_SERVICE_ACCOUNT` GitHub secret.

## Step 3: Deploy via GitHub Actions

The App Runner deployment is triggered automatically when you push changes to:
- `server.js`
- `Dockerfile`
- `package.json`
- `.github/workflows/app-runner-deploy.yml`

To trigger a manual deployment, push a change to the main branch:

```bash
git add .
git commit -m "Deploy server.js to App Runner"
git push origin main
```

Then monitor the workflow:
1. Go to GitHub > Actions
2. Click "Deploy to App Runner"
3. Wait for all steps to complete (~5-10 minutes)

## Step 4: Get the Service URL

After deployment completes successfully, the App Runner service URL will be displayed in:
- GitHub Actions workflow summary
- Deployment comment (if from a pull request)

The URL will look like: `https://random-id.us-east-1.awsapprunner.com`

## Step 5: Update Frontend Backend URL

Update the `VITE_BACKEND_URL` GitHub secret with the App Runner service URL from Step 4.

Then redeploy the frontend:

```bash
git add .
git commit -m "Update backend URL to App Runner service"
git push origin main
```

This will trigger the S3 deployment workflow which will rebuild the frontend with the new backend URL.

## Step 6: Verify the Deployment

Once the frontend is redeployed, test the problem generation:

1. Open https://prep4saa.com
2. Try to generate a problem
3. Verify that problems are being generated correctly

## Troubleshooting

### App Runner Service Won't Start

Check the App Runner logs:

```bash
# Describe the service
aws apprunner describe-service \
  --service-arn <service-arn> \
  --region us-east-1

# View logs
aws logs tail /aws/apprunner/prep4saa-server --follow
```

### Health Check Fails

The health check endpoint is `/health` on port 5000. If it fails:

1. Check that environment variables are set correctly
2. Verify Firebase credentials are valid
3. Check server.js logs for errors

### Backend URL Not Updated in Frontend

Make sure you:
1. Updated the `VITE_BACKEND_URL` GitHub secret
2. Pushed a commit to trigger the S3 deployment workflow
3. CloudFront cache has been invalidated (happens automatically)

## Rollback

If something goes wrong, rollback to the previous Docker image:

```bash
# Get the previous image tag
aws ecr describe-images \
  --repository-name prep4saa-server \
  --region us-east-1 \
  --query 'imageDetails[*].[imageTags,imagePushedAt]' \
  --sort-by imagePushedAt \
  --order descending

# Update the service with the previous image
aws apprunner update-service \
  --service-arn <service-arn> \
  --source-configuration ImageRepository='{ImageIdentifier=<previous-image-uri>,ImageRepositoryType=ECR,ImageConfiguration={Port=5000}}' \
  --region us-east-1
```

## Architecture

```
Frontend (S3/CloudFront)
    ↓
    ├─ API calls to /api/claudeProxy → App Runner
    ├─ API calls to /api/gemini → App Runner
    ├─ API calls to /api/lemonsqueezy/* → API Gateway → Lambda
    └─ API calls to /api/webhooks/lemon-squeezy → API Gateway → Lambda
```

## Cost Considerations

AWS App Runner pricing (as of 2024):
- **Memory/vCPU**: ~$0.035/hour per GB-hour
- **Requests**: $0.000005 per request
- **Data transfer**: Standard AWS rates apply

For this use case with modest traffic, estimate **$25-50/month**.

## Monitoring

### CloudWatch Metrics

```bash
# View App Runner metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppRunner \
  --metric-name RequestCount \
  --dimensions Name=ServiceName,Value=prep4saa-server \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Logs

```bash
# Stream logs in real-time
aws logs tail /aws/apprunner/prep4saa-server --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/apprunner/prep4saa-server \
  --filter-pattern "ERROR" \
  --region us-east-1
```

## Next Steps

After successful deployment:

1. ✅ Test problem generation thoroughly
2. ✅ Monitor App Runner metrics and logs
3. ✅ Set up CloudWatch alarms for failures
4. ⏳ Consider configuring a custom domain for the App Runner service
5. ⏳ Set up automatic scaling policies if needed

## Support

For issues or questions:
1. Check App Runner logs: `aws logs tail /aws/apprunner/prep4saa-server --follow`
2. Review GitHub Actions workflow logs
3. Verify all environment variables are set in GitHub Secrets

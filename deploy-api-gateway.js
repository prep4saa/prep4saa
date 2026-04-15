#!/usr/bin/env node

const { CloudFormationClient, CreateStackCommand, DescribeStacksCommand, UpdateStackCommand } = require('@aws-sdk/client-cloudformation');
const fs = require('fs');
const path = require('path');

const STACK_NAME = 'lemon-squeezy-api-gateway';
const TEMPLATE_FILE = path.join(__dirname, 'lambda-webhook', 'api-gateway-config.yaml');

async function deployApiGateway() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';

  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`❌ Template file not found: ${TEMPLATE_FILE}`);
    process.exit(1);
  }

  const templateBody = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
  const client = new CloudFormationClient({ region });

  try {
    // Check if stack exists
    let stackExists = false;
    try {
      await client.send(new DescribeStacksCommand({ StackName: STACK_NAME }));
      stackExists = true;
    } catch (err) {
      if (!err.message?.includes('does not exist')) {
        throw err;
      }
    }

    if (stackExists) {
      console.log(`📝 Updating existing CloudFormation stack: ${STACK_NAME}`);
      const updateResponse = await client.send(new UpdateStackCommand({
        StackName: STACK_NAME,
        TemplateBody: templateBody,
      }));
      console.log(`✅ Stack update initiated. Stack ID: ${updateResponse.StackId}`);
    } else {
      console.log(`🚀 Creating new CloudFormation stack: ${STACK_NAME}`);
      const createResponse = await client.send(new CreateStackCommand({
        StackName: STACK_NAME,
        TemplateBody: templateBody,
      }));
      console.log(`✅ Stack creation initiated. Stack ID: ${createResponse.StackId}`);
    }

    console.log('\n⏳ Waiting for stack operation to complete...');
    console.log('You can monitor progress in AWS CloudFormation console at:');
    console.log(`https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks?filteringText=${STACK_NAME}`);

  } catch (error) {
    console.error(`❌ Error deploying CloudFormation stack:`, error.message);
    process.exit(1);
  }
}

// Check for AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
  process.exit(1);
}

deployApiGateway();

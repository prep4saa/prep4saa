#!/usr/bin/env python3

import subprocess
import json
import sys
from datetime import datetime

# CloudFront Distribution ID
DISTRIBUTION_ID = "E5O4C7TLOVEG7"

# Try to invalidate using AWS CLI via GitHub secrets
try:
    result = subprocess.run([
        "aws", "cloudfront", "create-invalidation",
        "--distribution-id", DISTRIBUTION_ID,
        "--paths", "/*"
    ], capture_output=True, text=True)

    if result.returncode == 0:
        response = json.loads(result.stdout)
        invalidation_id = response['Invalidation']['Id']
        print(f"✅ CloudFront cache invalidation created!")
        print(f"   Invalidation ID: {invalidation_id}")
        print(f"   Distribution: {DISTRIBUTION_ID}")
        print(f"   Paths: /*")
        sys.exit(0)
    else:
        print(f"❌ Error: {result.stderr}")
        sys.exit(1)

except Exception as e:
    print(f"❌ Exception: {e}")
    sys.exit(1)

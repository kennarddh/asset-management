#!/bin/sh
set -e

NODE_ID=$(curl -s -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" http://garage:3903/v2/GetNodeInfo?node=self | jq -r '.success | keys[0]')

GARAGE="/usr/local/bin/garage --rpc-host $NODE_ID@$GARAGE_RPC_HOST --rpc-secret $GARAGE_RPC_SECRET"

# Initialize Layout (Only runs on the very first boot)
if $GARAGE status | grep -q "NO ROLE ASSIGNED"; then
	# TODO: Make capacity auto based on hardware capacity detection.
    echo "Initial setup: Assigning $CAPACITY capacity..."

    $GARAGE layout assign -z dc1 -c "$CAPACITY" "$NODE_ID"
    $GARAGE layout apply --version 1
fi

# Import Credentials
echo "Syncing S3 Keys..."
$GARAGE key import "$APP_KEY_ID" "$APP_SECRET_KEY" -n "$APP_KEY_NAME" --yes || true

# Create Buckets & Permissions
for BUCKET in user-profiles asset-images; do
	echo "Checking bucket: $BUCKET"

	# || true is used to ignore error if bucket already exists
    $GARAGE bucket create "$BUCKET" || true
    
	$GARAGE bucket allow "$BUCKET" --read --write --key "$APP_KEY_NAME"

	$GARAGE bucket website --allow "$BUCKET"
done

echo "Provisioning complete!"
repository=
branch=
app_name=
app_url=
analytics_url=
analytics_site_id=

koyeb secret create "$app_name-db-url" --value ''
koyeb secret create "$app_name-session-secret" --value ''
koyeb secret create "$app_name-email-host" --value ''
koyeb secret create "$app_name-email-from" --value ''
koyeb secret create "$app_name-email-password" --value ''
koyeb secret create "$app_name-slack-webhook-url" --value ''
koyeb secret create "$app_name-web-push-public-key" --value ''
koyeb secret create "$app_name-web-push-private-key" --value ''
koyeb secret create "$app_name-geoapify-key" --value ''

koyeb app create "$app_name"

koyeb service create server \
  --app $app_name \
  --type web \
  --git "$repository" \
  --git-branch "$branch" \
  --git-build-command 'pnpm exec tsc -b && pnpm run --filter @sel/emails build && pnpm run --filter @sel/server build' \
  --git-run-command 'pnpm run --filter @sel/server start' \
  --instance-type micro \
  --regions fra \
  --env HOST='0.0.0.0' \
  --env PORT='3000' \
  --env SESSION_SECRET="@$app_name-session-secret" \
  --env SESSION_SECURE='true' \
  --env APP_BASE_URL="$app_url" \
  --env DB_URL="@$app_name-db-url" \
  --env EMAIL_HOST="@$app_name-email-host" \
  --env EMAIL_PORT='465' \
  --env EMAIL_SECURE='true' \
  --env EMAIL_FROM="@$app_name-email-from" \
  --env EMAIL_PASSWORD="@$app_name-email-password" \
  --env SLACK_WEBHOOK_URL="@$app_name-slack-webhook-url" \
  --env WEB_PUSH_SUBJECT="$app_url" \
  --env WEB_PUSH_PUBLIC_KEY="$app_name-web-push-public-key" \
  --env WEB_PUSH_PRIVATE_KEY="$app_name-web-push-public-key" \
  --ports 3000:http \
  --routes /api:3000 \
  --checks 3000:http:/health \
  --scale 1

koyeb service create web \
  --app $app_name \
  --type web \
  --git "$repository" \
  --git-branch "$branch" \
  --git-build-command 'pnpm exec tsc -b && pnpm run --filter @sel/web build' \
  --git-run-command 'pnpx serve -p 8080 --single apps/web/dist' \
  --instance-type nano \
  --regions fra \
  --env VITE_ANALYTICS_URL="$analytics_url" \
  --env VITE_ANALYTICS_SITE_ID="$analytics_site_id" \
  --env VITE_GEOAPIFY_API_KEY="@$app_name-geoapify-key" \
  --ports 8080:http \
  --routes /:8080 \
  --checks 8080:http:/ \
  --scale 1

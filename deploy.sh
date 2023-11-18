repository=
branch=
app_name=

koyeb secret create "$app_name-db-url" --value ''
koyeb secret create "$app_name-session-secret" --value ''
koyeb secret create "$app_name-email-host" --value ''
koyeb secret create "$app_name-email-from" --value ''
koyeb secret create "$app_name-email-password" --value ''
koyeb secret create "$app_name-slack-webhook-url" --value ''
koyeb secret create "$app_name-geoapify-key" --value ''

koyeb app create "$app_name"

koyeb service create server \
  --app $app_name \
  --type web \
  --git "$repository" \
  --git-branch "$branch" \
  --git-build-command 'pnpm exec tsc -b && pnpm run --filter @sel/server build' \
  --git-run-command 'pnpm run --filter @sel/server start' \
  --instance-type micro \
  --regions fra \
  --env HOST='0.0.0.0' \
  --env PORT='3000' \
  --env SESSION_SECRET='@$app_name-session-secret' \
  --env SESSION_SECURE='true' \
  --env APP_BASE_URL='https://selonsnous.nilscox.dev' \
  --env DB_URL='@$app_name-db-url' \
  --env EMAIL_HOST='ssl0.ovh.net' \
  --env EMAIL_PORT='465' \
  --env EMAIL_SECURE='true' \
  --env EMAIL_FROM='selons-nous@nilscox.dev' \
  --env EMAIL_PASSWORD='@$app_name-email-password' \
  --env EMAIL_TEMPLATES='./email-templates' \
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
  --env VITE_ANALYTICS_URL='https://analytics.nilscox.dev' \
  --env VITE_ANALYTICS_SITE_ID='12' \
  --env VITE_GEOAPIFY_API_KEY=@sel-staging-geoapify-key \
  --ports 8080:http \
  --routes /:8080 \
  --checks 8080:http:/ \
  --scale 1

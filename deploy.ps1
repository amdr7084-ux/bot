param()

Write-Host "Building Docker image..."
$imageName = $env:DOCKER_IMAGE_NAME -or 'attachments:latest'
docker build -t $imageName .

if ($env:DOCKERHUB_USERNAME -and $env:DOCKERHUB_TOKEN) {
  Write-Host "Logging in to Docker Hub..."
  docker login -u $env:DOCKERHUB_USERNAME --password-stdin | Out-Null
  Write-Host "Pushing $imageName to Docker Hub..."
  docker push $imageName
}

if ($env:WISPBYTE_DEPLOY_URL -and $env:WISPBYTE_API_KEY) {
  Write-Host "Calling Wispbyte deploy endpoint..."
  $body = @{ image = $imageName } | ConvertTo-Json
  Invoke-RestMethod -Uri $env:WISPBYTE_DEPLOY_URL -Method Post -Headers @{ Authorization = "Bearer $($env:WISPBYTE_API_KEY)" } -Body $body -ContentType 'application/json'
}

Write-Host "Done."

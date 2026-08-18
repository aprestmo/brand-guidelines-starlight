output "container_service_url" {
  description = "Managed HTTPS endpoint for the Lightsail service. It returns 404 until the first image is deployed."
  value       = aws_lightsail_container_service.app.url
}

output "ecr_repository_url" {
  description = "Private ECR repository to which GitHub Actions publishes commit-tagged images."
  value       = aws_ecr_repository.app.repository_url
}

output "github_deploy_role_arn" {
  description = "Configure this as AWS_DEPLOY_ROLE_ARN in GitHub Actions variables."
  value       = aws_iam_role.github_deploy.arn
}

output "deployed_image_tag" {
  description = "The image tag requested through Terraform, or null before the first deployment."
  value       = one(aws_lightsail_container_service_deployment_version.app[*].container[0].image)
}

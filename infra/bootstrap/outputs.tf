output "state_bucket_name" {
  description = "Configure this as the bucket backend value for infra/lightsail."
  value       = aws_s3_bucket.terraform_state.bucket
}

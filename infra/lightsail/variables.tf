variable "aws_region" {
  description = "AWS region for the Lightsail service and ECR repository."
  type        = string
}

variable "terraform_state_bucket" {
  description = "Name of the bootstrap-created S3 bucket that stores this stack's Terraform state."
  type        = string
}

variable "project_name" {
  description = "Lowercase, hyphenated name used for AWS resources."
  type        = string
  default     = "brand-guidelines"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$|^[a-z0-9]$", var.project_name))
    error_message = "project_name must contain lowercase letters, numbers, and internal hyphens only."
  }
}

variable "container_power" {
  description = "Lightsail container-service capacity per node."
  type        = string
  default     = "nano"

  validation {
    condition     = contains(["nano", "micro", "small", "medium", "large", "xlarge"], var.container_power)
    error_message = "container_power must be a valid Lightsail container-service power value."
  }
}

variable "container_scale" {
  description = "Number of Lightsail container-service nodes."
  type        = number
  default     = 1

  validation {
    condition     = var.container_scale >= 1 && var.container_scale <= 20
    error_message = "container_scale must be between 1 and 20."
  }
}

variable "image_tag" {
  description = "Immutable ECR image tag to deploy. Leave empty during the initial infrastructure apply."
  type        = string
  default     = ""
}

variable "github_oidc_provider_arn" {
  description = "ARN of the account-level GitHub Actions OIDC provider."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the deployment role."
  type        = string
  default     = "aprestmo/brand-guidelines-starlight"
}

variable "tags" {
  description = "Additional tags for application resources."
  type        = map(string)
  default     = {}
}

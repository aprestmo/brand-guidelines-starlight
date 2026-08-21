locals {
  common_tags = merge(
    {
      ManagedBy   = "Terraform"
      Project     = var.project_name
      Environment = "production"
    },
    var.tags,
  )
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

resource "aws_ecr_repository" "app" {
  name                 = var.project_name
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep the most recent 20 deployed images"
        selection = {
          tagStatus = "tagged"
          tagPrefixList = [
            "sha-",
          ]
          countType   = "imageCountMoreThan"
          countNumber = 20
        }
        action = {
          type = "expire"
        }
      },
    ]
  })
}

resource "aws_lightsail_container_service" "app" {
  name        = var.project_name
  power       = var.container_power
  scale       = var.container_scale
  is_disabled = false

  private_registry_access {
    ecr_image_puller_role {
      is_active = true
    }
  }
}

data "aws_iam_policy_document" "lightsail_ecr_pull" {
  statement {
    sid    = "AllowLightsailImagePull"
    effect = "Allow"

    principals {
      type = "AWS"
      identifiers = [
        aws_lightsail_container_service.app.private_registry_access[0].ecr_image_puller_role[0].principal_arn,
      ]
    }

    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
  }
}

resource "aws_ecr_repository_policy" "lightsail_pull" {
  repository = aws_ecr_repository.app.name
  policy     = data.aws_iam_policy_document.lightsail_ecr_pull.json
}

data "aws_iam_policy_document" "github_deploy_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.github_oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:aprestmo@3515907/brand-guidelines-starlight@1333118728:environment:production",
      ]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "${var.project_name}-github-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_deploy_assume_role.json
}

data "aws_iam_policy_document" "github_deploy" {
  statement {
    sid       = "EcrAuthentication"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "PushAndReadApplicationImages"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeImages",
      "ecr:DescribeRepositories",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetLifecyclePolicy",
      "ecr:GetRepositoryPolicy",
      "ecr:InitiateLayerUpload",
      "ecr:ListImages",
      "ecr:ListTagsForResource",
      "ecr:PutImage",
      "ecr:PutLifecyclePolicy",
      "ecr:TagResource",
      "ecr:UntagResource",
      "ecr:UploadLayerPart",
    ]
    resources = [aws_ecr_repository.app.arn]
  }

  statement {
    sid    = "ManageLightsailApplication"
    effect = "Allow"
    actions = [
      "lightsail:CreateContainerService",
      "lightsail:CreateContainerServiceDeployment",
      "lightsail:DeleteContainerService",
      "lightsail:GetContainerLog",
      "lightsail:GetContainerServiceDeployments",
      "lightsail:GetContainerServices",
      "lightsail:GetOperations",
      "lightsail:TagResource",
      "lightsail:UntagResource",
      "lightsail:UpdateContainerService",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ManageApplicationTerraformState"
    effect = "Allow"
    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
    ]
    resources = ["arn:aws:s3:::${var.terraform_state_bucket}"]
  }

  statement {
    sid    = "ManageApplicationTerraformStateObjects"
    effect = "Allow"
    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = [
      "arn:aws:s3:::${var.terraform_state_bucket}/lightsail/*",
    ]
  }

  statement {
    sid    = "ManageOwnTerraformRole"
    effect = "Allow"
    actions = [
      "iam:DeleteRolePolicy",
      "iam:GetRole",
      "iam:GetRolePolicy",
      "iam:ListAttachedRolePolicies",
      "iam:ListRolePolicies",
      "iam:PutRolePolicy",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:UpdateAssumeRolePolicy",
    ]
    resources = [aws_iam_role.github_deploy.arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "${var.project_name}-deployment"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

resource "aws_lightsail_container_service_deployment_version" "app" {
  count = var.image_tag == "" ? 0 : 1

  service_name = aws_lightsail_container_service.app.name

  container {
    container_name = "app"
    image          = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"

    environment = {
      HOST     = "0.0.0.0"
      NODE_ENV = "production"
      PORT     = "4321"
    }

    ports = {
      4321 = "HTTP"
    }
  }

  public_endpoint {
    container_name = "app"
    container_port = 4321

    health_check {
      healthy_threshold   = 2
      unhealthy_threshold = 2
      timeout_seconds     = 5
      interval_seconds    = 10
      path                = "/"
      success_codes       = "200-399"
    }
  }

  depends_on = [aws_ecr_repository_policy.lightsail_pull]
}

# Brand guidelines

A Starlight documentation site with TinaCMS editing.

## Content

Documentation lives in `src/content/docs/`:

- Markdown files are editable in TinaCMS with title, description, and rich-text body fields.
- `index.mdx` is the documentation home. Its hero and next-step cards are structured Tina fields; its MDX component wrapper remains source-controlled.
- Starlight continues to generate the public documentation routes from these files.

## Local editing

Run the combined TinaCMS and Astro development server:

```sh
pnpm dev
```

Open `http://localhost:4321/admin/` to edit content. Saving updates the Markdown or MDX source file; regular documentation bodies also update in the Tina preview.

TinaCMS generates `tina/__generated__/` and `public/admin/`; neither directory is committed. `pnpm build` renders the Markdown and MDX source directly with Astro, without a TinaCMS server or TinaCloud credentials.

For a TinaCloud deployment, provide `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` and run `pnpm build:cloud`.

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts TinaCMS and Astro at `localhost:4321`     |
| `pnpm build`           | Builds the public production site without TinaCMS |
| `pnpm build:cloud`     | Builds against TinaCloud for deployment          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## AWS Lightsail deployment

The public documentation site runs as an Astro Node server in an Amazon Lightsail
Container Service. Terraform provisions the service, a private ECR repository, and a
GitHub Actions deployment role. Images are tagged with an immutable commit SHA, and
Lightsail serves the application over its managed HTTPS URL.

The first release uses the credential-free `pnpm build` path without TinaCMS.
TinaCloud credentials and a production authoring workflow are not configured, so
`/admin/` is unavailable in production until that work is explicitly added.

### Prerequisites

- Terraform 1.10 or newer and AWS credentials for the initial bootstrap.
- An account-level GitHub Actions OIDC provider at
  `token.actions.githubusercontent.com` with audience `sts.amazonaws.com`.
- A globally unique S3 bucket name for Terraform state.

### 1. Bootstrap Terraform state

Copy the example variables, replace the bucket name, then create the encrypted,
versioned state bucket:

```sh
cp infra/bootstrap/terraform.tfvars.example infra/bootstrap/terraform.tfvars
terraform -chdir=infra/bootstrap init
terraform -chdir=infra/bootstrap apply
```

Record the `state_bucket_name` output. The bucket keeps state history and uses S3
native lockfiles; do not commit `terraform.tfvars` or Terraform state.

### 2. Create ECR, Lightsail, and the deployment role

Copy and complete the application variables. Use the existing GitHub OIDC provider ARN
from the AWS account, then initialize the S3 backend with the state-bucket name:

```sh
cp infra/lightsail/terraform.tfvars.example infra/lightsail/terraform.tfvars
terraform -chdir=infra/lightsail init \
  -backend-config="bucket=<state-bucket-name>" \
  -backend-config="region=<aws-region>"
terraform -chdir=infra/lightsail apply
```

This first apply deliberately creates no Lightsail deployment because ECR has no image
yet. Record the `ecr_repository_url`, `github_deploy_role_arn`, and
`container_service_url` outputs. The last URL returns a 404 until the first workflow
deployment becomes healthy.

### 3. Configure GitHub Actions

Create these repository **variables** before pushing to `main`:

- `AWS_REGION` — the same region used by Terraform.
- `TF_STATE_BUCKET` — the bootstrap state bucket name.
- `PROJECT_NAME` — `brand-guidelines`, unless the Terraform value was changed.
- `ECR_REPOSITORY` — the ECR repository name; it must equal `PROJECT_NAME`.
- `AWS_DEPLOY_ROLE_ARN` — the Terraform `github_deploy_role_arn` output.
- `AWS_GITHUB_OIDC_PROVIDER_ARN` — the provider ARN used in
  `github_oidc_provider_arn`.

The workflow builds the image, pushes `sha-<commit SHA>` to ECR, and applies the
Lightsail deployment through Terraform. It requires the `production` GitHub
environment; configure environment approval rules there if production deployments need
review.

### Verify and roll back

Build and run the production container locally before the first release:

```sh
docker build -t brand-guidelines .
docker run --rm -p 4321:4321 brand-guidelines
```

After GitHub Actions completes, open the `container_service_url` Terraform output and
confirm the home page and a content page return successfully over HTTPS. Check
Lightsail container logs and health if activation fails.

To roll back, run **Deploy to AWS Lightsail** manually and enter a prior
`sha-<commit SHA>` image tag. The workflow skips the image build and deploys that
immutable ECR image.

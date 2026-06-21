# Cloud-Native Order Tracking Platform

A small e-commerce order-tracking API deployed on Amazon EKS, with a full CI/CD pipeline (Jenkins → ECR → EKS), infrastructure fully defined as Terraform, autoscaling via HPA, and observability through CloudWatch Container Insights and SNS alerting.

Live demo: `http://k8s-default-ordertra-6fdd0ed6d0-777033881.us-east-1.elb.amazonaws.com/`

---

## Architecture

```
Developer
   |
   | git push
   v
GitHub  ----(webhook)---->  Jenkins (EC2)
                                |
                                | docker build / push
                                v
                              ECR
                                |
                                | kubectl set image
                                v
                       EKS Cluster (private subnets)
                         |
                    Deployment (1-5 pods, HPA)
                         |
                    Service (ClusterIP)
                         |
                    Ingress -> AWS Load Balancer Controller -> ALB (public)
                                                                   |
                                                                Internet
```

Supporting infrastructure:
- VPC with public subnets (NAT Gateway, ALB, Jenkins EC2) and private subnets (EKS worker nodes)
- Terraform state stored in S3, locked via DynamoDB
- IAM roles scoped per component (EKS cluster, node group, ALB Controller via IRSA, CloudWatch agent via IRSA, Jenkins CI via a dedicated least-privilege IAM user)
- CloudWatch Container Insights (CloudWatch Agent + Fluent Bit) for pod metrics and logs
- SNS email alert on Jenkins EC2 high CPU

---

## Tech stack

| Layer | Tools |
|---|---|
| Cloud | AWS (EC2, VPC, IAM, S3, DynamoDB, ECR, EKS, ALB, CloudWatch, SNS) |
| IaC | Terraform (providers: aws, kubernetes, helm, tls) |
| Containers / Orchestration | Docker, Kubernetes, EKS |
| CI/CD | Jenkins (declarative pipeline, GitHub webhook trigger) |
| App | Python, Flask, Gunicorn |
| Monitoring | CloudWatch Container Insights, CloudWatch Alarms, SNS |

---

## Repository structure

```
app/                          Flask app (API + simple front-end)
jenkins/Jenkinsfile           CI/CD pipeline definition
kubernetes/                   Deployment, Service, Ingress, HPA manifests
terraform/backend/            S3 + DynamoDB bootstrap (Terraform remote state)
terraform/infrastructure/     All AWS + Kubernetes + Helm resources
cwagent-fluent-bit-quickstart.yaml   Reference copy of the AWS quickstart manifest
                                     (the live cluster's CloudWatch Insights resources
                                     are managed via Terraform, not this file)
```

---

## What's deployed

- **VPC**: 2 public + 2 private subnets across 2 AZs, single NAT Gateway, EKS subnet discovery tags
- **EKS**: managed cluster (v1.30) with a managed node group (1-2 × `t3.small`), `API_AND_CONFIG_MAP` auth mode, control plane logging enabled
- **AWS Load Balancer Controller**: installed via Terraform's `helm_release`, authenticated via IRSA, provisions a real ALB from the Ingress resource
- **App**: Flask API (`/health`, `/orders`) + a small dashboard front-end, running as a non-root user under Gunicorn
- **Autoscaling**: HPA (1-5 replicas, 70% CPU target) backed by `metrics-server`
- **CI/CD**: Jenkins on EC2, triggered automatically by GitHub push webhooks; pipeline builds the Docker image, pushes to ECR, and deploys via `kubectl set image`
- **IAM**: every component (EKS cluster, node group, ALB Controller, CloudWatch agent, Jenkins CI user) has its own role/user scoped to only what it needs — no shared admin credentials in the pipeline
- **Monitoring**: CloudWatch Container Insights (pod/node metrics + application, dataplane, and host logs via Fluent Bit); a CloudWatch Alarm on Jenkins EC2 CPU notifies an SNS topic, which emails a subscriber on trigger

---

## Running it yourself

### Prerequisites
- AWS account + AWS CLI configured
- Terraform >= 1.5.0
- `kubectl`, `helm`, `docker`

### 1. Bootstrap the Terraform backend
```bash
cd terraform/backend
terraform init
terraform apply
```

### 2. Provision everything else
```bash
cd ../infrastructure
terraform init
terraform apply
```
This creates the VPC, EKS cluster and node group, Jenkins EC2 instance, ECR repository, IAM roles, the AWS Load Balancer Controller (via Helm), CloudWatch Container Insights resources, and the SNS alerting setup. Expect the EKS cluster step alone to take 10-15 minutes.

### 3. Point kubectl at the new cluster
```bash
aws eks update-kubeconfig --region us-east-1 --name order-tracking-eks
```

### 4. Deploy the application
```bash
cd ../../kubernetes
kubectl apply -f deployment.yaml -f service.yaml -f ingress.yaml -f hpa.yaml
```

### 5. Set up Jenkins
- SSH into the Jenkins EC2 instance, retrieve the initial admin password from `/var/lib/jenkins/secrets/initialAdminPassword`
- Complete the setup wizard, create a Pipeline job pointing at this repo's `jenkins/Jenkinsfile`
- Add an `aws-creds` AWS Credentials entry in Jenkins, scoped to a dedicated least-privilege IAM user (not your account's admin credentials)
- Add a GitHub webhook pointing at `http://<jenkins-ip>:8080/github-webhook/` to trigger builds automatically on push

### 6. Confirm it's live
```bash
kubectl get ingress order-tracking-ingress
curl http://<ALB-DNS-from-above>/health
```

### Tearing it down
```bash
cd terraform/infrastructure && terraform destroy
cd ../backend && terraform destroy
```

---

## Security notes

- SSH (22) and the Jenkins UI (8080) are restricted to a single allow-listed IP via security group rules, with a separate rule permitting GitHub's published webhook IP ranges on 8080 only
- Jenkins authenticates to AWS using a dedicated `jenkins-ci` IAM user with a minimal inline policy (ECR push to this one repository, EKS describe) rather than account-admin credentials
- The ALB Controller and CloudWatch agent each use IAM Roles for Service Accounts (IRSA) rather than broad node-level permissions
- The Terraform state bucket has versioning, server-side encryption, and public access blocking enabled


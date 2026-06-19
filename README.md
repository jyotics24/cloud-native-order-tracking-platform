# Cloud-Native Order Tracking Platform

## Overview

Cloud-Native Order Tracking Platform is a production-style DevOps project that demonstrates Infrastructure as Code (IaC), containerization, CI/CD automation, Kubernetes orchestration, autoscaling, and AWS cloud services.

The application allows users to create and view orders through a web interface while running on Amazon EKS with automated deployments through Jenkins.

---

## Architecture

```text
Developer
    |
    v
GitHub Repository
    |
    v
Jenkins Pipeline (EC2)
    |
    +-------------------+
    |                   |
    v                   v
Docker Build        Terraform
    |                   |
    v                   v
Amazon ECR        AWS Infrastructure
    |
    v
Amazon EKS
    |
    v
Kubernetes Deployment
    |
    v
Service
    |
    v
AWS Load Balancer Controller
    |
    v
Application Load Balancer (ALB)
    |
    v
Order Tracking Application
```

---

## Technologies Used

### Cloud Services

* AWS EC2
* AWS EKS
* AWS ECR
* AWS IAM
* AWS VPC
* AWS Application Load Balancer (ALB)
* AWS SNS
* AWS CloudWatch

### DevOps Tools

* Terraform
* Jenkins
* Docker
* Kubernetes
* GitHub

### Application Stack

* Python
* Flask
* HTML
* CSS
* JavaScript

---

## Features

### Infrastructure as Code

* AWS infrastructure provisioned using Terraform
* Custom VPC with public and private subnets
* Internet Gateway and NAT Gateway
* IAM roles and security groups

### Containerization

* Dockerized Flask application
* Docker images stored in Amazon ECR

### CI/CD Pipeline

* GitHub webhook integration
* Automated Jenkins builds
* Docker image creation
* Push images to Amazon ECR
* Automated deployment to Amazon EKS

### Kubernetes

* Deployment
* Service
* Ingress
* Horizontal Pod Autoscaler (HPA)

### Monitoring & Alerting

* CloudWatch Alarms
* SNS Email Notifications
* CPU utilization monitoring

### Frontend

* Create Orders
* View Orders
* Health Endpoint

---

## Project Structure

```text
cloud-native-order-tracking-platform/
│
├── app/
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── static/
│   │   ├── script.js
│   │   └── style.css
│   └── templates/
│       └── index.html
│
├── jenkins/
│   └── Jenkinsfile
│
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
│
├── terraform/
│   ├── backend/
│   └── infrastructure/
│
└── README.md
```

---

## Kubernetes Autoscaling

The application uses Horizontal Pod Autoscaler (HPA).

Configuration:

* Minimum Replicas: 1
* Maximum Replicas: 5
* CPU Threshold: 70%

Load Test:

```bash
kubectl run load-generator \
--image=busybox:1.36 \
--restart=Never \
--command -- sh -c "while true; do wget -q -O- http://order-tracking-service; done"
```

Result:

```text
Replicas scaled from 1 to 5
CPU utilization exceeded 200%
```

---

## CI/CD Workflow

1. Developer pushes code to GitHub
2. GitHub webhook triggers Jenkins
3. Jenkins builds Docker image
4. Jenkins pushes image to Amazon ECR
5. Jenkins updates EKS deployment
6. Kubernetes performs rolling update
7. New version becomes available through ALB

---

## API Endpoints

### Home

```http
GET /
```

Returns the web application UI.

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "healthy"
}
```

### Create Order

```http
POST /orders
```

Request:

```json
{
  "customer": "Jyotiprakash",
  "product": "Laptop"
}
```

### Get All Orders

```http
GET /orders
```

### Get Order By ID

```http
GET /orders/{id}
```

### Update Order Status

```http
PUT /orders/{id}/status
```

---

## Monitoring & Alerting

Implemented:

* CloudWatch CPU Alarm
* SNS Email Notifications
* EC2 Instance Monitoring

Example Alarm:

* Alarm Name: OrderTrackingHighCPU
* Threshold: CPU > 80%
* Notification: SNS Email Alert

---

## Future Improvements

* Amazon RDS Integration
* DynamoDB Integration
* HTTPS using ACM and Route53
* CloudWatch Container Insights
* Prometheus & Grafana Monitoring
* GitOps with ArgoCD
* Blue/Green Deployments
* Multi-Environment Infrastructure

---

## Author

**Jyotiprakash Khuntia**

DevOps Engineer | AWS | Kubernetes | Terraform | Docker | Jenkins | CI/CD

GitHub: https://github.com/jyotics24

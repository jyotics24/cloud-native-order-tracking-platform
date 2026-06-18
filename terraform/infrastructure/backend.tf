terraform {
  backend "s3" {
    bucket         = "order-tracking-tf-state-992382782363"
    key            = "vpc/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "order-tracking-terraform-lock"
  }
}

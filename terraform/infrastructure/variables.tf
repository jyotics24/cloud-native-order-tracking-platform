variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}


variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH into Jenkins and EKS nodes"
  type        = string
  default     = "223.185.134.188/32"
}

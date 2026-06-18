resource "aws_s3_bucket" "terraform_state" {
  bucket = "order-tracking-tf-state-992382782363"

  tags = {
    Name        = "terraform-state"
    Environment = "dev"
  }
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}
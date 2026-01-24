terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
# Create the Bucket
resource "aws_s3_bucket" "my_devops_bucket" {
  bucket = "hansadi-devops-project-2026"
}

# Enable Website Hosting
resource "aws_s3_bucket_website_configuration" "hosting" {
  bucket = aws_s3_bucket.my_devops_bucket.id
  index_document {
    suffix = "index.html"
  }
}

# Make it Publicly Accessible
resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket = aws_s3_bucket.my_devops_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Add a Policy to allow everyone to see the files
resource "aws_s3_bucket_policy" "allow_public_access" {
  bucket = aws_s3_bucket.my_devops_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.my_devops_bucket.arn}/*"
      },
    ]
  })
}

# Output the Link to your terminal
output "website_url" {
  value = aws_s3_bucket_website_configuration.hosting.website_endpoint
}

# 1. Create a Security Group (The Firewall)
resource "aws_security_group" "backend_sg" {
  name = "backend_sg"
  ingress {
    from_port   = 5000 # Your Node.js port
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allows the frontend to talk to it
  }
  ingress {
    from_port   = 3000 # Frontend port
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22 # For SSH access
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create AWS Key Pair from local SSH key
resource "aws_key_pair" "taskflow_key" {
  key_name   = "taskflow-backend-key"
  public_key = file("${path.module}/taskflow-key.pub")
}

# 2. Create the EC2 Instance (The Server)
resource "aws_instance" "backend_server" {
  ami           = "ami-053b0d53c279acc90" # Ubuntu in us-east-1
  instance_type = "t3.micro" # Free Tier
  key_name      = aws_key_pair.taskflow_key.key_name
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  tags = {
    Name = "TaskFlow-Backend"
  }
}

# 3. Output the IP Address
output "backend_public_ip" {
  value = aws_instance.backend_server.public_ip
}

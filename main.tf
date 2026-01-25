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
# S3 resources removed - Frontend now runs on EC2 with backend

# 1. Create a Security Group (The Firewall)
resource "aws_security_group" "backend_sg" {
  name = "backend_sg"
  ingress {
    from_port   = 80 # Frontend on port 80 (HTTP)
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5000 # Backend API port
    to_port     = 5000
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

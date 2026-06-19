resource "aws_security_group" "jenkins_sg" {
  name        = "jenkins-sg"
  description = "Jenkins Security Group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "jenkins-sg"
  }
}

resource "aws_instance" "jenkins" {
  ami                    = "ami-00d4b620340d50fd3"
  instance_type          = "t3.micro"
  key_name               = "jenkins-key"
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
#!/bin/bash
set -e

dnf update -y

# Java 21
dnf install -y java-21-amazon-corretto

# Git
dnf install -y git

# Jenkins Repository
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Jenkins
dnf install -y jenkins
systemctl enable jenkins

# Docker
dnf install -y docker
systemctl enable docker
systemctl start docker

usermod -aG docker ec2-user

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# AWS CLI v2
dnf install -y unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip awscliv2.zip
./aws/install

# Start Jenkins after Java is installed
systemctl start jenkins

# Add Jenkins user to Docker group
usermod -aG docker jenkins

systemctl restart docker
systemctl restart jenkins
EOF

  tags = {
    Name = "jenkins-server"
  }
}
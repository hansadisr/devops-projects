# Jenkins CI/CD Pipeline Setup Guide for TaskFlow Deployment

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Jenkins Installation](#jenkins-installation)
3. [Required Plugins](#required-plugins)
4. [Credentials Configuration](#credentials-configuration)
5. [Environment Setup](#environment-setup)
6. [Pipeline Configuration](#pipeline-configuration)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- Jenkins Server (Ubuntu 20.04+ recommended)
- Docker installed on Jenkins server
- Terraform installed on Jenkins server
- Ansible installed on Jenkins server
- Minimum 4GB RAM, 2 CPU cores
- 20GB+ available disk space

### Required Accounts
- AWS Account with appropriate IAM permissions
- Docker Hub account (or AWS ECR)
- GitHub/GitLab account for source code repository

---

## Jenkins Installation

### Install Jenkins on Ubuntu

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java (Jenkins requirement)
sudo apt install -y openjdk-17-jdk

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Install Docker on Jenkins Server

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add Jenkins user to Docker group
sudo usermod -aG docker jenkins

# Restart Jenkins to apply group changes
sudo systemctl restart jenkins
```

### Install Terraform on Jenkins Server

```bash
# Download and install Terraform
wget https://releases.hashicorp.com/terraform/1.7.0/terraform_1.7.0_linux_amd64.zip
unzip terraform_1.7.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
terraform --version
```

### Install Ansible on Jenkins Server

```bash
# Install Ansible
sudo apt update
sudo apt install -y ansible python3-pip

# Install required Ansible collections
ansible-galaxy collection install community.docker
ansible-galaxy collection install community.general

# Verify installation
ansible --version
```

---

## Required Plugins

Install these plugins via **Manage Jenkins → Manage Plugins → Available**

### Essential Plugins
1. **Pipeline** - Core pipeline functionality
2. **Git** - Git integration
3. **Docker Pipeline** - Docker integration
4. **SSH Agent** - SSH key management
5. **Credentials Binding** - Secure credential handling
6. **Workspace Cleanup** - Clean workspace between builds
7. **AnsiColor** - Colored console output
8. **Timestamper** - Add timestamps to console output

### Recommended Plugins
9. **Blue Ocean** - Modern UI for pipelines
10. **Pipeline: AWS Steps** - AWS integration
11. **Terraform** - Terraform integration
12. **Ansible** - Ansible integration
13. **Email Extension** - Email notifications
14. **Slack Notification** - Slack integration

### Install via CLI (Alternative)

```bash
# Install Jenkins CLI
wget http://localhost:8080/jnlpJars/jenkins-cli.jar

# Install plugins
java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:password install-plugin \
  workflow-aggregator \
  git \
  docker-workflow \
  ssh-agent \
  credentials-binding \
  ws-cleanup \
  ansicolor \
  timestamper \
  blueocean \
  terraform \
  ansible

# Restart Jenkins
java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:password safe-restart
```

---

## Credentials Configuration

### Navigate to: **Manage Jenkins → Manage Credentials → System → Global credentials**

### 1. Docker Hub Credentials

**Type:** Username with password
- **ID:** `dockerhub-credentials`
- **Username:** Your Docker Hub username
- **Password:** Your Docker Hub password or access token
- **Description:** Docker Hub credentials for pushing images

**Create Docker Hub Access Token (Recommended):**
1. Login to Docker Hub
2. Go to Account Settings → Security → Access Tokens
3. Click "New Access Token"
4. Copy the token and use it as the password in Jenkins

### 2. AWS Credentials

**Type:** AWS Credentials
- **ID:** `aws-credentials`
- **Access Key ID:** Your AWS Access Key ID
- **Secret Access Key:** Your AWS Secret Access Key
- **Description:** AWS credentials for Terraform

**Creating AWS IAM User:**
```bash
# Required IAM permissions for this user:
# - AmazonEC2FullAccess
# - AmazonS3FullAccess
# - IAMFullAccess (if managing IAM resources)
```

**Alternative: Using AWS CLI Configuration**
```bash
# On Jenkins server, configure AWS CLI for jenkins user
sudo -u jenkins aws configure
# Enter AWS Access Key ID
# Enter AWS Secret Access Key
# Enter Default region: us-east-1
# Enter Default output format: json
```

### 3. EC2 SSH Private Key

**Type:** SSH Username with private key
- **ID:** `ec2-ssh-key`
- **Username:** `ubuntu` (for Ubuntu AMI)
- **Private Key:** Paste your SSH private key or upload key file
- **Passphrase:** If your key has a passphrase
- **Description:** SSH key for EC2 instance access

**Generate SSH Key Pair:**
```bash
# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -f taskflow-key -N ""

# This creates:
# - taskflow-key (private key - add to Jenkins credentials)
# - taskflow-key.pub (public key - used by Terraform)

# Add private key to Jenkins credentials
cat taskflow-key  # Copy this content

# Ensure public key is in your project root for Terraform
cp taskflow-key.pub /path/to/project/
```

### 4. GitHub/GitLab Access Token (Optional)

**Type:** Secret text
- **ID:** `github-token`
- **Secret:** Your GitHub Personal Access Token
- **Description:** GitHub access token for private repositories

---

## Environment Setup

### Configure Jenkins Global Environment Variables

**Navigate to:** Manage Jenkins → Configure System → Global properties → Environment variables

Add the following:

| Name | Value | Description |
|------|-------|-------------|
| `AWS_DEFAULT_REGION` | `us-east-1` | Default AWS region |
| `DOCKER_HUB_REPO` | `yourusername/taskflow` | Your Docker Hub repository |
| `JWT_SECRET` | `your-secure-jwt-secret` | JWT secret for backend |
| `TERRAFORM_VERSION` | `1.7.0` | Terraform version |

### Configure Jenkins System Settings

1. **Go to:** Manage Jenkins → Configure System

2. **Set Jenkins URL:**
   - Example: `http://your-jenkins-ip:8080`

3. **Configure Email Notifications (Optional):**
   - SMTP server: `smtp.gmail.com`
   - Use SSL: Yes
   - Port: 465
   - Add credentials for email account

4. **Set number of executors:**
   - Recommended: 2-4 based on server capacity

---

## Pipeline Configuration

### Create New Pipeline Job

1. **Navigate to:** Jenkins Dashboard → New Item
2. **Enter name:** `TaskFlow-Deployment-Pipeline`
3. **Select:** Pipeline
4. **Click:** OK

### Configure Pipeline

#### General Settings
- ✅ Check "GitHub project" (if using GitHub)
  - Project url: `https://github.com/yourusername/taskflow`

#### Build Triggers (Optional)
- ✅ Check "GitHub hook trigger for GITScm polling" (for auto-trigger on push)
- ✅ Check "Poll SCM" with schedule: `H/5 * * * *` (checks every 5 minutes)

#### Pipeline Definition
- **Definition:** Pipeline script from SCM
- **SCM:** Git
- **Repository URL:** `https://github.com/yourusername/taskflow.git`
- **Credentials:** Select your GitHub credentials (if private repo)
- **Branch Specifier:** `*/main` or `*/master`
- **Script Path:** `Jenkinsfile`

#### Pipeline Parameters
The Jenkinsfile includes parameters that will be available:
- `ACTION`: Choose between 'deploy' or 'destroy'
- `SKIP_TERRAFORM`: Skip Terraform provisioning

---

## Security Best Practices

### 1. AWS Credentials Security

**Use IAM Roles (Most Secure - Recommended for Production):**
```bash
# Attach IAM role to Jenkins EC2 instance instead of using access keys
# This eliminates the need to store credentials in Jenkins

# Create IAM role with required permissions
# Attach role to Jenkins EC2 instance
# Terraform will automatically use the instance role
```

**AWS Credentials File Method:**
```bash
# Store credentials in Jenkins server
sudo -u jenkins mkdir -p /var/lib/jenkins/.aws
sudo -u jenkins cat > /var/lib/jenkins/.aws/credentials << EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
EOF

sudo chmod 600 /var/lib/jenkins/.aws/credentials
sudo chown jenkins:jenkins /var/lib/jenkins/.aws/credentials
```

### 2. SSH Key Management

**Best Practices:**
- ✅ Use separate SSH keys for each environment (dev, staging, prod)
- ✅ Rotate SSH keys regularly (every 90 days)
- ✅ Use strong passphrases for SSH keys
- ✅ Store private keys only in Jenkins credentials
- ✅ Never commit private keys to version control

**Secure Key Storage:**
```bash
# Set proper permissions on Jenkins server
sudo chmod 600 /var/lib/jenkins/.ssh/taskflow-key
sudo chown jenkins:jenkins /var/lib/jenkins/.ssh/taskflow-key
```

### 3. Secrets Management

**Use HashiCorp Vault (Advanced):**
```groovy
// Install Vault plugin in Jenkins
// Configure Vault in Jenkins
// Reference secrets from Vault in pipeline

pipeline {
    agent any
    environment {
        VAULT_ADDR = 'https://vault.example.com'
    }
    stages {
        stage('Get Secrets') {
            steps {
                script {
                    def secrets = hashicorpVault(
                        configuration: [vaultUrl: env.VAULT_ADDR],
                        vaultSecrets: [[path: 'secret/aws', secretValues: [
                            [envVar: 'AWS_ACCESS_KEY', vaultKey: 'access_key'],
                            [envVar: 'AWS_SECRET_KEY', vaultKey: 'secret_key']
                        ]]]
                    )
                }
            }
        }
    }
}
```

**Environment-Specific Credentials:**
```groovy
// Use different credentials per environment
environment {
    PROD_CREDS = credentials('production-aws-credentials')
    DEV_CREDS = credentials('development-aws-credentials')
}
```

### 4. Credential Masking

Jenkins automatically masks credentials in console output, but ensure:
- ✅ Use credentials() binding in Jenkinsfile
- ✅ Never echo credentials
- ✅ Avoid storing secrets in environment variables that get logged

**Example of secure credential usage:**
```groovy
environment {
    // This will be masked in console output
    AWS_CREDS = credentials('aws-credentials')
}

steps {
    sh '''
        # Credentials are available as:
        # AWS_CREDS_USR (username/access key)
        # AWS_CREDS_PSW (password/secret key)
        
        # DON'T DO THIS:
        # echo $AWS_CREDS_PSW
        
        # DO THIS instead:
        aws configure set aws_access_key_id $AWS_CREDS_USR
        aws configure set aws_secret_access_key $AWS_CREDS_PSW
    '''
}
```

### 5. Jenkins Security Hardening

```bash
# Enable security features
# Go to: Manage Jenkins → Configure Global Security

# Recommended settings:
✅ Security Realm: Jenkins' own user database
✅ Authorization: Matrix-based security
✅ Prevent Cross Site Request Forgery exploits: Enable
✅ Agent protocols: Only enable JNLP4

# Install security plugins
java -jar jenkins-cli.jar -s http://localhost:8080/ install-plugin \
  matrix-auth \
  role-strategy \
  credentials-binding
```

### 6. Network Security

**Firewall Rules:**
```bash
# Allow only necessary ports
sudo ufw allow 8080/tcp  # Jenkins web UI
sudo ufw allow 22/tcp    # SSH
sudo ufw enable

# Restrict Jenkins access to specific IPs (recommended)
sudo ufw allow from YOUR_IP_ADDRESS to any port 8080
```

**Use HTTPS for Jenkins:**
```bash
# Generate SSL certificate
sudo apt install certbot
sudo certbot certonly --standalone -d jenkins.yourdomain.com

# Configure Jenkins to use SSL
# Edit /etc/default/jenkins or systemd service file
```

### 7. Audit and Monitoring

**Enable Audit Logging:**
```bash
# Install Audit Trail plugin
# Go to: Manage Jenkins → Configure System → Audit Trail
# Configure log location and patterns
```

**Monitor Jenkins:**
```bash
# Install Monitoring plugin
# Set up alerts for:
- Failed builds
- Credential access
- Configuration changes
- Suspicious activities
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Terraform Permission Denied
```bash
# Error: Error acquiring the state lock

# Solution: Delete the lock file
terraform force-unlock <LOCK_ID>

# Or remove state lock manually
rm -rf .terraform/terraform.tfstate
```

#### 2. Docker Permission Denied
```bash
# Error: permission denied while trying to connect to Docker daemon

# Solution: Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

#### 3. Ansible SSH Connection Failed
```bash
# Error: Failed to connect to the host via ssh

# Solutions:
# 1. Verify SSH key permissions
chmod 600 /path/to/private-key

# 2. Test SSH connection manually
ssh -i /path/to/key ubuntu@ec2-ip

# 3. Add to known_hosts
ssh-keyscan -H ec2-ip >> ~/.ssh/known_hosts

# 4. Use StrictHostKeyChecking=no in ansible.cfg
echo "[defaults]
host_key_checking = False" > ansible.cfg
```

#### 4. AWS Credentials Not Found
```bash
# Error: No valid credential sources found

# Solution 1: Set environment variables
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Solution 2: Configure AWS CLI
aws configure

# Solution 3: Use instance IAM role (recommended)
```

#### 5. Docker Build Failed
```bash
# Error: failed to solve with frontend dockerfile.v0

# Solution: Clear Docker cache
docker system prune -a
docker builder prune

# Rebuild
docker build --no-cache -t image-name .
```

#### 6. Port Already in Use
```bash
# Error: Bind for 0.0.0.0:5000 failed: port is already allocated

# Solution: Kill process using the port
sudo lsof -i :5000
sudo kill -9 <PID>

# Or stop container using the port
docker ps | grep 5000
docker stop <container-id>
```

### Debug Mode

**Enable verbose Terraform output:**
```groovy
sh 'TF_LOG=DEBUG terraform apply -auto-approve'
```

**Enable Ansible verbose output:**
```groovy
sh 'ansible-playbook -vvv -i hosts.ini deploy.yml'
```

**Enable Docker build debug:**
```groovy
sh 'DOCKER_BUILDKIT=1 docker build --progress=plain .'
```

---

## Additional Resources

### Official Documentation
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Docker Documentation](https://docs.docker.com/)

### Useful Commands

**Jenkins:**
```bash
# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Backup Jenkins
tar -czf jenkins-backup.tar.gz /var/lib/jenkins/
```

**Terraform:**
```bash
# Format Terraform files
terraform fmt

# Validate configuration
terraform validate

# Show current state
terraform show

# List resources
terraform state list
```

**Ansible:**
```bash
# Test connectivity
ansible all -i hosts.ini -m ping

# List hosts
ansible all -i hosts.ini --list-hosts

# Check playbook syntax
ansible-playbook deploy.yml --syntax-check
```

---

## Quick Start Checklist

- [ ] Jenkins installed and running
- [ ] Docker installed on Jenkins server
- [ ] Terraform installed on Jenkins server
- [ ] Ansible installed on Jenkins server
- [ ] All required Jenkins plugins installed
- [ ] Docker Hub credentials configured
- [ ] AWS credentials configured
- [ ] SSH key pair generated and configured
- [ ] GitHub/GitLab repository connected
- [ ] Pipeline job created
- [ ] Test deployment successful
- [ ] Security best practices implemented
- [ ] Monitoring and alerts configured

---

**Last Updated:** January 2026
**Version:** 1.0
**Maintainer:** DevOps Team

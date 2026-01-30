pipeline {
    agent any
    
    triggers {
        pollSCM('* * * * *')  // Poll GitHub every minute
    }
    
    environment {
        // Docker Hub credentials (configure in Jenkins credentials)
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_HUB_REPO = 'hansadisr/taskflow'
        
        // SSH Key for EC2 (configure in Jenkins credentials)
        EC2_SSH_KEY = credentials('ec2-ssh-key')
        
        // EC2 Instance IP (existing instance)
        EC2_IP = '13.218.98.235'
        
        // Environment variables
        IMAGE_TAG = "${BUILD_NUMBER}"
        ANSIBLE_DIR = "${WORKSPACE}"
    }
    
    parameters {
        choice(name: 'ACTION', choices: ['deploy', 'destroy'], description: 'Select action: deploy or undeploy application')
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "📥 Checking out code from repository..."
                checkout scm
            }
        }

        stage('Build Docker Images') {
            when {
                expression { params.ACTION == 'deploy' }
            }
            steps {
                echo "🐳 Building Docker images..."
                script {
                    // Build backend image
                    sh """
                        docker build -t ${DOCKER_HUB_REPO}-backend:${IMAGE_TAG} \
                                     -t ${DOCKER_HUB_REPO}-backend:latest \
                                     -f backend/Dockerfile.prod ./backend
                    """
                    
                    // Build frontend image
                    sh """
                        docker build -t ${DOCKER_HUB_REPO}-frontend:${IMAGE_TAG} \
                                     -t ${DOCKER_HUB_REPO}-frontend:latest \
                                     -f frontend/Dockerfile.prod ./frontend
                    """
                }
            }
        }

        stage('Push Docker Images') {
            when {
                expression { params.ACTION == 'deploy' }
            }
            steps {
                echo "📤 Pushing Docker images to Docker Hub..."
                script {
                    sh '''
                        echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                        
                        docker push ${DOCKER_HUB_REPO}-backend:${IMAGE_TAG}
                        docker push ${DOCKER_HUB_REPO}-backend:latest
                        
                        docker push ${DOCKER_HUB_REPO}-frontend:${IMAGE_TAG}
                        docker push ${DOCKER_HUB_REPO}-frontend:latest
                        
                        docker logout
                    '''
                }
            }
        }

        stage('Update Ansible Inventory') {
            when {
                expression { params.ACTION == 'deploy' }
            }
            steps {
                echo "📝 Updating Ansible inventory with EC2 IP..."
                script {
                    sh '''
                        cat > hosts.ini << EOF
[ec2_instances]
taskflow-server ansible_host=${EC2_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${EC2_SSH_KEY} ansible_ssh_common_args='-o StrictHostKeyChecking=no'

[ec2_instances:vars]
docker_hub_repo=${DOCKER_HUB_REPO}
image_tag=${IMAGE_TAG}
EOF
                        
                        echo "✅ Ansible inventory updated"
                        cat hosts.ini
                    '''
                }
            }
        }

        stage('Configure EC2 with Ansible') {
            when {
                expression { params.ACTION == 'deploy' }
            }
            steps {
                echo "⚙️ Configuring EC2 instance with Ansible..."
                script {
                    sh '''
                        # Wait for SSH to be available
                        echo "Waiting for SSH to be available on ${EC2_IP}..."
                        
                        for i in {1..10}; do
                            if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i ${EC2_SSH_KEY} ubuntu@${EC2_IP} 'echo SSH Ready'; then
                                echo "✅ SSH connection established"
                                break
                            fi
                            echo "Attempt $i/10: SSH not ready yet, waiting..."
                            sleep 5
                        done
                        
                        # Run Ansible playbook
                        ansible-playbook -i hosts.ini deploy.yml -v
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            when {
                expression { params.ACTION == 'deploy' }
            }
            steps {
                echo "✅ Verifying deployment..."
                script {
                    sh '''
                        echo "🌐 Application URLs:"
                        echo "Frontend: http://${EC2_IP}:3000"
                        echo "Backend API: http://${EC2_IP}:5000"
                        echo ""
                        
                        # Check if services are running
                        echo "Checking backend health..."
                        for i in {1..10}; do
                            if curl -f -s http://${EC2_IP}:5000/health || curl -f -s http://${EC2_IP}:5000; then
                                echo "✅ Backend is responding"
                                break
                            fi
                            echo "Attempt $i/10: Backend not ready yet..."
                            sleep 5
                        done
                    '''
                }
            }
        }

        stage('Stop Application') {
            when {
                expression { params.ACTION == 'destroy' }
            }
            steps {
                echo "🛑 Stopping application on EC2..."
                script {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -i ${EC2_SSH_KEY} ubuntu@${EC2_IP} 'docker stop \$(docker ps -aq) || true; docker rm \$(docker ps -aq) || true'
                        echo "✅ Application stopped"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo """
            ✅ ========================================
            ✅ DEPLOYMENT SUCCESSFUL!
            ✅ ========================================
            Frontend: http://${EC2_IP}:3000
            Backend: http://${EC2_IP}:5000
            ✅ ========================================
            """
        }
        failure {
            echo "❌ Pipeline failed! Check the logs above for details."
        }
        always {
            echo "🧹 Cleaning up workspace..."
        }
    }
}
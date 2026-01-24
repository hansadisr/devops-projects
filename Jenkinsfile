pipeline {
    agent any

    stages {
        stage('Cleanup Old Containers') {
            steps {
                echo "🧹 Cleaning old containers..."
                sh '''
                    docker compose down --volumes --remove-orphans || true
                    docker rm -f myapp-mongo myapp-backend myapp-frontend 2>/dev/null || true
                    docker volume prune -f || true
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        always {
            echo "Pipeline finished!"
        }
    }
}
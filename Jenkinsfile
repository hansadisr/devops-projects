pipeline {
    agent any

    stages {
        stage('Cleanup Old Containers') {
            steps {
                echo "🧹 Cleaning old containers..."
                sh '''
                    # Stop any containers using the same ports
                    docker ps -a -q --filter "publish=5000" | xargs -r docker stop || true
                    docker ps -a -q --filter "publish=5000" | xargs -r docker rm || true
                    docker ps -a -q --filter "publish=3000" | xargs -r docker stop || true
                    docker ps -a -q --filter "publish=3000" | xargs -r docker rm || true
                    
                    # Clean up compose stack
                    docker compose down --volumes --remove-orphans || true
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
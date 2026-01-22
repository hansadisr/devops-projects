pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/hansadisr/devops-projects.git'
                    ]],
                    extensions: [[
                        $class: 'CloneOption',
                        shallow: true,
                        depth: 1,
                        timeout: 30
                    ]]
                ])
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Run Containers') {
            steps {
                sh '''
                    # Clean up any existing project containers/volumes (ignores errors if none exist)
                    docker compose -p online-task-manager-pipeline down --volumes --remove-orphans || true
                    
                    # Prune dangling resources for a fresh start
                    docker system prune -f || true
                    
                    # Start in detached mode
                    docker compose up -d
                    
                    # Optional: Wait a bit and check if services are healthy
                    sleep 10
                    docker compose ps  # Log status for debugging
                '''
            }
        }
        
        // Optional: Add a Test/Verify stage
        stage('Verify Services') {
            steps {
                sh '''
                    # Example: Check if frontend responds (adjust URL/port as per your compose)
                    curl -f http://localhost:3000 || echo "Frontend check failed"
                    
                    # Or check Mongo logs briefly
                    docker compose logs --tail=5 mongo
                '''
            }
        }
    }
    
    post {
        always {
            sh '''
                # Always clean up to free ports/resources
                docker compose -p online-task-manager-pipeline down --volumes || true
                docker system prune -f || true
            '''
        }
        success {
            echo 'Pipeline succeeded! Services ran successfully.'
        }
        failure {
            echo 'Pipeline failed—check logs for details.'
        }
    }
}
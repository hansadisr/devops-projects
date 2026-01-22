pipeline {
    agent any

    stages {
        stage('Clone Repo') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/hansadisr/devops-projects.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
}



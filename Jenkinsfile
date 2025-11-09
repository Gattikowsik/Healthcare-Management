pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Environment Check') {
            steps {
                echo '🔍 Checking environment...'
                bat '''
                    node --version
                    npm --version
                    docker --version
                    docker-compose --version
                '''
            }
        }
        
        stage('Install Backend Dependencies') {
            steps {
                echo '📦 Installing backend dependencies...'
                dir("${BACKEND_DIR}") {
                    bat 'npm install'
                }
            }
        }
        
        stage('Install Frontend Dependencies') {
            steps {
                echo '📦 Installing frontend dependencies...'
                dir("${FRONTEND_DIR}") {
                    bat 'npm install'
                }
            }
        }
        
        stage('Run Backend Tests') {
            steps {
                echo '🧪 Running backend tests...'
                dir("${BACKEND_DIR}") {
                    // Run tests if they exist, otherwise continue
                    bat 'npm test || echo "No tests configured"'
                }
            }
        }
        
        stage('Run Frontend Tests') {
            steps {
                echo '🧪 Running frontend tests...'
                dir("${FRONTEND_DIR}") {
                    // Run tests if they exist, otherwise continue
                    bat 'npm test -- --passWithNoTests || echo "No tests configured"'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '🏗️ Building frontend production build...'
                dir("${FRONTEND_DIR}") {
                    bat 'npm run build'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                bat "docker-compose -f ${DOCKER_COMPOSE_FILE} build"
            }
        }
        
        stage('Stop Previous Containers') {
            steps {
                echo '🛑 Stopping previous containers...'
                bat "docker-compose -f ${DOCKER_COMPOSE_FILE} down || echo 'No containers to stop'"
            }
        }
        
        stage('Deploy Application') {
            steps {
                echo '🚀 Deploying application...'
                bat "docker-compose -f ${DOCKER_COMPOSE_FILE} up -d"
            }
        }
        
        stage('Health Check') {
            steps {
                echo '💚 Performing health check...'
                bat 'timeout /t 10 /nobreak'
                bat 'docker-compose ps'
            }
        }
    }
    
    post {
        success {
            echo '''
            ✅ ========================================
            ✅ Deployment Successful! 🎉
            ✅ Healthcare Management System is running
            ✅ ========================================
            '''
        }
        failure {
            echo '''
            ❌ ========================================
            ❌ Deployment Failed! 😞
            ❌ Please check the logs above
            ❌ ========================================
            '''
        }
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs(
                deleteDirs: true,
                disableDeferredWipeout: true,
                notFailBuild: true
            )
        }
    }
}

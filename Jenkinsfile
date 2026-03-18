pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = '3meenosez'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/Nanstither/microservices-app.git'
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Build User Service') {
                    steps {
                        script {
                            docker.build("${DOCKER_HUB_USER}/user-service:${BUILD_NUMBER}", "./user-service")
                        }
                    }
                }
                stage('Build Order Service') {
                    steps {
                        script {
                            docker.build("${DOCKER_HUB_USER}/order-service:${BUILD_NUMBER}", "./order-service")
                        }
                    }
                }
                stage('Build Gateway') {
                    steps {
                        script {
                            docker.build("${DOCKER_HUB_USER}/gateway:${BUILD_NUMBER}", "./gateway")
                        }
                    }
                }
            }
        }
        
	stage('Test Services') {
	    parallel {
	        stage('Test User Service') {
	            steps {
	                script {
	                    sh '''
	                        # Запускаем контейнер с пробросом порта
	                        docker run -d -p 5000:5000 --name test-user ${DOCKER_HUB_USER}/user-service:${BUILD_NUMBER}
	                        
	                        # Ждём 15 секунд и делаем 3 попытки с интервалом
	                        for i in 1 2 3; do
	                            sleep 5
	                            if curl -sf http://localhost:5000/health; then
	                                echo "✓ User service is healthy"
	                                docker stop test-user && docker rm test-user
	                                exit 0
	                            fi
	                            echo "⏳ Attempt $i failed, retrying..."
	                        done
	                        
	                        # Если все попытки провалились
	                        docker logs test-user
	                        docker stop test-user && docker rm test-user
	                        exit 1
	                    '''
	                }
	            }
	        }
	        stage('Test Order Service') {
	            steps {
	                script {
	                    sh '''
	                        docker run -d -p 3000:3000 --name test-order ${DOCKER_HUB_USER}/order-service:${BUILD_NUMBER}
	                        
	                        for i in 1 2 3; do
	                            sleep 5
	                            if curl -sf http://localhost:3000/health; then
	                                echo "✓ Order service is healthy"
	                                docker stop test-order && docker rm test-order
	                                exit 0
	                            fi
	                            echo "⏳ Attempt $i failed, retrying..."
	                        done
	                        
	                        docker logs test-order
	                        docker stop test-order && docker rm test-order
	                        exit 1
	                    '''
	                }
	            }
	        }
	    }
	}        
        stage('Push Images') {
            parallel {
                stage('Push User Service') {
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                                docker.image("${DOCKER_HUB_USER}/user-service:${BUILD_NUMBER}").push()
                                docker.image("${DOCKER_HUB_USER}/user-service:latest").push()
                            }
                        }
                    }
                }
                stage('Push Order Service') {
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                                docker.image("${DOCKER_HUB_USER}/order-service:${BUILD_NUMBER}").push()
                                docker.image("${DOCKER_HUB_USER}/order-service:latest").push()
                            }
                        }
                    }
                }
                stage('Push Gateway') {
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                                docker.image("${DOCKER_HUB_USER}/gateway:${BUILD_NUMBER}").push()
                                docker.image("${DOCKER_HUB_USER}/gateway:latest").push()
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh '''
                        docker compose down || true
                        docker compose up -d
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Все микросервисы успешно развернуты!'
        }
        failure {
            echo 'Ошибка в одном из сервисов!'
            sh 'docker compose down'
        }
    }
}


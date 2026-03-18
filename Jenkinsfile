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
	                        # 1. Принудительно удаляем старые контейнеры (если есть)
	                        docker rm -f test-user || true
	                        
	                        # 2. Запускаем новый контейнер с пробросом порта
	                        docker run -d -p 5000:5000 --name test-user ${DOCKER_HUB_USER}/user-service:${BUILD_NUMBER}
	                        
	                        # 3. Ждём и проверяем здоровье (3 попытки по 5 секунд)
	                        for i in 1 2 3; do
	                            sleep 5
	                            if curl -sf http://localhost:5000/health; then
	                                echo "✓ User service is healthy"
	                                docker rm -f test-user
	                                exit 0
	                            fi
	                            echo "⏳ Attempt $i failed, retrying..."
	                        done
	                        
	                        # 4. Если все попытки провалились — показываем логи и ошибка
	                        docker logs test-user
	                        docker rm -f test-user
	                        exit 1
	                    '''
	                }
	            }
	        }
	        stage('Test Order Service') {
	            steps {
	                script {
	                    sh '''
	                        docker rm -f test-order || true
	                        
	                        docker run -d -p 3000:3000 --name test-order ${DOCKER_HUB_USER}/order-service:${BUILD_NUMBER}
	                        
	                        for i in 1 2 3; do
	                            sleep 5
	                            if curl -sf http://localhost:3000/health; then
	                                echo "✓ Order service is healthy"
	                                docker rm -f test-order
	                                exit 0
	                            fi
	                            echo "⏳ Attempt $i failed, retrying..."
	                        done
	                        
	                        docker logs test-order
	                        docker rm -f test-order
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
	                        def image = docker.image("${DOCKER_HUB_USER}/user-service:${BUILD_NUMBER}")
	                        image.push()
	                        // Создаём тег latest и пушим его
	                        sh "docker tag ${DOCKER_HUB_USER}/user-service:${BUILD_NUMBER} ${DOCKER_HUB_USER}/user-service:latest"
	                        docker.image("${DOCKER_HUB_USER}/user-service:latest").push()
	                    }
	                }
	            }
	        }
	        stage('Push Order Service') {
	            steps {
	                script {
	                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
	                        def image = docker.image("${DOCKER_HUB_USER}/order-service:${BUILD_NUMBER}")
	                        image.push()
	                        sh "docker tag ${DOCKER_HUB_USER}/order-service:${BUILD_NUMBER} ${DOCKER_HUB_USER}/order-service:latest"
	                        docker.image("${DOCKER_HUB_USER}/order-service:latest").push()
	                    }
	                }
	            }
	        }
	        stage('Push Gateway') {
	            steps {
	                script {
	                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
	                        def image = docker.image("${DOCKER_HUB_USER}/gateway:${BUILD_NUMBER}")
	                        image.push()
	                        sh "docker tag ${DOCKER_HUB_USER}/gateway:${BUILD_NUMBER} ${DOCKER_HUB_USER}/gateway:latest"
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
			sleep 10
	                curl -sf http://localhost:8085/health || echo "Warning: health check failed"
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


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
                                docker run -d --name test-user ${DOCKER_HUB_USER}/user-service:${BUILD_NUMBER}
                                sleep 5
                                curl -f http://localhost:5000/health || exit 1
                                docker stop test-user && docker rm test-user
                            '''
                        }
                    }
                }
                stage('Test Order Service') {
                    steps {
                        script {
                            sh '''
                                docker run -d --name test-order ${DOCKER_HUB_USER}/order-service:${BUILD_NUMBER}
                                sleep 5
                                curl -f http://localhost:3000/health || exit 1
                                docker stop test-order && docker rm test-order
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


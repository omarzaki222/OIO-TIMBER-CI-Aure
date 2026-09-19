// OIO WOOD & TIMBER — Azure CI (Jenkins)
// Repo: https://github.com/omarzaki222/OIO-TIMBER-CI-Aure.git
// Registry: oioazureregistry.azurecr.io
//
// Jenkins credentials (create in UI — never commit):
//   acr-oio       — Username/password  (ACR admin user for oioazureregistry)
//   github-oio    — GitHub PAT         (checkout / webhooks; optional if public)
//   git-cd-push   — GitHub PAT         (push to OIO-TIMBER-CD-azure)
//
// Expected checkout layout (repo root):
//   application/{backend,frontend,admin-panel}
//   CI/Jenkinsfile  OR  Jenkinsfile at root (this file)
//
// Job script path when using the monorepo: CI/Jenkinsfile
// Job script path when using OIO-TIMBER-CI-Aure with this file at root: Jenkinsfile

pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  nodeSelector:
    kubernetes.io/os: linux
  containers:
    - name: python
      image: python:3.12-slim-bookworm
      command: ["sleep"]
      args: ["infinity"]
      tty: true
    - name: node
      image: node:22-bookworm
      command: ["sleep"]
      args: ["infinity"]
      tty: true
    - name: docker
      image: docker:27-cli
      command: ["sleep"]
      args: ["infinity"]
      tty: true
      env:
        - name: DOCKER_HOST
          value: tcp://localhost:2375
    - name: dind
      image: docker:27-dind
      securityContext:
        privileged: true
      env:
        - name: DOCKER_TLS_CERTDIR
          value: ""
    - name: git
      image: alpine/git:2.45.2
      command: ["sleep"]
      args: ["infinity"]
      tty: true
'''
        }
    }

    parameters {
        booleanParam(name: 'PUSH_IMAGES', defaultValue: false, description: 'Force image push on non-main branches')
        string(name: 'API_PUBLIC_URL', defaultValue: 'http://api.20.127.183.78.nip.io', description: 'NEXT_PUBLIC_API_URL baked into frontend/admin (origin only; clients append /api/v1)')
    }

    environment {
        ACR_LOGIN_SERVER = 'oioazureregistry.azurecr.io'
        IMAGE_TAG        = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
        CD_REPO_URL      = 'https://github.com/omarzaki222/OIO-TIMBER-CD-azure.git'
        CD_BRANCH        = 'main'
        CD_KUSTOMIZE     = 'environments/azure/kustomization.yaml'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test backend') {
            steps {
                container('python') {
                    dir('application/backend') {
                        sh '''
                            pip install --quiet fastapi "uvicorn[standard]" "sqlalchemy>=2" alembic pydantic pydantic-settings \
                                email-validator argon2-cffi PyJWT python-multipart "psycopg[binary]" pytest httpx gunicorn
                            PYTHONPATH=. pytest -q
                        '''
                    }
                }
            }
        }

        stage('Test frontend') {
            steps {
                container('node') {
                    dir('application/frontend') {
                        sh '''
                            npm ci
                            npm test
                            npm run typecheck
                            npm run lint
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Test admin') {
            steps {
                container('node') {
                    dir('application/admin-panel') {
                        sh '''
                            npm ci
                            npm test
                            npm run typecheck
                            npm run lint
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Build & push images to ACR') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    expression { return params.PUSH_IMAGES == true }
                }
            }
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: 'acr-oio',
                        usernameVariable: 'ACR_USER',
                        passwordVariable: 'ACR_PASS'
                    )]) {
                        sh '''
                            set -euo pipefail
                            echo "$ACR_PASS" | docker login "$ACR_LOGIN_SERVER" -u "$ACR_USER" --password-stdin

                            docker build -t ${ACR_LOGIN_SERVER}/oio/backend:${IMAGE_TAG} \
                                         -t ${ACR_LOGIN_SERVER}/oio/backend:latest \
                                         application/backend
                            docker push ${ACR_LOGIN_SERVER}/oio/backend:${IMAGE_TAG}
                            docker push ${ACR_LOGIN_SERVER}/oio/backend:latest

                            docker build -t ${ACR_LOGIN_SERVER}/oio/frontend:${IMAGE_TAG} \
                                         -t ${ACR_LOGIN_SERVER}/oio/frontend:latest \
                                         --build-arg NEXT_PUBLIC_API_URL=${API_PUBLIC_URL} \
                                         application/frontend
                            docker push ${ACR_LOGIN_SERVER}/oio/frontend:${IMAGE_TAG}
                            docker push ${ACR_LOGIN_SERVER}/oio/frontend:latest

                            docker build -t ${ACR_LOGIN_SERVER}/oio/admin:${IMAGE_TAG} \
                                         -t ${ACR_LOGIN_SERVER}/oio/admin:latest \
                                         --build-arg NEXT_PUBLIC_API_URL=${API_PUBLIC_URL} \
                                         application/admin-panel
                            docker push ${ACR_LOGIN_SERVER}/oio/admin:${IMAGE_TAG}
                            docker push ${ACR_LOGIN_SERVER}/oio/admin:latest
                        '''
                    }
                }
            }
        }

        stage('Update CD repo image tags') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    expression { return params.PUSH_IMAGES == true }
                }
            }
            steps {
                container('git') {
                    withCredentials([usernamePassword(
                        credentialsId: 'git-cd-push',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        sh '''
                            set -eu
                            WORKDIR=$(mktemp -d)
                            AUTH_URL="https://${GIT_USER}:${GIT_TOKEN}@github.com/omarzaki222/OIO-TIMBER-CD-azure.git"

                            git clone --depth 1 --branch "${CD_BRANCH}" "${AUTH_URL}" "${WORKDIR}/cd"
                            cd "${WORKDIR}/cd"
                            test -f "${CD_KUSTOMIZE}"

                            awk -v tag="${IMAGE_TAG}" '
                              $0 ~ /newName: oioazureregistry.azurecr.io\\/oio\\/(backend|frontend|admin)/ {
                                print
                                if ((getline nl) > 0) {
                                  if (nl ~ /newTag:/) { print "    newTag: \\"" tag "\\""; next }
                                  print nl
                                }
                                next
                              }
                              { print }
                            ' "${CD_KUSTOMIZE}" > "${CD_KUSTOMIZE}.tmp"
                            mv "${CD_KUSTOMIZE}.tmp" "${CD_KUSTOMIZE}"

                            git config user.email "jenkins-ci@oio-timber.local"
                            git config user.name "Jenkins CI Azure"
                            git add "${CD_KUSTOMIZE}"
                            if git diff --cached --quiet; then
                              echo "No CD tag changes to commit"
                            else
                              git commit -m "ci: bump oio images to ${IMAGE_TAG}"
                              git push origin "HEAD:${CD_BRANCH}"
                            fi
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "CI OK — images ${ACR_LOGIN_SERVER}/oio/*:${IMAGE_TAG}"
        }
        failure {
            echo 'CI failed — check tests, ACR login (acr-oio), or CD push (git-cd-push).'
        }
    }
}

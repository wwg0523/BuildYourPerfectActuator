# Synology Container Manager 배포 가이드

## 개요
Synology NAS의 Container Manager에서 직접 Docker 컨테이너를 생성할 때 환경 변수를 통해 설정합니다.

## 배포 단계

### 1️⃣ 이미지 빌드 (옵션)
NAS에서 직접 이미지를 빌드하거나, 미리 빌드된 이미지를 사용할 수 있습니다.

### 2️⃣ Container Manager에서 컨테이너 생성

#### Backend 환경 변수 설정
Container Manager에서 다음 환경 변수를 설정합니다:

```
DB_USER=postgres
DB_HOST=actuator-db        # NAS 내부 데이터베이스 호스트
DB_NAME=sacrp_production
DB_PASS=1209
DB_PORT=5432
PORT=4004
APP_EMAIL=whwlsgh0523@gmail.com
APP_PASS=invb xoqc sqtx qeyw
ANALYTICS_PASSWORD=admin123
NODE_ENV=production
FRONTEND_URL=https://pillar01.synology.me:5005
```

#### Frontend 환경 변수 설정
```
REACT_APP_BACKEND_URL=http://pillar01.synology.me:4004
REACT_APP_ENCRYPTION_KEY=7b9c3f2a1e8d4c6b7a9f2e3d5c8b1a4f9e2d7c6b3a1f4e8d9c2b7a3f1e6d5c8b
REACT_APP_ANALYTICS_PASSWORD=admin123
REACT_APP_API_NINJAS_KEY=07985mcrJJSUNw3tIc2EqQ==iR7ZvtmkOAFDNndg
```

### 3️⃣ 네트워크 설정
- Backend와 Frontend, Database가 같은 Docker 네트워크에 연결되어야 합니다.
- Container Manager에서 `actuator-network` 같은 커스텀 네트워크를 생성하고 할당합니다.

### 4️⃣ 포트 매핑
- Frontend: `5005:5005`
- Backend: `4004:4004`
- Database: `5432:5432` (내부용) 또는 `5432:5432` (외부 접근 필요시)

### 5️⃣ 볼륨 마운트
Database 데이터 보존을 위해 볼륨을 마운트합니다:
```
/volume1/build-your-perfect-actuator/actuator-db-data -> /var/lib/postgresql/data
```

## 로컬 개발 환경 (로컬 머신)

로컬에서 Docker Compose로 실행:
```bash
docker-compose up -d --build
```

## NAS 배포 (NAS 머신)

### 방법 1: Docker Compose 파일 사용 (권장)
```bash
docker-compose -f docker-compose.nas.yaml up -d --build
```

### 방법 2: Container Manager UI 사용
1. Registry에서 이미지 빌드 또는 가져오기
2. Container 생성 시 위의 환경 변수 설정
3. 네트워크, 포트, 볼륨 설정
4. 시작

## 문제 해결

### Backend가 localhost로 연결되는 경우
✅ 컨테이너 환경 변수 확인:
```bash
docker exec actuator-back env | grep DB_
```

### Frontend가 localhost로 연결되는 경우
✅ 빌드 로그 확인 - .env 파일이 올바르게 생성되었는지 확인
```bash
docker logs actuator-front
```

### 데이터베이스 연결 실패
✅ 데이터베이스 컨테이너가 같은 네트워크에 있는지 확인
✅ `DB_HOST=actuator-db` (컨테이너명)으로 설정

## 이점
- ✅ 로컬과 NAS에서 동일한 Dockerfile 사용 가능
- ✅ 환경 변수만 변경으로 쉬운 전환
- ✅ .env 파일을 NAS에 커밋할 필요 없음
- ✅ Container Manager UI에서 직관적 관리 가능

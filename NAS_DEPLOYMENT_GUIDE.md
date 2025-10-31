# 🚀 NAS 배포 가이드 (Synology & 기타 NAS)

## 📋 사전 준비 사항

### 1. NAS에 필수 프로그램 설치
- **Docker**: NAS에서 Docker 패키지 설치
- **Git** (옵션): 프로젝트 클론용

### 2. NAS 폴더 구조 생성
```
/volume1/build-your-perfect-actuator/
├── docker-compose.prod.yaml
├── .env
├── actuator-back/
├── actuator-front/
├── actuator-db-data/
└── sql/
    └── CREATE_TABLES.sql
```

---

## 🔧 Step 1: 프로젝트 준비

### 옵션 A: GitHub에서 클론 (권장)
```bash
# NAS SSH 접속
ssh admin@nas-ip

# 프로젝트 디렉토리 이동
cd /volume1

# 프로젝트 클론
git clone https://github.com/wwg0523/BuildYourPerfectActuator.git build-your-perfect-actuator
cd build-your-perfect-actuator
```

### 옵션 B: 파일 복사
Windows에서 SSH 또는 SMB로 프로젝트 폴더를 NAS에 복사

---

## 🌍 Step 2: 환경 설정

### `.env` 파일 생성
```bash
cd /volume1/build-your-perfect-actuator

# .env 파일 생성
cat > .env << 'EOF'
# Database
DB_HOST=actuator-db
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=1209
DB_NAME=actuator_game

# Backend
API_PORT=4004
NODE_ENV=production

# Frontend
REACT_APP_BACKEND_URL=http://NAS-IP:4004
PORT=5005

# Email (선택사항)
SENDGRID_API_KEY=
EOF
```

**주의**: `REACT_APP_BACKEND_URL`을 NAS의 실제 IP로 변경
```bash
# 예: NAS IP가 192.168.1.100인 경우
REACT_APP_BACKEND_URL=http://192.168.1.100:4004
```

---

## 🐳 Step 3: Docker 이미지 빌드

### 전체 빌드 (처음 배포 시)
```bash
cd /volume1/build-your-perfect-actuator

# 모든 서비스 빌드 및 시작
docker-compose -f docker-compose.prod.yaml up --build -d
```

**예상 시간**: 5-10분 (인터넷 속도에 따라)

### 상태 확인
```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yaml ps

# 예상 출력:
# NAME             STATUS              PORTS
# actuator-db      Up (healthy)        0.0.0.0:5433->5433/tcp
# actuator-back    Up (healthy)        0.0.0.0:4004->4004/tcp
# actuator-front   Up (healthy)        0.0.0.0:5005->5005/tcp
```

---

## 📱 Step 4: 웹 접속

### 웹 브라우저에서 접속
```
http://NAS-IP:5005
```

예시:
- NAS IP가 `192.168.1.100`인 경우: `http://192.168.1.100:5005`
- 또는 `http://nas-hostname.local:5005`

### 포트 확인
| 서비스 | 포트 | 용도 |
|--------|------|------|
| Frontend | 5005 | React 웹 앱 |
| Backend API | 4004 | API 서버 |
| Database | 5433 | PostgreSQL |

---

## 💾 Step 5: 데이터베이스 초기화

### 자동 초기화 (초첫 시작 시)
`docker-compose.prod.yaml`에서 SQL 초기화 스크립트가 자동 실행됨

```sql
-- 자동 생성되는 테이블들:
CREATE TABLE game_users (...)
CREATE TABLE leaderboard_entries (...)
CREATE TABLE email_logs (...)
CREATE TABLE analytics (...)
CREATE VIEW daily_leaderboard AS (...)
```

### 수동 초기화 (필요시)
```bash
# 데이터베이스 접속
docker exec -it actuator-db psql -U postgres -d actuator_game

# SQL 스크립트 실행
\i /docker-entrypoint-initdb.d/01-init.sql

# 나가기
\q
```

---

## 🔄 이후 업데이트 (코드 변경 시)

### 새 코드 배포
```bash
cd /volume1/build-your-perfect-actuator

# 최신 코드 받기
git pull origin main

# 서비스 다시 빌드
docker-compose -f docker-compose.prod.yaml up --build -d
```

### 변경 없이 재시작
```bash
# 재시작 (코드 변경 없음)
docker-compose -f docker-compose.prod.yaml restart

# 또는
docker-compose -f docker-compose.prod.yaml down
docker-compose -f docker-compose.prod.yaml up -d
```

---

## 📊 로그 확인

### 실시간 로그 보기
```bash
# 모든 서비스 로그
docker-compose -f docker-compose.prod.yaml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yaml logs -f backend
docker-compose -f docker-compose.prod.yaml logs -f frontend
docker-compose -f docker-compose.prod.yaml logs -f actuator-db
```

### 로그 저장
```bash
# 파일로 저장
docker-compose -f docker-compose.prod.yaml logs > deployment.log

# 마지막 100줄
docker-compose -f docker-compose.prod.yaml logs --tail=100
```

---

## 🛠️ 문제 해결

### 포트 충돌
포트가 이미 사용 중인 경우, `docker-compose.prod.yaml`에서 포트 변경:
```yaml
ports:
  - "8080:5005"  # 5005 → 8080으로 변경
```

### 데이터베이스 연결 실패
```bash
# 데이터베이스 상태 확인
docker exec actuator-db pg_isready -U postgres -p 5433

# 데이터베이스 재시작
docker-compose -f docker-compose.prod.yaml restart actuator-db
```

### 메모리 부족
NAS 재부팅 후 서비스가 시작되지 않는 경우:
```bash
# 컨테이너 정리
docker-compose -f docker-compose.prod.yaml down
docker system prune -a

# 다시 시작
docker-compose -f docker-compose.prod.yaml up -d
```

---

## 🔒 보안 설정 (권장)

### 1. 데이터베이스 암호 변경
```bash
# .env 파일에서 변경
DB_PASSWORD=your-secure-password

# 데이터베이스 암호 업데이트
docker exec -it actuator-db psql -U postgres -d actuator_game
ALTER USER postgres WITH PASSWORD 'your-secure-password';
```

### 2. SendGrid API 키 설정 (이메일 발송용)
```bash
# .env 파일에 추가
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# 서비스 재시작
docker-compose -f docker-compose.prod.yaml up -d
```

### 3. 방화벽 설정
외부에서 데이터베이스 포트(5433) 접근 방지:
```bash
# 내부 네트워크만 허용
# NAS 방화벽 설정에서 5433 포트 제한
```

---

## 📈 성능 최적화

### 1. 데이터베이스 백업
```bash
# 주기적 백업 (매일 3시)
# NAS 스케줄 작업에 추가:
0 3 * * * docker exec actuator-db pg_dump -U postgres actuator_game > /volume1/backup/db_$(date +\%Y\%m\%d).sql
```

### 2. 로그 로테이션
```bash
# docker-compose.prod.yaml에 추가
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## ✅ 배포 체크리스트

- [ ] Docker 설치 확인
- [ ] 프로젝트 폴더 생성 (`/volume1/build-your-perfect-actuator/`)
- [ ] `.env` 파일 생성 (NAS IP 수정 확인)
- [ ] `docker-compose -f docker-compose.prod.yaml up --build -d` 실행
- [ ] `docker-compose -f docker-compose.prod.yaml ps` 확인 (모두 Up)
- [ ] 웹 브라우저에서 `http://NAS-IP:5005` 접속 확인
- [ ] 게임 실행 테스트
- [ ] 리더보드 확인
- [ ] 결과 이메일 테스트 (옵션)

---

## 🆘 긴급 상황 처리

### 모든 서비스 중지
```bash
docker-compose -f docker-compose.prod.yaml down
```

### 데이터 초기화 (주의!)
```bash
# 모든 컨테이너 및 볼륨 제거
docker-compose -f docker-compose.prod.yaml down -v

# 다시 시작 (초기 상태)
docker-compose -f docker-compose.prod.yaml up --build -d
```

### 전체 시스템 점검
```bash
# 컨테이너 상태
docker ps -a

# 디스크 사용량
df -h /volume1

# 메모리 사용량
docker stats
```

---

## 📞 지원

배포 중 문제가 발생하면 로그를 저장하여 공유:
```bash
docker-compose -f docker-compose.prod.yaml logs > deployment_error.log
```

---

**마지막 업데이트**: 2025년 10월 31일
**버전**: v1.0

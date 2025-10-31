# 🚀 NAS 배포 빠른 시작 가이드

## 📋 5분 안에 배포하기

### Step 1: 프로젝트 복사
NAS에 프로젝트 폴더 복사:
```
/volume1/build-your-perfect-actuator/
```

### Step 2: 환경 설정
`.env` 파일 생성 (`.env.example` 복사):
```bash
cp .env.example .env
```

**중요**: `.env` 파일에서 다음 수정:
```env
# NAS의 실제 IP로 변경 (예: 192.168.1.100)
REACT_APP_BACKEND_URL=http://192.168.1.100:4004
```

### Step 3: 배포 실행
```bash
# Linux/Mac
bash deploy.sh

# Windows
deploy.bat
```

### Step 4: 브라우저 접속
```
http://192.168.1.100:5005
```

---

## 🎯 주요 명령어

### 상태 확인
```bash
docker-compose -f docker-compose.prod.yaml ps
```

### 로그 확인
```bash
docker-compose -f docker-compose.prod.yaml logs -f
```

### 서비스 재시작
```bash
docker-compose -f docker-compose.prod.yaml restart
```

### 서비스 중지
```bash
docker-compose -f docker-compose.prod.yaml down
```

### 서비스 시작
```bash
docker-compose -f docker-compose.prod.yaml up -d
```

---

## 🔌 포트 정보

| 서비스 | 포트 | 기능 |
|--------|------|------|
| **Frontend** | 5005 | 웹 게임 |
| **Backend** | 4004 | API 서버 |
| **Database** | 5433 | PostgreSQL |

---

## 🆘 문제 해결

### Q: 접속이 안 됨
**A**: 
1. NAS IP 확인: `http://192.168.1.100:5005` (IP 수정)
2. 컨테이너 상태 확인: `docker-compose -f docker-compose.prod.yaml ps`
3. 로그 확인: `docker-compose -f docker-compose.prod.yaml logs`

### Q: 포트가 사용 중
**A**: `docker-compose.prod.yaml`에서 포트 변경
```yaml
ports:
  - "8080:5005"  # 5005를 8080으로 변경
```

### Q: 데이터베이스 오류
**A**: 
```bash
docker-compose -f docker-compose.prod.yaml restart actuator-db
```

---

## 💾 데이터 백업

### 데이터베이스 백업
```bash
docker exec actuator-db pg_dump -U postgres actuator_game > backup.sql
```

### 데이터 복원
```bash
docker exec -i actuator-db psql -U postgres actuator_game < backup.sql
```

---

## 🔄 업데이트

새 버전 배포:
```bash
git pull origin main
docker-compose -f docker-compose.prod.yaml up --build -d
```

---

## 📞 필요한 정보

배포 시 NAS에 필요한 정보:
- ✅ Docker 설치
- ✅ 여유 디스크 공간: 최소 2GB
- ✅ NAS의 실제 IP 주소
- ✅ SSH 접속 권한 (선택)

---

**더 자세한 내용**: `NAS_DEPLOYMENT_GUIDE.md` 참조

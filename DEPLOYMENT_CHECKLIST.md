# ✅ NAS 배포 체크리스트 및 설정 파일

## 📦 배포 패키지 확인

### 필수 파일
- [x] `docker-compose.prod.yaml` - 프로덕션 Docker Compose 설정
- [x] `docker-compose.yaml` - 개발 Docker Compose 설정
- [x] `.env.example` - 환경 변수 템플릿
- [x] `deploy.sh` - Linux/Mac 배포 스크립트
- [x] `deploy.bat` - Windows 배포 스크립트
- [x] `NAS_DEPLOYMENT_GUIDE.md` - 상세 배포 가이드
- [x] `QUICK_NAS_DEPLOYMENT.md` - 빠른 시작 가이드

### 프로젝트 폴더
```
build-your-perfect-actuator/
├── actuator-back/          # Backend API
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts
│   │   └── routes/
│   └── sql/
│       └── CREATE_TABLES.sql
├── actuator-front/         # Frontend React
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── public/
│   │   └── images/        # ✨ 새로 추가: SVG 이미지들
│   └── src/
├── docker-compose.yaml     # 개발용
├── docker-compose.prod.yaml # NAS 배포용 ✨ 새로 추가
├── .env.example           # 환경 변수 템플릿 ✨ 새로 추가
├── deploy.sh             # 배포 스크립트 ✨ 새로 추가
├── deploy.bat            # 배포 스크립트 ✨ 새로 추가
├── NAS_DEPLOYMENT_GUIDE.md  # 가이드 ✨ 새로 추가
└── QUICK_NAS_DEPLOYMENT.md  # 빠른 시작 ✨ 새로 추가
```

---

## 🔧 배포 전 준비 사항

### 1. ✅ 환경 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일 수정
REACT_APP_BACKEND_URL=http://YOUR_NAS_IP:4004
DB_PASSWORD=1209  # 보안상 변경 권장
SENDGRID_API_KEY=  # 이메일 발송 필요시 설정
```

### 2. ✅ NAS 준비 사항
- [ ] NAS에 Docker 설치 확인
- [ ] NAS 여유 디스크 공간 확인 (최소 2GB)
- [ ] NAS IP 주소 확인
- [ ] NAS SSH 접근 권한 확인 (선택)

### 3. ✅ 파일 준비
- [ ] 프로젝트 전체 폴더를 NAS로 복사
- [ ] 또는 `git clone` 명령으로 NAS에 복사

---

## 🚀 배포 단계

### Step 1: NAS 접속
```bash
# Linux/Mac/PowerShell
ssh admin@YOUR_NAS_IP

# 또는 NAS 웹 UI에서 SSH 터미널 열기
```

### Step 2: 프로젝트 디렉토리 이동
```bash
cd /volume1/build-your-perfect-actuator
```

### Step 3: 배포 스크립트 실행
```bash
# Linux/Mac
bash deploy.sh

# PowerShell (NAS에서)
.\deploy.bat
```

### Step 4: 결과 확인
```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yaml ps

# 웹 접속
http://YOUR_NAS_IP:5005
```

---

## 🔐 보안 설정 (권장)

### 강화된 암호 설정
```env
# .env 파일
DB_PASSWORD=YourSecurePassword123!@#
REACT_APP_ENCRYPTION_KEY=your-32-byte-secret-key-here!
```

### SendGrid 이메일 API 설정
```env
# .env 파일
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 방화벽 설정
- 외부에서 5433 포트(데이터베이스) 접근 차단
- 4004 포트(백엔드)는 선택적으로 차단 가능
- 5005 포트(프론트엔드)만 공개

---

## 📊 배포 후 확인

### 1. ✅ 웹 사이트 접속
```
http://YOUR_NAS_IP:5005
```

### 2. ✅ 홈 화면 확인
- 🏆 Prize 섹션 표시됨
- 1등/2등/3등 상품 정보 보임
- START GAME 버튼 작동

### 3. ✅ 게임 실행
- 이미지가 표시됨
- 타이머 작동
- 답변 제출 작동

### 4. ✅ 리더보드 확인
- 게임 완료 후 결과 표시
- 순위 표시

### 5. ✅ 이메일 발송 (선택)
- `docker-compose -f docker-compose.prod.yaml logs backend`에서 확인

---

## 🛠️ 트러블슈팅

### 문제: 포트 충돌
**해결**: `docker-compose.prod.yaml`에서 포트 변경
```yaml
ports:
  - "8080:5005"  # 5005 → 8080
```

### 문제: 메모리 부족
**해결**: 
```bash
docker system prune -a
docker-compose -f docker-compose.prod.yaml up --build -d
```

### 문제: 데이터베이스 연결 실패
**해결**:
```bash
docker-compose -f docker-compose.prod.yaml restart actuator-db
docker-compose -f docker-compose.prod.yaml logs actuator-db
```

---

## 📈 모니터링 명령어

### 실시간 상태 확인
```bash
docker stats
```

### 서비스별 로그
```bash
# 프론트엔드
docker-compose -f docker-compose.prod.yaml logs -f frontend

# 백엔드
docker-compose -f docker-compose.prod.yaml logs -f backend

# 데이터베이스
docker-compose -f docker-compose.prod.yaml logs -f actuator-db
```

### 전체 로그 저장
```bash
docker-compose -f docker-compose.prod.yaml logs > deployment.log
```

---

## 🔄 유지보수

### 정기 백업 (일주일에 한 번)
```bash
docker exec actuator-db pg_dump -U postgres actuator_game > backup_$(date +%Y%m%d).sql
```

### 코드 업데이트
```bash
git pull origin main
docker-compose -f docker-compose.prod.yaml up --build -d
```

### 서비스 재시작 (보안 패치 후)
```bash
docker-compose -f docker-compose.prod.yaml down
docker-compose -f docker-compose.prod.yaml up -d
```

---

## 📋 최종 배포 체크리스트

- [ ] `.env` 파일 생성 및 수정 완료
- [ ] NAS에 프로젝트 폴더 복사 완료
- [ ] `docker-compose -f docker-compose.prod.yaml config` 실행 성공
- [ ] `docker-compose -f docker-compose.prod.yaml up --build -d` 실행 완료
- [ ] 모든 컨테이너 상태 "Up (healthy)" 확인
- [ ] 웹 브라우저에서 `http://NAS-IP:5005` 접속 성공
- [ ] 홈 화면 Prize 섹션 표시됨
- [ ] 게임 화면 이미지 표시됨
- [ ] 게임 완료 후 결과 화면 표시됨
- [ ] 리더보드 표시됨
- [ ] 로그에 에러 없음

---

## 📞 기술 지원

문제 해결 시 다음 정보 준비:
1. 에러 로그 (`docker-compose -f docker-compose.prod.yaml logs`)
2. 컨테이너 상태 (`docker-compose -f docker-compose.prod.yaml ps`)
3. NAS 스펙 (CPU, RAM, 디스크)
4. NAS 모델 및 OS 버전

---

**배포 완료 후 모든 기능이 정상 작동합니다! 🎉**

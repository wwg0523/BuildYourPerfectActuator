# 박람회 액추에이터 구성 미니게임 (Build Your Perfect Actuator)

박람회 방문객이 액추에이터 부품을 조립하며 재미있게 배우고, 관심 있는 고객 정보를 수집할 수 있는 웹 기반 미니게임입니다.

## 🚀 프로젝트 개요

### 목적
- 박람회 방문객의 관심 유도 및 고객 정보 수집
- 액추에이터 기술에 대한 이해도 향상
- 브랜드 인지도 증진 및 잠재 고객 발굴

### 타겟
- 박람회 방문객 (엔지니어, 구매 담당자, 기술 관련자)
- 로봇 및 자동화 산업 종사자
- 학생 및 기술에 관심 있는 일반인

### 주요 기능
- 터치 기반 컴포넌트 선택 방식으로 액추에이터 조립
- 실시간 호환성 체크 및 결과 표시
- 결과 기반 리더보드 및 기록 관리

### 기술 스택

#### Frontend
- React 19.2: UI 라이브러리
- TypeScript 4.9: 타입 안정성
- Sass 1.93: 스타일링

#### Backend
- Node.js
- Express 5.1: 웹 서버 프레임워크
- PostgreSQL 16

## 📋 시스템 요구사항

### 개발 환경
- **Node.js**: v22.18.0
- **npm**: 10.9.3
- **PostgreSQL**: 16
- **Git**: 2.x 이상

### 지원 브라우저
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🛠️ 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd actuator-minigame
```

### 2. 의존성 설치

#### 서버 설정
```bash
cd actuator-back
npm install
npx tsc
```

#### 클라이언트 설정
```bash
cd actuator-front
npm install
```

### 3. 환경변수 설정

이 프로젝트는 **로컬 개발**과 **NAS 배포** 두 가지 환경을 지원합니다.

#### 환경 전환 스크립트

**Windows (PowerShell):**
```powershell
# 로컬 환경으로 전환
powershell -ExecutionPolicy Bypass -File ".\switch-env.ps1" -Environment local

# NAS 환경으로 전환
powershell -ExecutionPolicy Bypass -File ".\switch-env.ps1" -Environment nas
```

**Linux/Mac (Bash):**
```bash
# 로컬 환경으로 전환
./switch-env.sh local

# NAS 환경으로 전환 (기본값: local)
./switch-env.sh nas
```

#### 환경 구성

**로컬 개발 환경 (.env.local)**
```env
# Frontend
REACT_APP_BACKEND_URL=http://localhost:4004

# Backend
DB_HOST=actuator-db
DB_PORT=5433
DB_NAME=actuator_game
NODE_ENV=development
FRONTEND_URL=http://localhost:5005
```

**NAS 배포 환경 (.env.nas)**
```env
# Frontend
REACT_APP_BACKEND_URL=http://pillar01.synology.me:4004

# Backend
DB_HOST=sacrp-postgres-local
DB_PORT=5432
DB_NAME=sacrp_production
NODE_ENV=production
FRONTEND_URL=https://pillar01.synology.me:5005
```

### 4. 데이터베이스 설정

```bash
cd actuator-back

```

### 5. 애플리케이션 실행

#### 개발 모드로 실행
```bash
# 서버 실행 (터미널 1)
cd actuator-back
npm start

# 클라이언트 실행 (터미널 2)
cd actuator-front
npm run dev
```

애플리케이션이 실행되면:
- **프론트엔드**: http://localhost:5005
- **백엔드 API**: http://localhost:4004

## 📁 프로젝트 구조

```
actuator-minigame/
│
├── actuator-front/     # React + TypeScript
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   │   └ ui/
│   │   └── styles/           	# Sass 설정
│   └── package.json
│
├── actuator-back/      # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── index.ts        # 서버 진입점
│   │   ├── db.ts           # DB 연결 설정
│   │   └── routes/
│   ├── types/
│   └── package.json
│
└── README.md

```

## 🔧 개발 가이드

### 코딩 스타일
- **TypeScript**: 타입 안정성 (서버), Express API 구현

### Git 워크플로우

#### 브랜치 전략
- `main`: 프로덕션 코드

#### 커밋 메시지 규칙
```
type(scope): subject

body

footer
```

**Type:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정 등

**예시:**
```
feat(3d-viewer): add auto-scaling for GLB models

- Implement dynamic model sizing based on bounding box
- Add responsive camera positioning
- Fix center alignment issues

Closes #123
```

### 데이터베이스 관리

## 🧪 테스트

## 📦 배포

### 프로덕션 빌드

### Docker 배포

#### Synology NAS 자동 배포

GitHub에서 코드를 push하면 **자동으로** Synology NAS에 배포되도록 설정할 수 있습니다.

**3가지 방법 지원:**
1. **Webhook (즉시 배포)**: GitHub에 push → NAS가 즉시 배포
2. **Cron (정기 배포)**: 설정된 시간에 자동 배포
3. **혼합**: 둘 다 사용하여 push 후 즉시 배포 + 정기적 백업

**자세한 가이드 (docs 폴더):**
- ⭐ **[여기서 시작! (START-HERE.md)](./docs/START-HERE.md)** - 전체 개요
- ⚡ **[빠른 시작 가이드](./docs/QUICK-START.md)** - 5분 안에 설정하기
- 📚 **[상세 설정 가이드](./docs/AUTO-DEPLOY-GUIDE.md)** - 전체 설정 및 트러블슈팅
- 📋 **[배포 구조 설명](./docs/DEPLOYMENT-SUMMARY.md)** - 시스템 구조 이해하기

**NAS에서 배포 설정 (deployment 폴더):**
```bash
# GitHub에서 clone
git clone https://github.com/wwg0523/BuildYourPerfectActuator.git
cd actuator-minigame

# deployment 폴더로 이동
cd deployment

# 스크립트 실행 권한 부여
chmod +x *.sh

# 환경 설정
cp .env.example .env
nano .env  # WEBHOOK_SECRET 수정 (Webhook 방식을 사용할 경우)

# 배포 관리 도구 실행
bash deploy-manager.sh
```

**또는 간단하게 (Cron 방식):**
```bash
cd /volume1/actuator-minigame

# Crontab 설정
crontab -e

# 다음 추가 (매일 오전 2시):
0 2 * * * /volume1/actuator-minigame/deployment/schedule-update.sh
```

## �🔒 보안 고려사항

- 환경변수로 민감한 정보 관리
- GitHub Webhook Secret으로 요청 검증
- HTTPS를 통한 안전한 통신 권장

## 🐛 문제 해결

### 자주 발생하는 문제

#### 데이터베이스 연결 오류
1. PostgreSQL 서비스 실행 확인
2. 환경변수 확인
3. 데이터베이스 권한 확인

## 📞 지원

### 문서

### 기여 방법

## 📄 라이선스

## 👥 팀

---

## 🔄 업데이트 로그

### v0.0.1 (2025-10-17)
- 초기 프로젝트 설정
- 기본 기능 구현
- Git 저장소 설정

### v0.0.2 (2025-10-22)
- Synology NAS DDNS 호스팅
- PostgreSQL 서비스 구현

# 🚀 Deployment Scripts

Synology NAS에 자동으로 배포하기 위한 스크립트와 설정 파일들입니다.

## 📁 폴더 구조

```
deployment/
├── update-docker.sh              # 실제 배포 실행 스크립트
├── schedule-update.sh            # 정기적 배포 확인 (Cron용)
├── validate-deployment.sh        # 배포 후 상태 검증
├── deploy-manager.sh             # 통합 관리 도구
├── webhook-server.js             # GitHub Webhook 감지 서버
├── webhook-server-package.json   # npm 의존성
├── update-docker.ps1             # Windows PowerShell 버전
└── .env.example                  # 환경 설정 예시
```

## 🎯 NAS에서 빠른 설정

### 방법 1: Cron (정기 배포 - 권장) ⏰

**가장 간단한 방법입니다.**

```bash
# 1. NAS에 clone
git clone https://github.com/wwg0523/BuildYourPerfectActuator.git
cd build-your-perfect-actuator

# 2. 스크립트 권한
chmod +x deployment/*.sh

# 3. Cron 설정
crontab -e

# 다음 추가 (매일 오전 2시):
0 2 * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh

# 완료! ✅
```

**이제 매일 오전 2시에 자동으로 업데이트됩니다.**

---

**또는 10분마다 배포하고 싶으면:**

```bash
# Crontab 설정
crontab -e

# 다음 추가 (10분마다):
*/10 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh >> /volume1/build-your-perfect-actuator/logs/cron.log 2>&1

# 완료! ✅
```

더 자세한 설정은 `10MIN-SETUP.md`를 참고하세요.

---

### 방법 2: Webhook (즉시 배포) ⚡

**Push 후 즉시 배포됩니다. (포트 포워딩 필요)**

```bash
# 1. 환경 설정
cd deployment
cp .env.example .env
nano .env

# WEBHOOK_SECRET 생성:
# openssl rand -base64 32

# 2. npm 설치
npm install dotenv

# 3. Webhook 서버 시작
node webhook-server.js

# 또는 PM2 사용 (백그라운드):
npm install -g pm2
pm2 start webhook-server.js --name "github-webhook"
pm2 startup
pm2 save
```

**GitHub에서 Webhook 등록:**
1. Repository Settings > Webhooks > Add webhook
2. Payload URL: `https://your-nas-domain.synology.me:3000/webhook`
3. Content type: `application/json`
4. Secret: `.env` 파일의 `WEBHOOK_SECRET` 값
5. Events: Push events 선택

---

## 📝 각 파일 설명

### update-docker.sh
- **역할**: 실제 배포 수행
- **동작**:
  - Git 저장소 업데이트
  - Docker 컨테이너 정지
  - Docker 이미지 재빌드
  - 컨테이너 재시작

### schedule-update.sh
- **역할**: 정기적 배포 확인 (Cron에서 호출)
- **특징**: 변경사항이 없으면 아무것도 하지 않음 (효율적)

### validate-deployment.sh
- **역할**: 배포 후 모든 서비스 정상 작동 확인
- **검사**: 컨테이너, Frontend, Backend, Database 상태

### deploy-manager.sh
- **역할**: 모든 배포 작업을 대화형 메뉴로 관리
- **메뉴**: 배포, 모니터링, 로그, Cron 설정 등

### webhook-server.js
- **역할**: GitHub의 Push 이벤트를 수신하고 배포 트리거
- **포트**: 3000 (설정 가능)
- **보안**: HMAC-SHA256으로 GitHub 요청 검증

---

## 🔧 환경 설정 (.env)

```env
# 기본 설정 (프로젝트 루트의 .env)
DB_HOST=actuator-db
DB_PORT=5433
REACT_APP_BACKEND_URL=http://localhost:4004

# Webhook 서버 설정 (선택)
WEBHOOK_PORT=3000
WEBHOOK_SECRET=강력한_임의_문자열  # openssl rand -base64 32
UPDATE_SCRIPT=/volume1/build-your-perfect-actuator/deployment/update-docker.sh
```

---

## 📊 추천 배포 방식

| 상황 | 추천 |
|------|------|
| 간단하게 시작하고 싶음 | ✅ Cron (방법 1) |
| Push 후 즉시 배포 필요 | ⚡ Webhook (방법 2) |
| 포트 포워딩 가능 | ⚡ Webhook (방법 2) |
| 포트 포워딩 불가능 | ✅ Cron (방법 1) |

---

## 🆘 문제 해결

### 스크립트 권한 오류
```bash
chmod +x deployment/*.sh
```

### Cron이 작동하지 않음
```bash
# 설정 확인
crontab -l

# 절대 경로 사용 확인 (상대 경로 안 됨)
# 예: /volume1/build-your-perfect-actuator/deployment/schedule-update.sh
```

### Webhook 서버 포트 충돌
```env
# .env에서 포트 변경
WEBHOOK_PORT=8080
```

---

## 📚 더 자세히 알고 싶으면

부모 디렉토리의 `docs/` 폴더에서:
- `START-HERE.md` - 전체 개요
- `QUICK-START.md` - 5분 설정 가이드
- `AUTO-DEPLOY-GUIDE.md` - 상세 가이드

---

**이제 NAS에서 자동 배포가 준비되었습니다!** ✅

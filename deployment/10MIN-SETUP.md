# ⏱️ 10분마다 자동 배포 설정 가이드

## 🎯 개요

GitHub에 코드가 Push되면 최대 10분 안에 NAS에 자동 배포됩니다.

**작동 원리:**
```
GitHub Push
    ↓
(최대 10분 대기)
    ↓
NAS의 Cron 작업 실행
    ↓
변경사항 확인
    ↓
변경사항 있으면 배포! ✅
```

---

## 📋 설정 방법

### Step 1: NAS에 프로젝트 Clone

```bash
# NAS 터미널에서
cd /volume1
git clone https://github.com/wwg0523/BuildYourPerfectActuator.git build-your-perfect-actuator
cd build-your-perfect-actuator
```

### Step 2: 스크립트 권한 부여

```bash
chmod +x deployment/*.sh
```

### Step 3: Crontab 설정

```bash
# Crontab 편집
crontab -e

# 다음 추가 (10분마다 실행):
*/10 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh >> /volume1/build-your-perfect-actuator/logs/cron.log 2>&1
```

### Step 4: 설정 확인

```bash
# Crontab 확인
crontab -l

# 출력 예:
# */10 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh >> /volume1/build-your-perfect-actuator/logs/cron.log 2>&1
```

---

## ✅ 설정 후 테스트

### 테스트 1: 스크립트 직접 실행

```bash
# 수동으로 실행해보기
bash /volume1/build-your-perfect-actuator/deployment/schedule-update.sh

# 로그 확인
tail -f /volume1/build-your-perfect-actuator/logs/scheduled-update-*.log
```

### 테스트 2: 코드 변경 후 Push

```bash
# 로컬에서
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger deployment"
git push origin main

# NAS에서 로그 확인 (최대 10분 대기)
tail -f /volume1/build-your-perfect-actuator/logs/scheduled-update-*.log
```

---

## 📊 작동 상황

### 배포 될 때
```
시간: 10:00
Cron 실행 → git fetch → 변경사항 감지 → 배포 시작 → Lock 파일 생성
         → Docker 빌드 (30-60초)
         → 컨테이너 재시작
         → 완료! Lock 파일 제거
```

### 배포 되지 않을 때
```
시간: 10:10
Cron 실행 → git fetch → 변경사항 없음 → 조용히 종료 (0.5초)
```

### 배포 중복 방지
```
시간: 10:00 - 배포 시작 (Lock 파일 생성)
시간: 10:05 - 아직 배포 중 (Lock 파일 확인 → 스킵)
시간: 10:10 - 배포 완료 (Lock 파일 제거)
       또는 다시 시도
```

---

## ⏱️ Crontab 시간 설정

### 다양한 시간 설정 예시

```bash
# 10분마다 (모든 시간)
*/10 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh

# 정확하게 0분, 10분, 20분... 매 시간
0,10,20,30,40,50 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh

# 5분마다 (더 자주)
*/5 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh

# 30분마다 (덜 자주)
*/30 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh

# 매 시간 정각
0 * * * * /volume1/build-your-perfect-actuator/deployment/schedule-update.sh

# 업무 시간만 (9:00-18:00)
*/10 9-18 * * 1-5 /volume1/build-your-perfect-actuator/deployment/schedule-update.sh
```

---

## 📊 부하 분석

### CPU/메모리 사용량

**변경사항 없을 때 (10분마다):**
- CPU: <1%
- 메모리: ~10MB
- 실행 시간: ~0.5초

**변경사항 있을 때 (배포):**
- CPU: 30-50%
- 메모리: 200-300MB
- 실행 시간: 1-2분

**평가: 완전히 안전합니다!** ✅

---

## 📝 로그 확인

### 배포 로그
```bash
# 최근 배포 로그 보기
tail -f /volume1/build-your-perfect-actuator/logs/scheduled-update-*.log

# 모든 배포 로그 조회
ls -lah /volume1/build-your-perfect-actuator/logs/scheduled-update-*.log

# 특정 날짜의 로그
grep "2025-11-03" /volume1/build-your-perfect-actuator/logs/scheduled-update-*.log
```

### Cron 작업 로그
```bash
# Cron 로그 확인
tail -f /volume1/build-your-perfect-actuator/logs/cron.log

# 또는 시스템 Cron 로그
tail -f /var/log/cron  # CentOS/RHEL
tail -f /var/log/syslog | grep CRON  # Debian/Ubuntu
```

---

## 🔧 Lock 파일 수동 해제

배포가 비정상 종료되어 Lock 파일이 남아있을 때:

```bash
# Lock 파일 확인
ls -la /volume1/build-your-perfect-actuator/.deployment-lock

# Lock 파일 제거
rm /volume1/build-your-perfect-actuator/.deployment-lock

# 다시 배포 시작
bash /volume1/build-your-perfect-actuator/deployment/schedule-update.sh
```

---

## 🆘 문제 해결

### 배포가 실행되지 않음

```bash
# 1. Crontab 설정 확인
crontab -l

# 2. 스크립트 권한 확인
ls -l /volume1/build-your-perfect-actuator/deployment/schedule-update.sh
# -rwxr-xr-x 이어야 함 (또는 chmod +x)

# 3. Cron 서비스 확인
systemctl status cron  # Debian/Ubuntu
systemctl status crond  # CentOS

# 4. 로그 확인
tail -f /var/log/cron
```

### 배포 중복 실행됨

```bash
# 1. Lock 파일 확인
ls -la /volume1/build-your-perfect-actuator/.deployment-lock

# 2. 타임아웃 값 확인 (deployment/schedule-update.sh의 LOCK_TIMEOUT)
# 기본값: 600초 (10분) - 배포 시간에 따라 조정 필요

# 3. 로그에서 배포 완료 시간 확인
tail -100 /volume1/build-your-perfect-actuator/logs/cron.log
```

### 변경사항이 감지되지 않음

```bash
# 1. Git 상태 확인
cd /volume1/build-your-perfect-actuator
git status

# 2. 원격 저장소 상태 확인
git fetch origin main
git log -1 origin/main

# 3. 수동으로 업데이트 확인
bash /volume1/build-your-perfect-actuator/deployment/schedule-update.sh
```

---

## 💡 팁

### 로그 정리 (월 1회)

```bash
# 30일 이상 된 로그 삭제
find /volume1/build-your-perfect-actuator/logs -name "*.log" -mtime +30 -delete

# 이를 Cron에 추가
0 0 1 * * find /volume1/build-your-perfect-actuator/logs -name "*.log" -mtime +30 -delete
```

### 배포 알림 받기 (선택)

배포 성공/실패 시 이메일 알림을 받으려면 `schedule-update.sh` 마지막에 추가:

```bash
# 배포 완료 후
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -d "{\"text\":\"Deployment completed\"}"
```

---

**이제 10분마다 자동 배포가 설정되었습니다!** ✅

다음 Push 이후 최대 10분 안에 NAS가 자동으로 업데이트됩니다.

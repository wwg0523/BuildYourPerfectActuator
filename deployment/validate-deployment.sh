#!/bin/bash

# 배포 상태 검증 스크립트
# 배포 후 서비스가 정상적으로 실행 중인지 확인

set -e

PROJECT_DIR="/volume1/actuator-minigame"
LOG_DIR="${PROJECT_DIR}/logs"
LOG_FILE="${LOG_DIR}/validation-$(date +%Y%m%d-%H%M%S).log"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 로그 디렉토리 생성
mkdir -p "${LOG_DIR}"

# 로그 함수
log() {
    local message="$1"
    echo -e "${message}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${message}" >> "${LOG_FILE}"
}

test_result() {
    local test_name="$1"
    local result="$2"
    
    if [ "$result" -eq 0 ]; then
        log "${GREEN}✓ ${test_name}${NC}"
        return 0
    else
        log "${RED}✗ ${test_name}${NC}"
        return 1
    fi
}

log "${YELLOW}=== 배포 상태 검증 시작 ===${NC}"
log "시작 시간: $(date '+%Y-%m-%d %H:%M:%S')"

cd "${PROJECT_DIR}"

# 1. Docker 컨테이너 상태 확인
log "\n${YELLOW}[1/6] Docker 컨테이너 상태 확인${NC}"
docker-compose -f docker-compose.prod.yaml ps
test_result "Docker 컨테이너" $?

# 2. 각 컨테이너의 로그 확인
log "\n${YELLOW}[2/6] 컨테이너 로그 확인${NC}"

# Frontend 확인
log "\n${YELLOW}Frontend 로그:${NC}"
docker-compose -f docker-compose.prod.yaml logs --tail=20 frontend | head -20
test_result "Frontend 로그" $?

# Backend 확인
log "\n${YELLOW}Backend 로그:${NC}"
docker-compose -f docker-compose.prod.yaml logs --tail=20 backend | head -20
test_result "Backend 로그" $?

# Database 확인
log "\n${YELLOW}Database 로그:${NC}"
docker-compose -f docker-compose.prod.yaml logs --tail=20 actuator-db | head -20
test_result "Database 로그" $?

# 3. 헬스 체크 - Frontend
log "\n${YELLOW}[3/6] Frontend 헬스 체크${NC}"
if curl -s http://localhost:5005 > /dev/null 2>&1; then
    log "Frontend URL: http://localhost:5005"
    test_result "Frontend 접근 가능" 0
else
    log "Frontend에 접근할 수 없습니다"
    test_result "Frontend 접근 가능" 1
fi

# 4. 헬스 체크 - Backend
log "\n${YELLOW}[4/6] Backend 헬스 체크${NC}"
if curl -s http://localhost:4004/health > /dev/null 2>&1; then
    HEALTH_RESPONSE=$(curl -s http://localhost:4004/health)
    log "Backend 상태: ${HEALTH_RESPONSE}"
    test_result "Backend 접근 가능" 0
else
    log "Backend에 접근할 수 없습니다"
    test_result "Backend 접근 가능" 1
fi

# 5. Database 연결 확인
log "\n${YELLOW}[5/6] Database 연결 확인${NC}"
if docker-compose -f docker-compose.prod.yaml exec -T actuator-db pg_isready -U postgres > /dev/null 2>&1; then
    test_result "Database 연결" 0
else
    log "Database에 연결할 수 없습니다"
    test_result "Database 연결" 1
fi

# 6. Git 상태 확인
log "\n${YELLOW}[6/6] Git 상태 확인${NC}"
GIT_STATUS=$(git status --porcelain)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_COMMIT=$(git rev-parse --short HEAD)

log "Branch: ${GIT_BRANCH}"
log "Latest Commit: ${GIT_COMMIT}"
log "Status: $(git describe --tags --always)"

if [ -z "$GIT_STATUS" ]; then
    log "Git 저장소가 깨끗합니다 (커밋되지 않은 변경사항 없음)"
    test_result "Git 상태" 0
else
    log "${YELLOW}Git 저장소에 커밋되지 않은 변경사항이 있습니다:${NC}"
    log "$GIT_STATUS"
    test_result "Git 상태" 1
fi

# 최종 요약
log "\n${YELLOW}=== 검증 완료 ===${NC}"
log "종료 시간: $(date '+%Y-%m-%d %H:%M:%S')"
log "로그 파일: ${LOG_FILE}"

# 모든 테스트 통과 확인
if [ -z "$(grep '✗' ${LOG_FILE})" ]; then
    log "\n${GREEN}✓ 모든 검증을 통과했습니다!${NC}"
    exit 0
else
    log "\n${RED}✗ 일부 검증에 실패했습니다. 위 로그를 확인하세요.${NC}"
    exit 1
fi

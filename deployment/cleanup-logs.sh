#!/bin/bash

# 로그 정리 스크립트 (Cron 사용)
#
# 설치 방법:
# 1. 이 스크립트를 /volume1/build-your-perfect-actuator/deployment/cleanup-logs.sh에 저장
# 2. chmod +x /volume1/build-your-perfect-actuator/deployment/cleanup-logs.sh 실행
# 3. crontab -e 명령어로 크론탭 편집
# 4. 다음을 크론탭에 추가:
#    
#    # 매주 일요일 오전 3시에 로그 정리 (UTC 기준)
#    0 3 * * 0 /volume1/build-your-perfect-actuator/deployment/cleanup-logs.sh
#

set -e

# 설정
PROJECT_DIR="/volume1/build-your-perfect-actuator"
LOG_DIR="${PROJECT_DIR}/logs"
MAX_SIZE_MB=5
MAX_SIZE_BYTES=$((MAX_SIZE_MB * 1024 * 1024))

# 정리 로그 파일
CLEANUP_LOG="${LOG_DIR}/cleanup-$(date +%Y%m%d-%H%M%S).log"

# 로그 디렉토리 확인
if [ ! -d "${LOG_DIR}" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 로그 디렉토리가 없습니다: ${LOG_DIR}"
    exit 1
fi

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${CLEANUP_LOG}"
}

log "=== 로그 정리 시작 ==="
log "로그 디렉토리: ${LOG_DIR}"
log "최대 크기: ${MAX_SIZE_MB}MB"

# 현재 로그 디렉토리 크기 확인
CURRENT_SIZE=$(du -sb "${LOG_DIR}" 2>/dev/null | cut -f1)
CURRENT_SIZE_MB=$((CURRENT_SIZE / 1024 / 1024))

log "현재 디렉토리 크기: ${CURRENT_SIZE_MB}MB (${CURRENT_SIZE} bytes)"

# 최대 크기 초과 여부 확인
if [ $CURRENT_SIZE -gt $MAX_SIZE_BYTES ]; then
    log "경고: 로그 디렉토리가 최대 크기(${MAX_SIZE_MB}MB)를 초과했습니다!"
    log "이전 파일을 삭제하고 있습니다..."
    
    # 파일을 수정 시간 역순으로 정렬하여 가장 오래된 파일부터 삭제
    find "${LOG_DIR}" -type f -name "*.log" | while read file; do
        if [ $CURRENT_SIZE -le $MAX_SIZE_BYTES ]; then
            log "대상 크기에 도달했습니다. 정리 완료"
            break
        fi
        
        FILE_SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
        FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
        
        log "삭제: $(basename "$file") (${FILE_SIZE_MB}MB)"
        rm -f "$file"
        
        CURRENT_SIZE=$((CURRENT_SIZE - FILE_SIZE))
    done
else
    log "로그 크기가 정상 범위 내입니다. 추가 정리가 필요하지 않습니다."
fi

# 최종 크기 확인
FINAL_SIZE=$(du -sb "${LOG_DIR}" 2>/dev/null | cut -f1)
FINAL_SIZE_MB=$((FINAL_SIZE / 1024 / 1024))

log "최종 디렉토리 크기: ${FINAL_SIZE_MB}MB (${FINAL_SIZE} bytes)"
log "=== 로그 정리 완료 ==="

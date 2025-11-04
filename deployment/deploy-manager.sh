#!/bin/bash

# GitHub 자동 배포 통합 관리 스크립트
# 모든 배포 관련 작업을 한곳에서 관리합니다

set -e

PROJECT_DIR="/volume1/build-your-perfect-actuator"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 메인 메뉴 표시
show_menu() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   GitHub 자동 배포 관리 도구          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}배포 관련 작업:${NC}"
    echo "1) 즉시 배포 (Webhook 서버 없이)"
    echo "2) Webhook 서버 시작 (자동 배포)"
    echo "3) Webhook 서버 중지"
    echo "4) Webhook 서버 상태 확인"
    echo ""
    echo -e "${YELLOW}모니터링:${NC}"
    echo "5) 배포 상태 검증"
    echo "6) Docker 로그 확인"
    echo "7) Webhook 서버 로그 확인"
    echo "8) 배포 이력 확인"
    echo ""
    echo -e "${YELLOW}관리:${NC}"
    echo "9) Cron 작업 설정"
    echo "10) 컨테이너 재시작"
    echo "11) 컨테이너 강제 재빌드"
    echo "12) 로그 정리"
    echo ""
    echo -e "${YELLOW}기타:${NC}"
    echo "13) 가이드 보기"
    echo "0) 종료"
    echo ""
    echo -n "선택: "
}

# 1. 즉시 배포
deploy_now() {
    echo -e "${YELLOW}즉시 배포를 시작합니다...${NC}"
    bash "${PROJECT_DIR}/update-docker.sh"
    echo -e "${GREEN}배포 완료!${NC}"
}

# 2. Webhook 서버 시작
start_webhook() {
    echo -e "${YELLOW}Webhook 서버를 시작합니다...${NC}"
    cd "${PROJECT_DIR}"
    
    if command -v pm2 &> /dev/null; then
        pm2 start webhook-server.js --name "github-webhook"
        echo -e "${GREEN}Webhook 서버가 PM2로 시작되었습니다${NC}"
    else
        echo -e "${YELLOW}PM2가 설치되지 않았습니다. nohup으로 시작합니다...${NC}"
        nohup node webhook-server.js > "${PROJECT_DIR}/logs/webhook.log" 2>&1 &
        echo -e "${GREEN}Webhook 서버가 시작되었습니다${NC}"
    fi
    
    sleep 2
    curl http://localhost:3000/health 2>/dev/null && echo -e "${GREEN}✓ Webhook 서버가 정상적으로 실행 중입니다${NC}" || echo -e "${RED}✗ 서버 헬스 체크 실패${NC}"
}

# 3. Webhook 서버 중지
stop_webhook() {
    echo -e "${YELLOW}Webhook 서버를 중지합니다...${NC}"
    if command -v pm2 &> /dev/null; then
        pm2 stop github-webhook
        echo -e "${GREEN}Webhook 서버가 중지되었습니다${NC}"
    else
        pkill -f webhook-server || true
        echo -e "${GREEN}Webhook 프로세스가 중지되었습니다${NC}"
    fi
}

# 4. Webhook 서버 상태
webhook_status() {
    echo -e "${YELLOW}Webhook 서버 상태:${NC}"
    if command -v pm2 &> /dev/null; then
        pm2 status
    else
        ps aux | grep webhook-server | grep -v grep || echo -e "${RED}실행 중인 Webhook 서버가 없습니다${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}포트 확인:${NC}"
    netstat -tlnp 2>/dev/null | grep 3000 || echo -e "${RED}포트 3000이 열려있지 않습니다${NC}"
}

# 5. 배포 상태 검증
validate() {
    echo -e "${YELLOW}배포 상태를 검증합니다...${NC}"
    bash "${PROJECT_DIR}/validate-deployment.sh"
}

# 6. Docker 로그
docker_logs() {
    echo -e "${YELLOW}Docker 로그를 표시합니다 (최근 50줄). Ctrl+C로 종료하세요.${NC}"
    docker-compose -f "${PROJECT_DIR}/docker-compose.prod.yaml" logs -f --tail=50
}

# 7. Webhook 로그
webhook_logs() {
    echo -e "${YELLOW}Webhook 서버 로그를 표시합니다. Ctrl+C로 종료하세요.${NC}"
    tail -f "${PROJECT_DIR}/logs/webhook-*.log" 2>/dev/null || echo -e "${RED}Webhook 로그가 없습니다${NC}"
}

# 8. 배포 이력
deployment_history() {
    echo -e "${YELLOW}최근 배포 이력:${NC}"
    ls -lah "${PROJECT_DIR}/logs/" | grep -E "update-|webhook-|scheduled-" | tail -20
}

# 9. Cron 설정
setup_cron() {
    echo -e "${YELLOW}Cron 작업을 설정합니다...${NC}"
    echo ""
    echo "선택할 배포 시간:"
    echo "1) 매일 오전 2시 (권장)"
    echo "2) 매일 오전 2시, 오후 2시"
    echo "3) 평일 오후 6시"
    echo "4) 매일 자정"
    echo "5) 사용자 정의"
    echo "0) 취소"
    echo ""
    read -p "선택: " cron_choice
    
    case $cron_choice in
        1)
            CRON="0 2 * * *"
            ;;
        2)
            CRON="0 2,14 * * *"
            ;;
        3)
            CRON="0 18 * * 1-5"
            ;;
        4)
            CRON="0 0 * * *"
            ;;
        5)
            read -p "Cron 식 입력 (분 시 일 월 요일): " CRON
            ;;
        *)
            return
            ;;
    esac
    
    CRON_CMD="${CRON} ${PROJECT_DIR}/schedule-update.sh >> ${PROJECT_DIR}/logs/cron.log 2>&1"
    
    # 기존 크론탭 가져오기
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    
    echo -e "${GREEN}Cron 작업이 설정되었습니다:${NC}"
    echo "$CRON_CMD"
}

# 10. 컨테이너 재시작
restart_containers() {
    echo -e "${YELLOW}컨테이너를 재시작합니다...${NC}"
    docker-compose -f "${PROJECT_DIR}/docker-compose.prod.yaml" restart
    echo -e "${GREEN}컨테이너 재시작 완료${NC}"
}

# 11. 컨테이너 강제 재빌드
rebuild_containers() {
    echo -e "${YELLOW}컨테이너를 강제 재빌드합니다...${NC}"
    docker-compose -f "${PROJECT_DIR}/docker-compose.prod.yaml" down
    docker rmi actuator-back:latest 2>/dev/null || true
    docker rmi actuator-front:latest 2>/dev/null || true
    docker-compose -f "${PROJECT_DIR}/docker-compose.prod.yaml" up -d --build
    echo -e "${GREEN}컨테이너 재빌드 완료${NC}"
}

# 12. 로그 정리
cleanup_logs() {
    echo -e "${YELLOW}7일 이상된 로그를 삭제합니다...${NC}"
    find "${PROJECT_DIR}/logs" -name "*.log" -mtime +7 -delete
    echo -e "${GREEN}로그 정리 완료${NC}"
    echo ""
    echo -e "${YELLOW}현재 로그 파일:${NC}"
    ls -lah "${PROJECT_DIR}/logs/"
}

# 13. 가이드 보기
show_guides() {
    echo ""
    echo "1) 빠른 시작 가이드 (QUICK-START.md)"
    echo "2) 상세 가이드 (AUTO-DEPLOY-GUIDE.md)"
    echo "0) 돌아가기"
    echo ""
    read -p "선택: " guide_choice
    
    case $guide_choice in
        1)
            cat "${PROJECT_DIR}/QUICK-START.md" | less
            ;;
        2)
            cat "${PROJECT_DIR}/AUTO-DEPLOY-GUIDE.md" | less
            ;;
    esac
}

# 메인 루프
main() {
    while true; do
        show_menu
        read choice
        
        case $choice in
            1) deploy_now ;;
            2) start_webhook ;;
            3) stop_webhook ;;
            4) webhook_status ;;
            5) validate ;;
            6) docker_logs ;;
            7) webhook_logs ;;
            8) deployment_history ;;
            9) setup_cron ;;
            10) restart_containers ;;
            11) rebuild_containers ;;
            12) cleanup_logs ;;
            13) show_guides ;;
            0) echo -e "${GREEN}종료합니다${NC}"; exit 0 ;;
            *) echo -e "${RED}잘못된 선택입니다${NC}" ;;
        esac
        
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
    done
}

# 실행
main

#!/bin/bash
# Synology NAS PostgreSQL 에 테이블 생성 스크립트

# 데이터베이스 정보
DB_NAME="sacrp_production"
DB_USER="postgres"

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Synology NAS PostgreSQL 테이블 생성 ===${NC}\n"

# 1. leaderboard_entries 테이블
echo -e "${YELLOW}1. leaderboard_entries 테이블 생성 중...${NC}"
docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY,
    user_id UUID,
    player_name TEXT NOT NULL,
    company TEXT,
    score INT NOT NULL,
    completion_time BIGINT NOT NULL,
    time_bonus INT DEFAULT 0,
    final_score INT NOT NULL,
    played_at TIMESTAMPTZ DEFAULT NOW()
);
" && echo -e "${GREEN}✓ leaderboard_entries 생성 완료${NC}" || echo -e "${RED}✗ 오류 발생${NC}"

# 2. 인덱스 생성
echo -e "\n${YELLOW}2. 인덱스 생성 중...${NC}"
docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score_time ON leaderboard_entries(score DESC, completion_time ASC, played_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_played_at ON leaderboard_entries(played_at DESC);
" && echo -e "${GREEN}✓ 인덱스 생성 완료${NC}" || echo -e "${RED}✗ 오류 발생${NC}"

# 3. email_logs 테이블
echo -e "\n${YELLOW}3. email_logs 테이블 생성 중...${NC}"
docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    email_type VARCHAR(50) NOT NULL,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    error_message TEXT
);
" && echo -e "${GREEN}✓ email_logs 생성 완료${NC}" || echo -e "${RED}✗ 오류 발생${NC}"

# 4. email_logs 인덱스
echo -e "\n${YELLOW}4. email_logs 인덱스 생성 중...${NC}"
docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
" && echo -e "${GREEN}✓ email_logs 인덱스 생성 완료${NC}" || echo -e "${RED}✗ 오류 발생${NC}"

# 5. api_counter_logs 테이블
echo -e "\n${YELLOW}5. api_counter_logs 테이블 생성 중...${NC}"
docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS api_counter_logs (
    id UUID PRIMARY KEY,
    api_endpoint VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
" && echo -e "${GREEN}✓ api_counter_logs 생성 완료${NC}" || echo -e "${RED}✗ 오류 발생${NC}"

# 6. api_counter_logs 인덱스
echo -e "\n${YELLOW}6. api_counter_logs 인덱스 생성 중...${NC}"
docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);
" && echo -e "${GREEN}✓ api_counter_logs 인덱스 생성 완료${NC}" || echo -e "${RED}✗ 오류 발생${NC}"

# 7. 확인
echo -e "\n${YELLOW}7. 테이블 생성 확인 중...${NC}"
docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leaderboard_entries', 'email_logs', 'api_counter_logs')
ORDER BY table_name;
"

echo -e "\n${GREEN}=== 완료! ===${NC}"
echo -e "${YELLOW}테이블 상세 확인:${NC}"
echo "docker exec postgres psql -U postgres -d sacrp_production -c \"\\d leaderboard_entries\""

@echo off
REM Synology NAS PostgreSQL 테이블 생성 배치 파일
REM Windows PowerShell / CMD 에서 실행
REM NOTE: leaderboard_entries 테이블은 제거됨 (daily_leaderboard VIEW 사용)

setlocal enabledelayedexpansion

set DB_NAME=sacrp_production
set DB_USER=postgres

echo.
echo ===============================================
echo Synology NAS PostgreSQL 테이블 생성
echo ===============================================
echo.

echo [1/4] email_logs 테이블 생성 중...
docker exec postgres psql -U %DB_USER% -d %DB_NAME% -c "CREATE TABLE IF NOT EXISTS email_logs (id UUID PRIMARY KEY, user_id UUID, email_type VARCHAR(50) NOT NULL, recipient_email TEXT NOT NULL, sent_at TIMESTAMPTZ DEFAULT NOW(), success BOOLEAN NOT NULL, error_message TEXT);"
if %errorlevel% equ 0 (echo ✓ email_logs 생성 완료) else (echo ✗ 오류 발생)

echo.
echo [2/4] email_logs 인덱스 생성 중...
docker exec postgres psql -U %DB_USER% -d %DB_NAME% -c "CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id); CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);"
if %errorlevel% equ 0 (echo ✓ email_logs 인덱스 생성 완료) else (echo ✗ 오류 발생)

echo.
echo [3/4] api_counter_logs 테이블 생성 중...
docker exec postgres psql -U %DB_USER% -d %DB_NAME% -c "CREATE TABLE IF NOT EXISTS api_counter_logs (id UUID PRIMARY KEY, api_endpoint VARCHAR(255), action VARCHAR(50), success BOOLEAN, response_data JSONB, created_at TIMESTAMPTZ DEFAULT NOW());"
if %errorlevel% equ 0 (echo ✓ api_counter_logs 생성 완료) else (echo ✗ 오류 발생)

echo.
echo [4/4] api_counter_logs 인덱스 생성 중...
docker exec postgres psql -U %DB_USER% -d %DB_NAME% -c "CREATE INDEX IF NOT EXISTS idx_api_counter_logs_created_at ON api_counter_logs(created_at DESC);"
if %errorlevel% equ 0 (echo ✓ api_counter_logs 인덱스 생성 완료) else (echo ✗ 오류 발생)

echo.
echo ===============================================
echo 테이블 생성 확인 중...
echo ===============================================
echo.

docker exec postgres psql -U %DB_USER% -d %DB_NAME% -c "\dt email_logs api_counter_logs"

echo.
echo ===============================================
echo 완료!
echo ===============================================
echo.


pause

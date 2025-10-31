@echo off
REM 🚀 Build Your Perfect Actuator - NAS 배포 스크립트 (Windows)
REM 사용법: deploy.bat

setlocal enabledelayedexpansion

echo.
echo ================================================
echo 🚀 Build Your Perfect Actuator - NAS 배포
echo ================================================
echo.

REM 현재 디렉토리 확인
if not exist "docker-compose.prod.yaml" (
    echo ❌ 오류: docker-compose.prod.yaml 파일을 찾을 수 없습니다.
    echo 프로젝트 루트 디렉토리에서 실행하세요.
    pause
    exit /b 1
)

REM .env 파일 확인
if not exist ".env" (
    echo ⚠️  .env 파일이 없습니다. .env.example에서 복사하겠습니다...
    copy .env.example .env
    echo ✅ .env 파일 생성됨
    echo.
    echo 🔧 .env 파일을 편집하여 NAS IP와 비밀번호를 설정하세요:
    echo    REACT_APP_BACKEND_URL=http://YOUR_NAS_IP:4004
    echo.
    pause
    exit /b 1
)

echo 📊 현재 상태 확인...
docker-compose -f docker-compose.prod.yaml ps

echo.
set /p continue="계속 진행하시겠습니까? (y/n): "
if /i not "%continue%"=="y" (
    echo 배포 취소됨
    exit /b 0
)

echo.
echo 🔨 빌드 중... ^(이 과정은 5-10분 소요됩니다^)
echo ================================================
docker-compose -f docker-compose.prod.yaml up --build -d

echo.
echo ⏳ 컨테이너 시작 대기 중... 5초
timeout /t 5 /nobreak

echo.
echo ✅ 배포 완료!
echo ================================================
echo.

echo 🌐 접속 정보:
echo    웹 사이트: http://NAS-IP:5005
echo    API 서버: http://NAS-IP:4004
echo    데이터베이스: localhost:5433 ^(내부용^)
echo.

echo 📊 서비스 상태:
docker-compose -f docker-compose.prod.yaml ps

echo.
echo 📝 로그 확인:
echo    전체 로그: docker-compose -f docker-compose.prod.yaml logs -f
echo    백엔드: docker-compose -f docker-compose.prod.yaml logs -f backend
echo    프론트엔드: docker-compose -f docker-compose.prod.yaml logs -f frontend
echo.

echo ================================================
echo ✨ 배포 완료! 브라우저에서 http://NAS-IP:5005 접속하세요.
echo ================================================
echo.

pause

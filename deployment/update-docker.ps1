# Synology NAS 자동 업데이트 스크립트 (Windows용)
# 이 스크립트는 GitHub에서 코드 변경이 있을 때 자동으로 실행됩니다

param(
    [string]$ProjectDir = "C:\actuator-minigame"
)

# 설정
$LogDir = Join-Path $ProjectDir "logs"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $LogDir "update-$Timestamp.log"
$RepoUrl = "https://github.com/wwg0523/ActuatorMinigame.git"

# 로그 디렉토리 생성
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# 로그 함수
function Log-Message {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

Log-Message "=== GitHub 자동 업데이트 시작 ==="
Log-Message "프로젝트 디렉토리: $ProjectDir"

# 프로젝트 디렉토리 확인
if (-not (Test-Path $ProjectDir)) {
    Log-Message "오류: 프로젝트 디렉토리를 찾을 수 없습니다: $ProjectDir"
    exit 1
}

try {
    # 프로젝트 디렉토리로 이동
    Set-Location $ProjectDir
    
    # Git 풀링
    Log-Message "Git 저장소 업데이트 중..."
    & git fetch origin main
    & git reset --hard origin/main
    Log-Message "Git 업데이트 완료"
    
    # Docker 컨테이너 정지
    Log-Message "Docker 컨테이너 정지 중..."
    & docker-compose -f docker-compose.prod.yaml down
    
    Log-Message "이미지 삭제 중..."
    & docker rmi actuator-back:latest 2>$null
    & docker rmi actuator-front:latest 2>$null
    
    # Docker 재빌드 및 시작
    Log-Message "Docker 이미지 재빌드 및 실행 중..."
    & docker-compose -f docker-compose.prod.yaml up -d
    
    # 컨테이너 상태 확인
    Log-Message "컨테이너 상태 확인 중..."
    Start-Sleep -Seconds 5
    
    $ContainerStatus = & docker-compose -f docker-compose.prod.yaml ps
    
    if ($ContainerStatus -match "Up") {
        Log-Message "✓ 컨테이너가 정상적으로 실행 중입니다"
    }
    else {
        Log-Message "✗ 컨테이너 실행 중 문제가 발생했습니다"
        & docker-compose -f docker-compose.prod.yaml logs | Tee-Object -FilePath $LogFile -Append
        exit 1
    }
    
    Log-Message "=== GitHub 자동 업데이트 완료 ==="
    Log-Message "로그 파일: $LogFile"
}
catch {
    Log-Message "오류 발생: $_"
    exit 1
}

/**
 * GitHub Webhook 수신 서버
 * 
 * 이 서버는 GitHub에서 push 이벤트를 받아 자동으로 배포 스크립트를 실행합니다.
 * 
 * GitHub 설정:
 * 1. Repository Settings > Webhooks > Add webhook
 * 2. Payload URL: http://[NAS_IP]:[PORT]/webhook
 * 3. Content type: application/json
 * 4. Events: Push events
 * 5. Secret: .env 파일의 WEBHOOK_SECRET 값으로 설정
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config();

const PORT = process.env.WEBHOOK_PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const UPDATE_SCRIPT = process.env.UPDATE_SCRIPT || '/volume1/build-your-perfect-actuator/update-docker.sh';
const LOG_DIR = '/volume1/build-your-perfect-actuator/logs';

// 로그 디렉토리 생성
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * 로그 함수
 */
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    const logFile = path.join(LOG_DIR, `webhook-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logMessage + '\n');
}

/**
 * GitHub Webhook 서명 검증
 */
function verifyGitHubSignature(req, body) {
    const signature = req.headers['x-hub-signature-256'];
    
    if (!signature) {
        log('경고: Webhook 서명이 없습니다');
        return false;
    }
    
    const hash = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    
    const expectedSignature = `sha256=${hash}`;
    
    return crypto.timingSafeEqual(signature, expectedSignature);
}

/**
 * 업데이트 스크립트 실행
 */
function executeUpdateScript() {
    log('업데이트 스크립트 실행 중...');
    
    // Unix 시스템용
    if (process.platform !== 'win32') {
        exec(`bash ${UPDATE_SCRIPT}`, (error, stdout, stderr) => {
            if (error) {
                log(`오류: ${error.message}`);
                log(`stderr: ${stderr}`);
                return;
            }
            log('업데이트 완료');
            log(`출력: ${stdout}`);
        });
    }
    // Windows용 (PowerShell)
    else {
        const psCommand = `powershell -ExecutionPolicy Bypass -File "${UPDATE_SCRIPT.replace(/\//g, '\\')}"`; 
        exec(psCommand, (error, stdout, stderr) => {
            if (error) {
                log(`오류: ${error.message}`);
                log(`stderr: ${stderr}`);
                return;
            }
            log('업데이트 완료');
            log(`출력: ${stdout}`);
        });
    }
}

/**
 * HTTP 서버 생성
 */
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                // GitHub 서명 검증
                if (!verifyGitHubSignature(req, body)) {
                    log('경고: 잘못된 Webhook 서명');
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Unauthorized' }));
                    return;
                }
                
                const payload = JSON.parse(body);
                
                log(`Webhook 수신: ${payload.repository.full_name}`);
                log(`Branch: ${payload.ref}`);
                log(`Pusher: ${payload.pusher.name}`);
                log(`Commits: ${payload.commits.length}`);
                
                // 커밋 정보 로깅
                payload.commits.forEach((commit, index) => {
                    log(`  [${index + 1}] ${commit.message} (${commit.author.name})`);
                });
                
                // main 브랜치의 push만 처리
                if (payload.ref === 'refs/heads/main') {
                    log('main 브랜치 푸시 감지 - 업데이트 시작');
                    executeUpdateScript();
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: 'success',
                        message: '업데이트 시작됨'
                    }));
                } else {
                    log(`${payload.ref} 브랜치는 무시됨 (main만 배포)`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: 'ignored',
                        message: 'main 브랜치만 배포됩니다'
                    }));
                }
            } catch (error) {
                log(`오류: ${error.message}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad Request' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/health') {
        // 헬스 체크 엔드포인트
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy',
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    log(`=== GitHub Webhook 서버 시작 ===`);
    log(`포트: ${PORT}`);
    log(`Webhook URL: http://[NAS_IP]:${PORT}/webhook`);
    log(`헬스 체크: http://[NAS_IP]:${PORT}/health`);
});

// 에러 처리
server.on('error', (error) => {
    log(`서버 오류: ${error.message}`);
});

process.on('uncaughtException', (error) => {
    log(`미처리 예외: ${error.message}`);
});

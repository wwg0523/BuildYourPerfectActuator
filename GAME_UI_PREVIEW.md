# 🎮 Actuator Challenge - Game UI Preview

## 게임 화면 구성

### 1️⃣ 게임 시작 화면 (Question 1/5)

```
┌─────────────────────────────────────────────────────────────┐
│  Question 1/5                              ⏱️ 1:00          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ❓ Which of the following is NOT required for the          │
│     "Medical Scanner Rotation"?                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Required components: Select the ONE that is NOT needed  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  Servo Motor         │  │  Planetary Gearbox   │         │
│  │   (선택 가능)         │  │   (선택 가능)         │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  Optical Encoder     │  │ ▶ Stepper Motor ◀   │         │
│  │   (선택 가능)         │  │   (선택됨)            │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                               │
│                                                               │
│              ┌─────────────────────────┐                    │
│              │   SUBMIT ANSWER         │                    │
│              └─────────────────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 답변 피드백 모달 (정답)

```
        ┌──────────────────────────┐
        │         ✅               │
        │                          │
        │      Correct!            │
        │                          │
        │  Your answer:            │
        │  Stepper Motor           │
        │                          │
        │  ┌──────────────────────┐│
        │  │  Next Question       ││
        │  └──────────────────────┘│
        │                          │
        └──────────────────────────┘
```

---

## 📊 답변 피드백 모달 (오답)

```
        ┌──────────────────────────┐
        │         ❌               │
        │                          │
        │     Incorrect!           │
        │                          │
        │  Your answer:            │
        │  Servo Motor             │
        │                          │
        │  ┌──────────────────────┐│
        │  │ Correct answer:      ││
        │  │ Stepper Motor        ││
        │  └──────────────────────┘│
        │  ┌──────────────────────┐│
        │  │  Next Question       ││
        │  └──────────────────────┘│
        │                          │
        └──────────────────────────┘
```

---

## 🎯 게임 진행 흐름

### Question 1
- **Application**: Medical Scanner Rotation
- **Required Components**: 
  - servo_motor ✓
  - planetary_gearbox ✓
  - optical_encoder ✓
  - servo_drive ✓
  - thrust_bearing ✓
- **Options**: (무작위 섞임)
  1. Servo Motor (필요함)
  2. Planetary Gearbox (필요함)
  3. Optical Encoder (필요함)
  4. **Stepper Motor** ✅ (정답: 필요 없음)

### Question 2
- **Application**: CNC Milling Spindle
- **Required Components**: 
  - servo_motor ✓
  - spur_gearbox ✓
  - optical_encoder ✓
  - servo_drive ✓
  - ball_bearing ✓
- **Options**: (무작위 섞임)
  1. Servo Motor (필요함)
  2. Spur Gearbox (필요함)
  3. Optical Encoder (필요함)
  4. **Stepper Drive** ✅ (정답: 필요 없음)

### Question 3-5
(유사하게 계속...)

---

## 🎨 UI 색상 스키마

- **Header**: 자주색 그래디언트 (#667eea → #764ba2)
- **Selected Button**: 파란색 (#667eea)
- **Correct Modal**: 녹색 테두리 (#4caf50)
- **Incorrect Modal**: 빨강색 테두리 (#f44336)
- **Info Box**: 파란색 배경 (#e3f2fd)

---

## 📱 반응형 디자인

- Desktop: 800px max-width
- Tablet/Mobile: 자동 스케일링
- 버튼: 호버 시 그림자 효과

---

## ⏱️ 타이머

- 각 질문: 60초
- 타이머 형식: `M:SS` (예: 1:00, 0:45)
- 타임아웃 시: 자동 다음 질문으로 진행

---

## 🏆 게임 결과

5개 질문 모두 완료 후:
- ✅ 정답 개수/5
- ⏱️ 소요 시간
- 🎯 최종 점수
- 🏅 일일 순위

---

## 📝 컴포넌트 데이터

### 모터 (Motors)
- Servo Motor
- AC Motor
- Stepper Motor

### 기어박스 (Gearboxes)
- Harmonic Gearbox
- Planetary Gearbox
- Spur Gearbox

### 엔코더 (Encoders)
- Absolute Encoder
- Optical Encoder
- Incremental Encoder

### 드라이브 (Drives)
- Servo Drive
- Stepper Drive
- AC Drive

### 베어링 (Bearings)
- Ball Bearing
- Roller Bearing
- Thrust Bearing

---

## 🎮 사용자 경험 흐름

1. **홈 화면** → 사용자 정보 입력 → 약관 동의
2. **정보 화면** → 게임 설명 확인
3. **게임 화면** → 5개 질문 순서대로 풀기
   - 각 질문마다 선택지 선택 → Submit
   - 즉시 피드백 모달 표시
   - Next Question 클릭 → 다음 문제
4. **결과 화면** → 점수, 순위, 타임 보너스 표시
5. **리더보드** → 일일 순위 확인


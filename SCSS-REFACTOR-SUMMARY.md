# SCSS 클래스 충돌 해결 - 리팩토링 요약

## 문제점
각 페이지의 SCSS 파일들이 **전역 범위에서 동일한 클래스명**을 사용하고 있어서 CSS 우선순위 충돌이 발생하고 있었습니다.

### 발견된 충돌 사례
1. **Result.scss vs Game.scss**
   - `.header-button` 클래스가 중복됨
   - `.header-title` 클래스가 중복됨

2. **Guide.scss vs main.scss**
   - `.button` 클래스가 중복됨
   - `.button-primary`, `.button-secondary` 클래스가 충돌 가능

3. **Leaderboard.scss vs 다른 페이지**
   - `.header-button`, `.header-title` 클래스가 중복됨
   - `.actions`, `.btn` 클래스가 중복될 가능성

4. **Game.scss 내부 클래스들**
   - `.option-button`, `.ox-button` 등이 범용 이름
   - `.feedback-modal`, `.modal-*` 클래스들이 범용 이름

## 해결 방법: 페이지별 고유 접두사 적용

모든 페이지의 클래스명에 **페이지별 고유 접두사**를 추가했습니다.

### 수정된 클래스명 매핑

#### Result 페이지 (result- 접두사)
```
header-button → result-header-button
header-title → result-header-title
```

#### Game 페이지 (game- 접두사)
```
header-left → game-header-left
header-right → game-header-right
header-button → game-header-button
home-button → game-home-button
question-header-inline → game-question-header-inline
timer-inline → game-timer-inline
timer-fixed → game-timer-fixed
question-header-fixed → game-question-header-fixed
question-header → game-question-header
question-image → game-question-image
options-grid → game-options-grid
option-button → game-option-button
submit-button → game-submit-button
submit-button-fixed → game-submit-button-fixed
submit-button-inline → game-submit-button-inline
feedback-modal → game-feedback-modal
modal-icon → game-modal-icon
modal-selected → game-modal-selected
modal-correct → game-modal-correct
modal-button → game-modal-button
ox-options → game-ox-options
ox-button → game-ox-button
ox-label → game-ox-label
ox-text → game-ox-text
```

#### Guide 페이지 (guide- 접두사)
```
button → guide-button
button-primary → guide-button-primary
button-secondary → guide-button-secondary
```

#### Leaderboard 페이지 (leaderboard- 접두사)
```
header-title → leaderboard-header-title
header-button → leaderboard-header-button
actions → leaderboard-actions
btn → leaderboard-btn
btn.play → leaderboard-btn-play
btn.home → leaderboard-btn-home
```

## 수정된 파일 목록

### SCSS 파일
- ✅ `src/pages/Result/Result.scss`
- ✅ `src/pages/Game/Game.scss`
- ✅ `src/pages/Guide/Guide.scss`
- ✅ `src/pages/Leaderboard/Leaderboard.scss`

### TSX 파일
- ✅ `src/pages/Result/Result.tsx`
- ✅ `src/pages/Game/Game.tsx`
- ✅ `src/pages/Leaderboard/Leaderboard.tsx`

### 영향받지 않는 페이지
- Info 페이지: 이미 `info-card` 클래스로 격리됨
- Home 페이지: 페이지 고유의 클래스들만 사용
- GameStart 페이지: 충돌하는 클래스 없음
- Explanation 페이지: `page-explanation` 래퍼 하에 격리됨

## 빌드 결과
✅ **빌드 성공** - 경고 없이 컴파일됨 (기존 eslint 경고는 별도)

```
Compiled with warnings.
File sizes after gzip:
  264.83 kB (+1.4 kB)  build/static/js/main.30c398bf.js
  8.84 kB (+974 B)     build/static/css/main.ae4a770e.css
```

## 핵심 개선사항
1. **CSS 우선순위 충돌 해결** - 각 페이지의 스타일이 독립적으로 작동
2. **유지보수성 향상** - 향후 새로운 페이지 추가 시 같은 방식으로 접두사 적용 가능
3. **스코핑 강화** - `.page-{name}` 래퍼 내에 모든 자식 클래스들이 격리됨
4. **명확성 증가** - 클래스명만 봐도 어느 페이지의 스타일인지 명확함

## 향후 권장사항
새로운 페이지를 추가할 때는:
1. 페이지 고유의 접두사를 결정 (예: `newpage-`)
2. SCSS의 모든 클래스명에 접두사 추가
3. TSX의 모든 className을 일치하게 업데이트
4. 최상위 래퍼를 `.page-{name}`으로 설정

이를 통해 CSS 충돌 없이 안정적인 스타일링 구조를 유지할 수 있습니다.

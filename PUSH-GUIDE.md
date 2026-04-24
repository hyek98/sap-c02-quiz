# GitHub 푸시 가이드

## 현재 상태
✅ Git 저장소 생성 완료
✅ 자동 동기화 기능 추가 완료
✅ 2개 커밋 완료

## GitHub에 푸시하기

### 1단계: Personal Access Token 생성 (저장소 푸시용)

1. 링크 열기: https://github.com/settings/tokens/new

2. 설정:
   - **Note**: `sap-c02-quiz-repo`
   - **Expiration**: 90 days (또는 No expiration)
   - **Scope**: ✅ **repo** (전체 선택)
   - "Generate token" 클릭

3. 토큰 복사 (ghp_xxxxxxxxxxxx)
   ⚠️ 한 번만 보여주므로 꼭 복사!

### 2단계: Git Remote 설정 및 푸시

```bash
cd /Users/jacob/Desktop/sap-c02-quiz

# Remote 추가
git remote add origin https://github.com/hyek98/sap-c02-quiz.git

# 푸시
git push -u origin main

# Username: hyek98
# Password: [복사한 토큰 붙여넣기]
```

### 3단계: 토큰 저장 (선택사항)

다음부터 토큰 입력 안하려면:

```bash
git config --global credential.helper osxkeychain
```

### 4단계: GitHub Pages 활성화

1. https://github.com/hyek98/sap-c02-quiz 접속
2. **Settings** → **Pages** 클릭
3. **Source**:
   - Branch: **main**
   - Folder: **/ (root)**
4. **Save** 클릭

### 5단계: 접속 확인 (1-2분 후)

```
https://hyek98.github.io/sap-c02-quiz/
```

## 자동 동기화 설정 (모의고사용)

위의 GitHub Pages URL로 접속한 후:

1. **토큰 생성** (Gist용 - 별도):
   https://github.com/settings/tokens/new
   - Scope: ✅ **gist** (이것만!)

2. 모의고사 홈 화면 → "⚙️ 자동 동기화 설정"
   - 토큰 입력
   - "자동 동기화 활성화" 체크
   - 저장

3. 다른 기기에서도 같은 토큰 입력

---

## 완료! 🎉

이제 집, 사무실, 핸드폰 어디서나:
- 📱 모의고사 접속
- 🔄 자동으로 학습 진행 상황 동기화
- ✨ 끊김 없는 학습 경험

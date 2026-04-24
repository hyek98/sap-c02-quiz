# GitHub 저장소 설정 가이드

## 1단계: GitHub 저장소 생성

1. GitHub에 로그인: https://github.com/hyek98
2. 우측 상단 **"+"** 클릭 → **"New repository"**
3. 저장소 정보 입력:
   - **Repository name**: `sap-c02-quiz`
   - **Description**: `AWS SAP-C02 모의고사 - 610문제, 상세 해설, 실전 모의고사, 크로스 디바이스 동기화`
   - **Public** 선택 (누구나 접속 가능하도록)
   - **README 추가 안함** (이미 로컬에 있음)
4. **"Create repository"** 클릭

## 2단계: 로컬 저장소와 연결

터미널에서 다음 명령어 실행:

```bash
cd /Users/jacob/Desktop/sap-c02-quiz

# GitHub 저장소와 연결
git remote add origin https://github.com/hyek98/sap-c02-quiz.git

# main 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 3단계: GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. 상단 **"Settings"** 클릭
3. 왼쪽 메뉴에서 **"Pages"** 클릭
4. **Source** 섹션에서:
   - Branch: **main** 선택
   - Folder: **/ (root)** 선택
5. **"Save"** 클릭
6. 1-2분 후 페이지가 활성화됩니다

## 4단계: 접속 확인

다음 URL로 접속:
```
https://hyek98.github.io/sap-c02-quiz/
```

## 완료! 🎉

이제 다음 기기에서 접속 가능:
- 💻 PC/Mac 브라우저
- 📱 스마트폰 브라우저
- 🏠 집
- 🏢 사무실
- ☕ 카페

## 데이터 동기화 방법

### 핸드폰에서 풀던 문제를 PC에서 이어하기

1. **핸드폰**에서:
   - 홈 화면 → **"📤 데이터 내보내기"** 클릭
   - JSON 파일 다운로드
   - 이메일, 카카오톡, 드라이브 등으로 자신에게 전송

2. **PC**에서:
   - https://hyek98.github.io/sap-c02-quiz/ 접속
   - 홈 화면 → **"📥 데이터 가져오기"** 클릭
   - 전송받은 JSON 파일 선택
   - **"병합"** 선택 (기존 데이터 유지)

### 자동 백업 추천

일주일에 한 번 데이터 내보내기하여 백업 보관!

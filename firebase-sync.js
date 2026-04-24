// ── FIREBASE REALTIME DATABASE SYNC ──

// Firebase 설정
let firebaseConfig = null;
let database = null;
let userId = localStorage.getItem('firebase_user_id') || generateUserId();

function generateUserId() {
  const id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  localStorage.setItem('firebase_user_id', id);
  return id;
}

// Firebase 초기화
function initFirebase(config) {
  if (!window.firebase) {
    console.error('Firebase SDK가 로드되지 않았습니다.');
    return false;
  }

  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(config);
    }
    database = firebase.database();
    firebaseConfig = config;
    localStorage.setItem('firebase_config', JSON.stringify(config));

    // 실시간 동기화 리스너 등록
    setupRealtimeSync();

    console.log('✅ Firebase 연결 완료');
    return true;
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    return false;
  }
}

// 저장된 설정 불러오기
function loadFirebaseConfig() {
  const saved = localStorage.getItem('firebase_config');
  if (saved) {
    const config = JSON.parse(saved);
    initFirebase(config);
  }
}

// 디바운싱 타이머
let syncTimer = null;

// Firebase에 저장
function syncToFirebase() {
  if (!database) return;

  // 기존 타이머 취소
  if (syncTimer) clearTimeout(syncTimer);

  // 1초 후 실행 (디바운싱)
  syncTimer = setTimeout(() => {
    const data = {
      progress: st.ps,
      bookmarks: st.bm,
      history: st.hist,
      lastSync: Date.now()
    };

    database.ref('users/' + userId).set(data)
      .then(() => {
        console.log('✅ Firebase 저장 완료');
      })
      .catch(error => {
        console.error('❌ Firebase 저장 실패:', error);
      });
  }, 1000);
}

// 실시간 동기화 리스너
let isLocalUpdate = false;

function setupRealtimeSync() {
  if (!database) return;

  const userRef = database.ref('users/' + userId);

  userRef.on('value', (snapshot) => {
    // 로컬 업데이트로 인한 이벤트면 무시
    if (isLocalUpdate) {
      isLocalUpdate = false;
      return;
    }

    const data = snapshot.val();
    if (!data) return;

    console.log('📥 Firebase에서 데이터 수신');

    // 데이터 병합
    st.ps = { ...st.ps, ...(data.progress || {}) };
    st.bm = { ...st.bm, ...(data.bookmarks || {}) };

    // 히스토리 병합 (중복 제거)
    if (data.history) {
      const histSet = new Set([...st.hist, ...data.history].map(h => JSON.stringify(h)));
      st.hist = Array.from(histSet).map(h => JSON.parse(h));
    }

    // localStorage 저장 (save() 호출하지 않음 - 무한 루프 방지)
    try {
      localStorage.setItem('sapc02v2', JSON.stringify(st));
    } catch(e) {}

    updateHome();
    updateBadges();

    console.log('✅ 동기화 완료:', Object.keys(st.ps).length, '문제');
  });
}

// save 함수 래핑
const originalSave = window.save;
window.save = function() {
  originalSave.call(this);

  if (database) {
    isLocalUpdate = true;
    syncToFirebase();
  }
};

// Firebase 설정 UI
function openFirebaseSettings() {
  const modal = document.getElementById('modal-ov');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalOk = document.getElementById('modal-ok');

  const currentConfig = firebaseConfig || {};

  modalTitle.textContent = '⚙️ Firebase 동기화 설정';
  modalBody.innerHTML = `
    <div style="text-align:left;">
      <p style="margin-bottom:16px;">Firebase Realtime Database로 실시간 자동 동기화하세요.</p>

      <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">API Key:</label>
      <input type="text" id="firebase-apiKey" placeholder="AIza..."
             value="${currentConfig.apiKey || ''}"
             style="width:100%;padding:8px;border:1px solid var(--border);border-radius:5px;background:var(--surface2);color:var(--text);margin-bottom:12px;font-size:13px;">

      <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Database URL:</label>
      <input type="text" id="firebase-databaseURL" placeholder="https://xxx.firebaseio.com"
             value="${currentConfig.databaseURL || ''}"
             style="width:100%;padding:8px;border:1px solid var(--border);border-radius:5px;background:var(--surface2);color:var(--text);margin-bottom:12px;font-size:13px;">

      <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Project ID:</label>
      <input type="text" id="firebase-projectId" placeholder="xxx"
             value="${currentConfig.projectId || ''}"
             style="width:100%;padding:8px;border:1px solid var(--border);border-radius:5px;background:var(--surface2);color:var(--text);margin-bottom:16px;font-size:13px;">

      <details style="margin-bottom:12px;">
        <summary style="cursor:pointer;color:var(--accent);font-size:12px;margin-bottom:8px;">📖 설정 방법</summary>
        <ol style="font-size:11px;color:var(--text3);line-height:1.6;padding-left:20px;">
          <li><a href="https://console.firebase.google.com/" target="_blank" style="color:var(--accent);">Firebase Console</a> 접속</li>
          <li>"프로젝트 추가" 클릭 → 프로젝트 이름 입력</li>
          <li>좌측 메뉴 → "Realtime Database" → "데이터베이스 만들기"</li>
          <li>테스트 모드로 시작 (규칙은 나중에 변경 가능)</li>
          <li>프로젝트 설정 (⚙️) → "내 앱" → 웹 앱 추가</li>
          <li>설정 정보 복사 → 여기에 입력</li>
        </ol>
      </details>

      <p style="font-size:11px;color:var(--text3);line-height:1.5;">
        ⚡ <strong>실시간 동기화:</strong> 데이터가 자동으로 모든 기기에 즉시 반영됩니다.<br>
        🆔 <strong>사용자 ID:</strong> <code style="background:var(--surface3);padding:2px 6px;border-radius:3px;font-size:10px;">${userId}</code>
      </p>
    </div>
  `;

  modalOk.textContent = '저장';
  modalOk.onclick = () => {
    const config = {
      apiKey: document.getElementById('firebase-apiKey').value.trim(),
      databaseURL: document.getElementById('firebase-databaseURL').value.trim(),
      projectId: document.getElementById('firebase-projectId').value.trim()
    };

    if (config.apiKey && config.databaseURL && config.projectId) {
      if (initFirebase(config)) {
        // 초기 데이터 업로드
        syncToFirebase();
        alert('✅ Firebase 연결 완료!\n실시간 동기화가 활성화되었습니다.');
      } else {
        alert('❌ Firebase 연결 실패\n설정을 확인해주세요.');
      }
    } else {
      alert('⚠️ 모든 필드를 입력해주세요.');
    }

    closeModal();
  };

  modal.classList.add('open');
}

// 페이지 로드 시 Firebase 초기화
window.addEventListener('load', () => {
  loadFirebaseConfig();
});
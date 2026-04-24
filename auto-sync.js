// ── AUTO SYNC WITH GITHUB GIST ──

// 설정 저장소
const syncConfig = {
  token: localStorage.getItem('github_token') || '',
  gistId: localStorage.getItem('gist_id') || '',
  autoSync: localStorage.getItem('auto_sync') === 'true',
  lastSync: localStorage.getItem('last_sync') || 0
};

// GitHub Gist API 헬퍼
const gistAPI = {
  async create(token, data) {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'AWS SAP-C02 학습 데이터',
        public: false,
        files: {
          'sap-c02-progress.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });
    return response.json();
  },

  async update(token, gistId, data) {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'sap-c02-progress.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });
    return response.json();
  },

  async get(token, gistId) {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    return response.json();
  }
};

// 자동 동기화 함수
async function autoSyncToGist() {
  if (!syncConfig.autoSync || !syncConfig.token) return;

  const now = Date.now();
  // 10초 이내 중복 동기화 방지
  if (now - syncConfig.lastSync < 10000) return;

  try {
    const data = {
      version: '1.0',
      syncDate: new Date().toISOString(),
      progress: st.ps,
      bookmarks: st.bm,
      history: st.hist
    };

    if (!syncConfig.gistId) {
      // Gist 생성
      const result = await gistAPI.create(syncConfig.token, data);
      syncConfig.gistId = result.id;
      localStorage.setItem('gist_id', result.id);
    } else {
      // Gist 업데이트
      await gistAPI.update(syncConfig.token, syncConfig.gistId, data);
    }

    syncConfig.lastSync = now;
    localStorage.setItem('last_sync', now);
  } catch (error) {
    console.error('자동 동기화 실패:', error);
  }
}

// 데이터 불러오기
async function syncFromGist() {
  if (!syncConfig.token || !syncConfig.gistId) return;

  try {
    const gist = await gistAPI.get(syncConfig.token, syncConfig.gistId);
    const content = gist.files['sap-c02-progress.json'].content;
    const data = JSON.parse(content);

    // 병합 로직: 최신 데이터 유지
    Object.keys(data.progress || {}).forEach(num => {
      const remote = data.progress[num];
      const local = st.ps[num];

      // 원격이 최신이거나 로컬에 없으면 원격 데이터 사용
      if (!local || (remote.answered && !local.answered)) {
        st.ps[num] = remote;
      }
    });

    // 북마크와 히스토리 병합
    Object.assign(st.bm, data.bookmarks || {});
    st.hist = [...st.hist, ...(data.history || [])];

    save();
    updateHome();
    updateBadges();

    console.log('✅ Gist에서 데이터 동기화 완료');
  } catch (error) {
    console.error('데이터 불러오기 실패:', error);
  }
}

// save 함수 래핑 (자동 동기화 트리거)
const originalSave = window.save;
window.save = function() {
  originalSave.call(this);
  if (syncConfig.autoSync) {
    autoSyncToGist();
  }
};

// 동기화 설정 UI
function openSyncSettings() {
  const modal = document.getElementById('modal-ov');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalOk = document.getElementById('modal-ok');

  modalTitle.textContent = '⚙️ 자동 동기화 설정';
  modalBody.innerHTML = `
    <div style="text-align:left;">
      <p style="margin-bottom:16px;">GitHub Gist로 자동 동기화하여 모든 기기에서 학습 진행 상황을 공유하세요.</p>
      
      <label style="display:block;margin-bottom:8px;font-weight:600;">GitHub Personal Access Token:</label>
      <input type="text" id="token-input" placeholder="ghp_xxxxxxxxxxxx" 
             value="${syncConfig.token}" 
             style="width:100%;padding:8px;border:1px solid var(--border);border-radius:5px;background:var(--surface2);color:var(--text);margin-bottom:16px;">
      
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <input type="checkbox" id="auto-sync-check" ${syncConfig.autoSync ? 'checked' : ''}>
        <label for="auto-sync-check">자동 동기화 활성화</label>
      </div>
      
      <p style="font-size:12px;color:var(--text3);line-height:1.5;">
        💡 토큰 생성: <a href="https://github.com/settings/tokens/new" target="_blank" style="color:var(--accent);">GitHub Settings</a><br>
        권한: ✅ gist 선택
      </p>
    </div>
  `;

  modalOk.textContent = '저장';
  modalOk.onclick = async () => {
    const token = document.getElementById('token-input').value.trim();
    const autoSync = document.getElementById('auto-sync-check').checked;

    if (token) {
      syncConfig.token = token;
      syncConfig.autoSync = autoSync;
      localStorage.setItem('github_token', token);
      localStorage.setItem('auto_sync', autoSync);

      // 초기 동기화
      if (autoSync) {
        await autoSyncToGist();
        await syncFromGist();
      }

      alert('✅ 동기화 설정이 저장되었습니다!');
    }

    closeModal();
  };

  modal.classList.add('open');
}

// 수동 동기화 트리거
async function manualSync() {
  if (!syncConfig.token) {
    openSyncSettings();
    return;
  }

  try {
    await autoSyncToGist();
    await syncFromGist();
    alert('✅ 동기화 완료!');
  } catch (error) {
    alert('❌ 동기화 실패: ' + error.message);
  }
}

// 페이지 로드 시 자동 동기화
window.addEventListener('load', async () => {
  if (syncConfig.autoSync && syncConfig.token) {
    await syncFromGist();
  }
});

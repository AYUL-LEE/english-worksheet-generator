// 전역 변수
let generatedResults = {};
let generatedHTML = '';
let historyData = [];

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    const passageInput = document.getElementById('passageInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const resultSection = document.getElementById('resultSection');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const previewBtn = document.getElementById('previewHtml');
    const previewModal = document.getElementById('previewModal');
    const closeModal = document.getElementById('closeModal');

    // 이벤트 리스너 등록
    passageInput.addEventListener('input', updatePassageCount);
    generateBtn.addEventListener('click', generateWorksheet);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    previewBtn.addEventListener('click', showPreview);
    closeModal.addEventListener('click', hidePreview);
    
    // 전체 선택 버튼들
    document.getElementById('selectAllAnalysis').addEventListener('click', selectAllAnalysis);
    document.getElementById('selectAllWorkbook').addEventListener('click', selectAllWorkbook);
    document.getElementById('deselectAll').addEventListener('click', deselectAll);
     // 히스토리 관련
    document.getElementById('clearHistory').addEventListener('click', clearAllHistory);
    
    // 히스토리 로드
    loadHistory();

    // 모달 외부 클릭 시 닫기
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            hidePreview();
        }
    });

    // 초기 설정 로드
    loadSavedSettings();
    updatePassageCount();
});

// 지문 개수 업데이트 함수
function updatePassageCount() {
    const text = document.getElementById('passageInput').value.trim();
    const passageCountElement = document.getElementById('passageCount');
    
    if (!text) {
        passageCountElement.textContent = '현재 지문 수: 0/5';
        passageCountElement.className = '';
        return;
    }
    
    // 3개 이상의 하이픈으로 구분
    const passages = text.split(/---+/)
                        .map(p => p.trim())
                        .filter(p => p.length > 0);
    
    const count = passages.length;
    passageCountElement.textContent = `현재 지문 수: ${count}/5`;
    
    // 개수에 따른 스타일 변경
    passageCountElement.className = '';
    if (count > 5) {
        passageCountElement.classList.add('error');
    } else if (count >= 4) {
        passageCountElement.classList.add('warning');
    }
    
    // 생성 버튼 활성화/비활성화
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = count === 0 || count > 5;
}
function getSelectedTypes() {
    const safeCheck = (id) => {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    };
    
    return {
        type01: safeCheck('type01'),
        type02: safeCheck('type02'),
        type03: safeCheck('type03'),
        type04: safeCheck('type04'),
        type05: safeCheck('type05'),
        type06: safeCheck('type06'),
        type07: safeCheck('type07'),
        type08: safeCheck('type08'),
        type09: safeCheck('type09')
    };
}

// 지문 파싱
function parsePassages() {
    const text = document.getElementById('passageInput').value.trim();
    
    if (!text) {
        return [];
    }
    
    return text.split(/---+/)
              .map(p => p.trim())
              .filter(p => p.length > 0);
}

// 학습지 생성
async function generateWorksheet() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('model').value;
    const passages = parsePassages();
    const selectedTypes = getSelectedTypes();
    
    // 입력 검증
    const errors = validateInputs();
    if (!showErrors(errors)) {
        return;
    }
    
    // API 키 저장
    saveSettings();
    
    // UI 업데이트
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('resultSection').style.display = 'none';
    
    const progressInfo = document.getElementById('progressInfo');
    const selectedTypeCount = Object.values(selectedTypes).filter(Boolean).length;
    const totalTasks = passages.length * selectedTypeCount;
    
    progressInfo.textContent = `총 ${totalTasks}개 작업을 처리합니다...`;
    
 try {
        const response = await fetch('/api/generate-worksheet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                passages,
                apiKey,
                model,
                selectedTypes
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            generatedResults = data.results;
            
            // HTML 생성
            generatedHTML = generatePreviewHTML(data.results, data.passageCount, selectedTypes);
            
            // 히스토리에 저장 ⭐ 여기 추가
            if (data.debug && data.debug[0]) {
                saveToHistory(data.debug[0].rawJSON, data.passageCount, selectedTypes);
            }
            
            // 결과 섹션 표시
            document.getElementById('resultSection').style.display = 'block';
            
            // 생성 요약 표시
            const summary = `✅ 생성 완료: ${data.passageCount}개 지문, ${selectedTypeCount}개 유형
📊 총 ${Object.keys(data.results).length}개 학습자료 생성됨`;
            
            document.getElementById('generationSummary').textContent = summary;
            
        } else {
            alert('오류: ' + data.error);
        }
        
    } catch (error) {
        // 에러 처리...
    }
    
}

// 기존 generatePreviewHTML 함수 삭제하고 아래로 교체
function generatePreviewHTML(results, passageCount, selectedTypes) {
  const currentDate = new Date().toLocaleDateString('ko-KR');
  
  let html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; 
            background: white;
        }
        
        /* 페이지 구분 */
        .page-break {
            page-break-after: always;
            height: 0;
            margin: 0;
            padding: 0;
        }
        
        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            .page-break {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
`;

  // 지문별로 HTML 삽입
  for (let passageIndex = 0; passageIndex < passageCount; passageIndex++) {
    const types = [
      '01_문단개요',
      '02_본문노트_직독직해',
      '03_본문노트_의역',
      '04_문장분석',
      '05_어순배열',
      '06_단어',
      '07_구문',
      '08_핵심어휘',
      '09_한줄해석'
    ];
    
    for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
      const type = types[typeIndex];
      const key = `${type}_passage${passageIndex}`;
      const result = results[key];
      
      if (result && result.content) {
        html += result.content;
        
        // 마지막 유형이 아니면 페이지 구분 추가
        if (typeIndex < types.length - 1 || passageIndex < passageCount - 1) {
          html += '<div class="page-break"></div>';
        }
      }
    }
  }

  html += `</body></html>`;
  return html;
}

async function downloadPDF() {
    if (!generatedHTML) {
        alert('먼저 학습지를 생성해주세요.');
        return;
    }
    
    try {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                htmlContent: generatedHTML
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `영어학습지_${new Date().toISOString().slice(0,10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            alert('✅ PDF 다운로드 완료!');
        } else {
            throw new Error('PDF 생성 실패');
        }
        
    } catch (error) {
        console.error('PDF 다운로드 오류:', error);
        alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
}

// 미리보기 표시 함수도 수정
function showPreview() {
    if (!generatedHTML) {
        alert('먼저 학습지를 생성해주세요.');
        return;
    }
    
    const previewContent = document.getElementById('previewContent');
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    previewContent.innerHTML = '';
    previewContent.appendChild(iframe);
    
    // iframe에 HTML 삽입
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(generatedHTML);
    iframeDoc.close();
    
    document.getElementById('previewModal').style.display = 'flex';
}

// 미리보기 숨기기
function hidePreview() {
    document.getElementById('previewModal').style.display = 'none';
}


// 전체 선택 함수들도 수정
function selectAllAnalysis() {
    const analysisIds = ['type01', 'type04', 'type08', 'type09'];
    analysisIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.checked = true;
    });
}

function selectAllWorkbook() {
    const workbookIds = ['type02', 'type03', 'type05', 'type06', 'type07'];
    workbookIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.checked = true;
    });
}

function deselectAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}

// 설정 저장/로드
function loadSavedSettings() {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedModel = localStorage.getItem('selected_model');
    
    if (savedApiKey) {
        const apiKeyElement = document.getElementById('apiKey');
        if (apiKeyElement) apiKeyElement.value = savedApiKey;
    }
    
    if (savedModel) {
        const modelElement = document.getElementById('model');
        if (modelElement) modelElement.value = savedModel;
    }
}

function saveSettings() {
    const apiKeyElement = document.getElementById('apiKey');
    const modelElement = document.getElementById('model');
    
    const apiKey = apiKeyElement ? apiKeyElement.value.trim() : '';
    const model = modelElement ? modelElement.value : '';
    
    if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
    }
    if (model) {
        localStorage.setItem('selected_model', model);
    }
}

// 입력 검증 함수
function validateInputs() {
    const apiKeyElement = document.getElementById('apiKey');
    const apiKey = apiKeyElement ? apiKeyElement.value.trim() : '';
    const passages = parsePassages();
    const selectedTypes = getSelectedTypes();
    
    const errors = [];
    
    if (!apiKey) {
        errors.push('API 키를 입력해주세요.');
    }
    
    if (passages.length === 0) {
        errors.push('지문을 입력해주세요.');
    }
    
    if (passages.length > 5) {
        errors.push('최대 5개 지문까지 처리 가능합니다.');
    }
    
    const hasSelectedType = Object.values(selectedTypes).some(selected => selected);
    if (!hasSelectedType) {
        errors.push('최소 1개 이상의 학습지 유형을 선택해주세요.');
    }
    
    return errors;
}

// 에러 표시 함수
function showErrors(errors) {
    if (errors.length > 0) {
        alert('다음 문제를 확인해주세요:\n\n' + errors.join('\n'));
        return false;
    }
    return true;
}

// 알림 메시지 표시
function showAlert(message, type = 'success') {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const resultSection = document.getElementById('resultSection');
    if (resultSection) {
        resultSection.insertBefore(alert, resultSection.firstChild);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

// DOM 로드 완료 후 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // API 키 자동 저장
    const apiKeyElement = document.getElementById('apiKey');
    const modelElement = document.getElementById('model');
    
    if (apiKeyElement) {
        apiKeyElement.addEventListener('blur', saveSettings);
    }
    if (modelElement) {
        modelElement.addEventListener('change', saveSettings);
    }
});


// 히스토리 저장
function saveToHistory(jsonData, passageCount, selectedTypes) {
    const timestamp = new Date().toISOString();
    const id = `worksheet_${timestamp}`;
    
    const historyItem = {
        id: id,
        timestamp: timestamp,
        date: new Date().toLocaleString('ko-KR'),
        jsonData: jsonData,
        passageCount: passageCount,
        selectedTypes: selectedTypes,
        title: jsonData.passage?.korean_title || '제목 없음'
    };
    
    // LocalStorage에서 기존 히스토리 가져오기
    let history = JSON.parse(localStorage.getItem('worksheet_history') || '[]');
    
    // 새 항목 추가 (최신이 앞에)
    history.unshift(historyItem);
    
    // 최대 20개만 보관
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // 저장
    localStorage.setItem('worksheet_history', JSON.stringify(history));
    
    // 히스토리 UI 업데이트
    loadHistory();
}

// 히스토리 로드
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('worksheet_history') || '[]');
    historyData = history;
    
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-title">${item.title}</div>
                <div class="history-meta">
                    생성일: ${item.date} | 지문 수: ${item.passageCount}개
                </div>
            </div>
            <div class="history-actions-btn">
                <button class="history-btn download-btn" onclick="downloadHistoryPDF(${index})">
                    📥 PDF 다운로드
                </button>
                <button class="history-btn delete-btn" onclick="deleteHistoryItem(${index})">
                    🗑️ 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 히스토리에서 PDF 다운로드
async function downloadHistoryPDF(index) {
    const item = historyData[index];
    
    if (!item || !item.jsonData) {
        alert('데이터를 찾을 수 없습니다.');
        return;
    }
    
    try {
        // JSON → HTML 변환
        const htmlResults = {};
        
        for (let i = 0; i < item.passageCount; i++) {
            // renderAllTypes 함수 재사용
            const results = renderAllTypes(item.jsonData);
            
            for (const [type, html] of Object.entries(results)) {
                htmlResults[`${type}_passage${i}`] = {
                    type: type,
                    title: type.replace(/_/g, ' '),
                    content: html,
                    passageNum: i
                };
            }
        }
        
        // HTML 생성
        const html = generatePreviewHTML(htmlResults, item.passageCount, item.selectedTypes);
        
        // PDF 다운로드
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                htmlContent: html
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.title}_${new Date().toISOString().slice(0,10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            alert('✅ PDF 다운로드 완료!');
        }
        
    } catch (error) {
        console.error('PDF 다운로드 오류:', error);
        alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
}

// 히스토리 항목 삭제
function deleteHistoryItem(index) {
    if (!confirm('이 항목을 삭제하시겠습니까?')) {
        return;
    }
    
    let history = JSON.parse(localStorage.getItem('worksheet_history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('worksheet_history', JSON.stringify(history));
    
    loadHistory();
}

// 전체 히스토리 삭제
function clearAllHistory() {
    if (!confirm('모든 히스토리를 삭제하시겠습니까?')) {
        return;
    }
    
    localStorage.removeItem('worksheet_history');
    loadHistory();
}

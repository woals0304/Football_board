// 공통: URL 파라미터 추출 함수
function getQueryParam(key) {
    // URL에서 원하는 파라미터 값 반환
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
}

// ------------------------
// index.html 전용 로직
// ------------------------

// 리그 목록을 서버에서 불러와서 select에 표시
function loadLeagues() {
    fetch('/api/leagues')
        .then(res => res.json())
        .then(leagues => {
            const leagueSelect = document.getElementById('leagueSelect');
            if (!leagueSelect) return;
            leagueSelect.innerHTML = '';
            leagues.forEach(l => {
                const option = document.createElement('option');
                option.value = l.league_id;
                option.textContent = l.league_name;
                leagueSelect.appendChild(option);
            });
            loadTeams(leagueSelect.value); // 첫 리그에 맞는 팀 자동 로딩
        });
}

// 특정 리그에 속한 팀 목록을 서버에서 불러와서 select에 표시
function loadTeams(leagueId) {
    fetch(leagueId ? `/api/teams?league_id=${leagueId}` : '/api/teams')
        .then(res => res.json())
        .then(teams => {
            const teamSelect = document.getElementById('teamSelect');
            if (!teamSelect) return;
            teamSelect.innerHTML = '';
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.team_id;
                option.textContent = team.team_name;
                teamSelect.appendChild(option);
            });
        });
}

// 전체 게시글(평가글) 목록을 서버에서 불러와서 테이블에 표시
function loadAllPosts() {
    fetch('/api/posts/all')
        .then(res => res.json())
        .then(posts => {
            const tbody = document.querySelector('#allPostsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            posts.forEach(post => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${post.team_name}</td>
                    <td>${post.player_name}</td>
                    <td>${post.rating}</td>
                    <td>${post.comment}</td>
                    <td>${post.create_time}</td>
                `;
                tbody.appendChild(tr);
            });
        });
}

// index.html 폼 및 셀렉트박스에 이벤트 연결
function bindIndexEvents() {
    if (!document.getElementById('leagueSelect')) return;
    // 리그 선택 시 팀 목록 다시 로딩
    document.getElementById('leagueSelect').addEventListener('change', e => {
        loadTeams(e.target.value);
    });
    // 선수 목록 보기 버튼 클릭 시 해당 팀 페이지로 이동
    document.getElementById('searchForm').addEventListener('submit', e => {
        e.preventDefault();
        const leagueId = document.getElementById('leagueSelect').value;
        const teamId = document.getElementById('teamSelect').value;
        location.href = `/players.html?league_id=${leagueId}&team_id=${teamId}`;
    });
}

// ------------------------
// players.html 전용 로직
// ------------------------

// 팀 ID로 팀 이름을 서버에서 불러와서 표시
function loadTeamName(team_id) {
    fetch(`/api/teams/${team_id}`)
        .then(res => res.json())
        .then(team => {
            const teamTitle = document.getElementById('teamTitle');
            if (teamTitle) teamTitle.textContent = `${team.team_name} - 선수 목록`;
        });
}

// 해당 팀의 선수 목록을 불러와서 포지션별로 나누어 출력
function loadPlayers(team_id) {
    fetch(`/api/players?team_id=${team_id}`)
        .then(res => res.json())
        .then(players => {
            const grouped = {};
            // 포지션별로 선수들을 그룹화
            players.forEach(player => {
                if (!grouped[player.position]) grouped[player.position] = [];
                grouped[player.position].push(player);
            });
            const container = document.getElementById('playersByPosition');
            if (!container) return;
            container.innerHTML = '';
            Object.keys(grouped).forEach(position => {
                const section = document.createElement('section');
                const h3 = document.createElement('h3');
                h3.textContent = position;
                section.appendChild(h3);
                const ul = document.createElement('ul');
                grouped[position].forEach(player => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.textContent = player.player_name;
                    a.href = `/evaluate.html?player_id=${player.player_id}`;
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                section.appendChild(ul);
                container.appendChild(section);
            });
        });
}

// ------------------------
// evaluate.html 전용 로직
// ------------------------

// 선수 ID로 선수 이름을 서버에서 불러와서 표시
function loadPlayerInfo(player_id) {
    fetch(`/api/players/${player_id}`)
        .then(res => res.json())
        .then(player => {
            const nameElem = document.getElementById('playerName');
            if (nameElem) nameElem.textContent = player.player_name;
        });
}

// 해당 선수의 모든 평가를 불러와서 평균 평점과 평가 테이블에 표시
function loadEvaluations(player_id) {
    fetch(`/api/posts/${player_id}`)
        .then(res => res.json())
        .then(posts => {
            // 평균 평점 계산 및 표시
            let avg = 0;
            const avgElem = document.getElementById('avgRatingText');
            if (posts.length > 0 && avgElem) {
                avg = posts.reduce((sum, p) => sum + p.rating, 0) / posts.length;
                avgElem.textContent = avg.toFixed(2);
            } else if (avgElem) {
                avgElem.textContent = "아직 평가가 없습니다.";
            }
            // 평가 테이블 표시
            const tbody = document.querySelector('#evalTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            posts.forEach(post => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${post.rating}</td>
                    <td>${post.comment}</td>
                    <td>${post.create_time}</td>
                `;
                tbody.appendChild(tr);
            });
        });
}

// 평가 작성 폼 이벤트 바인딩 및 점수 옵션 생성
function bindEvalForm(player_id) {
    const form = document.getElementById('evalForm');
    if (!form) return;
    form.onsubmit = e => {
        e.preventDefault();
        const rating = Number(document.getElementById('ratingSelect').value);
        const comment = document.getElementById('commentInput').value;
        // 서버로 평가 등록 요청
        fetch('/api/posts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ player_id, rating, comment })
        })
        .then(res => {
            if (res.ok) {
                document.getElementById('commentInput').value = '';
                loadEvaluations(player_id);
            }
        });
    };
    // 10~1 점수 옵션 select에 동적으로 생성
    const ratingSelect = document.getElementById('ratingSelect');
    if (ratingSelect && ratingSelect.options.length === 0) {
        for (let i = 10; i >= 1; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === 6) option.selected = true;
            ratingSelect.appendChild(option);
        }
    }
}

// ------------------------
// 페이지별 자동 실행
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
    // index.html 전용 초기화
    if (document.getElementById('leagueSelect')) {
        loadLeagues();
        loadAllPosts();
        bindIndexEvents();
    }
    // players.html 전용 초기화
    if (document.getElementById('teamTitle')) {
        const team_id = getQueryParam('team_id');
        if (team_id) {
            loadTeamName(team_id);
            loadPlayers(team_id);
        }
    }
    // evaluate.html 전용 초기화
    if (document.getElementById('evalForm')) {
        const player_id = getQueryParam('player_id');
        if (player_id) {
            loadPlayerInfo(player_id);
            loadEvaluations(player_id);
            bindEvalForm(player_id);
        }
    }
});

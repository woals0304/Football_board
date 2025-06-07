# app.py - Flask + PyMySQL

from flask import Flask, render_template, request, jsonify
import pymysql
import datetime

app = Flask(__name__)

# MySQL 연결 함수 (매번 호출)
def get_conn():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='1234',  # 본인 비밀번호 입력
        db='football_board',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

# --------------------------
# [1] 페이지 렌더링 라우트
# --------------------------

@app.route('/') # 메인 페이지 (HTML 렌더링)
def index():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""SELECT * FROM post p
                   JOIN player pl ON p.player_id = pl.player_id
                   JOIN team t ON pl.team_id = t.team_id
                """)
    posts = cur.fetchall()
    cur.execute("SELECT * FROM league")
    leagues = cur.fetchall()
    cur.execute("SELECT * FROM team")
    teams = cur.fetchall()
    conn.close()
    return render_template('index.html', posts=posts, leagues=leagues, teams=teams)

@app.route('/players.html') # 선수 목록 페이지 (HTML만 렌더)
def players_html():
    return render_template('players.html')

@app.route('/evaluate.html') # 선수 평가 페이지 (HTML만 렌더)
def evaluate_html():
    return render_template('evaluate.html')

# --------------------------
# [2] REST API (JSON 반환)
# --------------------------

# [리그 목록] - /api/leagues
@app.route('/api/leagues')
def api_leagues():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT league_id, league_name FROM league")
    leagues = cur.fetchall()
    conn.close()
    return jsonify(leagues)

# [팀 목록] - /api/teams or /api/teams?league_id=xxx
@app.route('/api/teams')
def api_teams():
    league_id = request.args.get('league_id')
    conn = get_conn()
    cur = conn.cursor()
    if league_id:
        cur.execute("SELECT team_id, team_name FROM team WHERE league_id = %s", (league_id,))
    else:
        cur.execute("SELECT team_id, team_name FROM team")
    teams = cur.fetchall()
    conn.close()
    return jsonify(teams)

# [특정 팀 정보] - /api/teams/<team_id>
@app.route('/api/teams/<team_id>')
def api_team_detail(team_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT team_id, team_name, league_id FROM team WHERE team_id = %s", (team_id,))
    team = cur.fetchone()
    conn.close()
    if team:
        return jsonify(team)
    else:
        return jsonify({"error": "팀 없음"}), 404

# [특정 팀의 선수 목록] - /api/players?team_id=xxx
@app.route('/api/players')
def api_players():
    team_id = request.args.get('team_id')
    conn = get_conn()
    cur = conn.cursor()
    if team_id:
        cur.execute("SELECT player_id, player_name, position, team_id FROM player WHERE team_id = %s ORDER BY position, player_name", (team_id,))
    else:
        cur.execute("SELECT player_id, player_name, position, team_id FROM player ORDER BY position, player_name")
    players = cur.fetchall()
    conn.close()
    return jsonify(players)

# [특정 선수 정보] - /api/players/<player_id>
@app.route('/api/players/<int:player_id>')
def api_player_detail(player_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT player_id, player_name, position, team_id FROM player WHERE player_id = %s", (player_id,))
    player = cur.fetchone()
    conn.close()
    if player:
        return jsonify(player)
    else:
        return jsonify({"error": "선수 없음"}), 404

# [전체 평가글(게시글) 목록] - /api/posts/all
@app.route('/api/posts/all')
def api_posts_all():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.post_id, p.rating, p.comment, p.create_time, 
               pl.player_name, t.team_name
          FROM post p
          JOIN player pl ON p.player_id = pl.player_id
          JOIN team t ON pl.team_id = t.team_id
        ORDER BY p.create_time DESC
    """)
    posts = cur.fetchall()
    conn.close()
    return jsonify(posts)

# [특정 선수의 평가글 목록] - /api/posts/<player_id>
@app.route('/api/posts/<int:player_id>')
def api_posts_by_player(player_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT post_id, rating, comment, create_time 
        FROM post WHERE player_id = %s
        ORDER BY create_time DESC
    """, (player_id,))
    posts = cur.fetchall()
    conn.close()
    return jsonify(posts)

# [평가글 작성] - /api/posts (POST)
@app.route('/api/posts', methods=['POST'])
def api_create_post():
    data = request.get_json()
    player_id = data.get('player_id')
    rating = data.get('rating')
    comment = data.get('comment')
    now = datetime.datetime.now()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO post (player_id, rating, comment, create_time) VALUES (%s, %s, %s, %s)",
        (player_id, rating, comment, now)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True}), 201

# --------------------------
# [3] (선택) 기존 평가 HTML 렌더링 라우트 (evaluate/players)
# --------------------------
# 기존 페이지에서 jinja 템플릿 쓰는 경우, 필요하면 남겨둬도 됨.  
# JS 기반으로만 쓸 거면 생략해도 무방.

if __name__ == '__main__':
    app.run(debug=True)

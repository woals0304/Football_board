create database football_board;
use football_board;
show tables;

CREATE TABLE league (
    league_id VARCHAR(50),
    league_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (league_id)
);
CREATE TABLE team (
    team_id VARCHAR(50),
    team_name VARCHAR(100) NOT NULL,
    league_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (team_id),
    FOREIGN KEY (league_id)
        REFERENCES league (league_id)
);
CREATE TABLE player (
    player_id INT AUTO_INCREMENT,
    player_name VARCHAR(100) NOT NULL,
    position VARCHAR(10) NOT NULL,
    team_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (player_id),
    FOREIGN KEY (team_id)
        REFERENCES team (team_id)
);
CREATE TABLE post (
    post_id INT AUTO_INCREMENT,
    player_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    create_time DATETIME,
    PRIMARY KEY (post_id),
    FOREIGN KEY (player_id)
        REFERENCES player (player_id)
);
desc league;
desc team;
desc player;
desc post;
SELECT * FROM league;
SELECT * FROM team;
SELECT * FROM player;

insert into league values('epl', '프리미어리그');
insert into league (league_id, league_name) values('laliga', '라리가');
INSERT INTO league (league_id, league_name) VALUES
('bundesliga', '분데스리가'),
('seriea', '세리에 A'),
('ligue1', '리그 1');

insert into team values('manutd', '맨체스터 유나이티드', 'epl');
insert into team (team_id, team_name, league_id) values('chelsea', '첼시', 'epl');
INSERT INTO team (team_id, team_name, league_id) VALUES
-- EPL
('mci', '맨체스터 시티', 'epl'),
('ars', '아스날', 'epl'),
('liv', '리버풀', 'epl'),

-- 라리가
('rm', '레알 마드리드', 'laliga'),
('fcB', '바르셀로나', 'laliga'),

-- 분데스리가
('bayern', '바이에른 뮌헨', 'bundesliga'),
('bvb', '도르트문트', 'bundesliga'),

-- 세리에 A
('inter', '인터 밀란', 'seriea'),
('acm', 'AC 밀란', 'seriea'),

-- 리그 1
('psg', '파리 생제르맹', 'ligue1');


INSERT INTO player (player_name, position, team_id) VALUES
-- 맨체스터 유나이티드
('안드레 오나나', 'GK', 'manutd'),
('해리 매과이어', 'DF', 'manutd'), ('요로', 'DF', 'manutd'), ('루크 쇼', 'DF', 'manutd'),
('브루노 페르난데스', 'MF', 'manutd'), ('카세미루', 'MF', 'manutd'), ('마즈라위', 'MF', 'manutd'),
('지르크지', 'FW', 'manutd'), ('호일룬', 'FW', 'manutd'),
-- 첼시
('산체스', 'GK', 'chelsea'),
('트레보 찰로바', 'DF', 'chelsea'), ('쿠쿠레야', 'DF', 'chelsea'), ('리스 제임스', 'DF', 'chelsea'),
('콜 파머', 'MF', 'chelsea'), ('카이세도', 'MF', 'chelsea'),
('니콜라스 잭슨', 'FW', 'chelsea'), ('산초', 'FW', 'chelsea');
-- 맨체스터 시티
INSERT INTO player (player_name, position, team_id) VALUES
('엘링 홀란드', 'FW', 'mci'),
('케빈 더 브라위너', 'MF', 'mci'),
('에데르송', 'GK', 'mci');

-- 아스날
INSERT INTO player (player_name, position, team_id) VALUES
('부카요 사카', 'FW', 'ars'),
('마르틴 외데고르', 'MF', 'ars'),
('라야', 'GK', 'ars');

-- 레알 마드리드
INSERT INTO player (player_name, position, team_id) VALUES
('주드 벨링엄', 'MF', 'rm'),
('비니시우스 주니오르', 'FW', 'rm'),
('티보 쿠르투아', 'GK', 'rm');

-- 바르셀로나
INSERT INTO player (player_name, position, team_id) VALUES
('라민 야말', 'FW', 'fcB'),
('페드리', 'MF', 'fcB'),
('테어 슈테겐', 'GK', 'fcB');

-- 파리 생제르맹
INSERT INTO player (player_name, position, team_id) VALUES
('우스만 뎀벨레', 'FW', 'psg'),
('이강인', 'MF', 'psg'),
('돈나룸마', 'GK', 'psg');

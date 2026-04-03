-- Project Service Database
CREATE DATABASE IF NOT EXISTS projects;
USE projects;

DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS exercise;

CREATE TABLE IF NOT EXISTS project (
    project_id INT PRIMARY KEY,
    exercise_id INT NOT NULL,
    project_name VARCHAR(120) NOT NULL,
    town_name VARCHAR(80) NOT NULL,
    flat_types VARCHAR(120) NOT NULL,
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open'
);

CREATE INDEX idx_project_exercise_id ON project (exercise_id);
CREATE INDEX idx_project_status ON project (status);

-- Exercise IDs are intentionally small and human-friendly (1..10).
-- Projects in exercise 6 are the current open launch used by the scenario.
INSERT INTO project (
    project_id,
    exercise_id,
    project_name,
    town_name,
    flat_types,
    status
) VALUES
(1,  6, 'Tengah Garden Walk',    'Tengah',          '2-Room Flexi to 5-Room', 'open'),
(21, 6, 'Punggol SeaVista',      'Punggol',         '3-Room to 5-Room',       'open'),
(51, 6, 'Queenstown SkyGrove',   'Queenstown',      '2-Room Flexi to 5-Room', 'open'),
(52, 6, 'Kallang RiverFront',    'Kallang/Whampoa', '3-Room to 5-Room',       'open'),
(11, 2, 'Bedok North Bloom',     'Bedok',           '3-Room to 5-Room',       'closed'),
(31, 3, 'Jurong West LakeEdge',  'Jurong West',     '2-Room Flexi to 4-Room', 'closed'),
(41, 3, 'Toa Payoh CentralTerrace', 'Toa Payoh',    '3-Room to 5-Room',       'closed'),
(43, 1, 'Ang Mo Kio ForestGlade','Ang Mo Kio',      '2-Room Flexi to 4-Room', 'closed')
ON DUPLICATE KEY UPDATE
    exercise_id = VALUES(exercise_id),
    project_name = VALUES(project_name),
    town_name = VALUES(town_name),
    flat_types = VALUES(flat_types),
    status = VALUES(status);

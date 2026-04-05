-- Flat Availability Service Database
CREATE DATABASE IF NOT EXISTS flat_availability;
USE flat_availability;

-- BTO Projects table (e.g. "Tengah Garden Walk" in Tengah town)
CREATE TABLE IF NOT EXISTS bto_project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    town VARCHAR(50) NOT NULL,
    description TEXT,
    launch_date DATE,
    booking_start_date DATE,
    booking_end_date DATE
);

-- Individual flats within projects
CREATE TABLE IF NOT EXISTS flat (
    flat_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    block VARCHAR(10) NOT NULL,
    street_name VARCHAR(100) NOT NULL,
    floor_number INT NOT NULL,
    unit_number VARCHAR(10) NOT NULL,
    flat_type ENUM('2-Room Flexi', '3-Room', '4-Room', '5-Room', '3Gen') NOT NULL,
    area_sqm DECIMAL(6,2) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status ENUM('available', 'reserved', 'sold') NOT NULL DEFAULT 'available',
    reserved_by VARCHAR(50) DEFAULT NULL,
    reserved_at DATETIME DEFAULT NULL,
    FOREIGN KEY (project_id) REFERENCES bto_project(project_id),
    UNIQUE KEY unique_unit (project_id, block, floor_number, unit_number)
);

-- Seed projects aligned with frontend form mappings:
-- Tengah -> 1, Punggol -> 21, Queenstown -> 51, Kallang/Whampoa -> 52
INSERT INTO bto_project (project_id, project_name, town, description, launch_date, booking_start_date, booking_end_date) VALUES
(1, 'Tengah Garden Walk', 'Tengah', 'Located in the heart of Tengah plantation district', '2026-02-10', '2026-03-01', '2026-03-31'),
(21, 'Punggol SeaVista', 'Punggol', 'Waterfront living close to Punggol Coast precinct', '2026-02-10', '2026-03-01', '2026-03-31'),
(51, 'Queenstown SkyGrove', 'Queenstown', 'Mature estate development with central-city access', '2026-02-10', '2026-03-01', '2026-03-31'),
(52, 'Kallang RiverFront', 'Kallang/Whampoa', 'River-facing homes with excellent city connectivity', '2026-02-10', '2026-03-01', '2026-03-31')
ON DUPLICATE KEY UPDATE
    project_name = VALUES(project_name),
    town = VALUES(town),
    description = VALUES(description),
    launch_date = VALUES(launch_date),
    booking_start_date = VALUES(booking_start_date),
    booking_end_date = VALUES(booking_end_date);

-- Larger flat inventory for ballot testing (500+ units total).
-- Uses INSERT IGNORE so reruns do not duplicate units because of unique_unit constraint.

-- Project 1: Tengah Garden Walk
INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    1, '101A', 'Tengah Garden Walk', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '4-Room', 93.00,
    380000 + (floors.floor_number * 1200) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 3, 1800
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    1, '102B', 'Tengah Garden Walk', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '2-Room Flexi', 48.00,
    195000 + (floors.floor_number * 600) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 2 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 4, 900
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    1, '103C', 'Tengah Garden Walk', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '5-Room', 112.00,
    520000 + (floors.floor_number * 1600) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 3, 2400
) AS units;

-- Project 21: Punggol SeaVista
INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    21, '211A', 'Punggol Way', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '3-Room', 68.00,
    290000 + (floors.floor_number * 900) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 3, 1300
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    21, '212B', 'Punggol Way', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '4-Room', 93.00,
    410000 + (floors.floor_number * 1200) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 2 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 4, 1700
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    21, '213C', 'Punggol Way', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '5-Room', 112.00,
    560000 + (floors.floor_number * 1700) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 3, 2500
) AS units;

-- Project 51: Queenstown SkyGrove
INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    51, '511A', 'Queenstown Avenue', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '2-Room Flexi', 47.00,
    220000 + (floors.floor_number * 700) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 2, 850
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    51, '512B', 'Queenstown Avenue', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '3-Room', 70.00,
    335000 + (floors.floor_number * 1000) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 3, 1300
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    51, '513C', 'Queenstown Avenue', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '4-Room', 95.00,
    480000 + (floors.floor_number * 1400) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 2 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 4, 1800
) AS units;

-- Project 52: Kallang RiverFront
INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    52, '521A', 'Kallang Basin', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '3-Room', 69.00,
    320000 + (floors.floor_number * 1000) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 3, 1200
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    52, '522B', 'Kallang Basin', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '4-Room', 94.00,
    455000 + (floors.floor_number * 1300) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 1 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 3, 1700
) AS units;

INSERT IGNORE INTO flat (project_id, block, street_name, floor_number, unit_number, flat_type, area_sqm, price, status)
WITH RECURSIVE floors AS (
    SELECT 2 AS floor_number
    UNION ALL
    SELECT floor_number + 1 FROM floors WHERE floor_number < 14
)
SELECT
    52, '523C', 'Kallang Basin', floors.floor_number,
    CONCAT(LPAD(floors.floor_number, 2, '0'), '-', LPAD(LEAST(units.unit_no, 68), 2, '0')),
    '5-Room', 113.00,
    610000 + (floors.floor_number * 1700) + units.price_offset,
    'available'
FROM floors
CROSS JOIN (
    SELECT 2 AS unit_no, 0 AS price_offset
    UNION ALL SELECT 4, 2400
) AS units;

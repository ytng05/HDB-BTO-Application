-- ============================================================
-- hfe_application/schema.sql
-- ============================================================
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `hfe_application`
  DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `hfe_application`;

DROP TABLE IF EXISTS `hfe_application`;

CREATE TABLE `hfe_application` (
  `hfe_id`           INT           AUTO_INCREMENT,
  `hfe_letter_id`    VARCHAR(32)   DEFAULT NULL UNIQUE
                     COMMENT 'Generated on approval e.g. HFE-1-1700000000',
  `applicant_id`     INT           NOT NULL,
  `co_applicant_id`  INT           DEFAULT NULL,
  `flat_type`        VARCHAR(20)   NOT NULL,
  `status`           VARCHAR(20)   NOT NULL DEFAULT 'SUBMITTED'
                     COMMENT 'SUBMITTED | APPROVED | REJECTED | EXPIRED',
  `max_loan_amount`  DECIMAL(12,2) DEFAULT NULL,
  `estimated_grant`  DECIMAL(12,2) DEFAULT NULL,
  `validity_start`   DATETIME      DEFAULT NULL,
  `validity_end`     DATETIME      DEFAULT NULL
                     COMMENT 'validity_start + 9 months',
  `rejection_reason` TEXT          DEFAULT NULL,
  `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hfe_id`),
  KEY `idx_applicant_id` (`applicant_id`),
  KEY `idx_status`       (`status`),
  KEY `idx_validity_end` (`validity_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

COMMIT;

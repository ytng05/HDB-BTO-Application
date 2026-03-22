-- ============================================================
-- ballot_application/schema.sql
-- ============================================================
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `ballot_application`
  DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `ballot_application`;

DROP TABLE IF EXISTS `ballot_application`;

CREATE TABLE `ballot_application` (
  `application_id`     INT           AUTO_INCREMENT,
  `applicant_id`       INT           NOT NULL,
  `co_applicant_id`    INT           DEFAULT NULL,
  `flat_type`          VARCHAR(20)   NOT NULL,
  `bto_project_id`     INT           NOT NULL,
  `transaction_id`     VARCHAR(64)   DEFAULT NULL,
  `payment_amount`     DECIMAL(10,2) DEFAULT NULL,
  `status`             VARCHAR(20)   NOT NULL DEFAULT 'PENDING_PAYMENT'
                       COMMENT 'PENDING_PAYMENT | SUBMITTED | ELIGIBLE | INELIGIBLE | FORFEITED',
  `eligibility_result` VARCHAR(20)   DEFAULT NULL
                       COMMENT 'ELIGIBLE | INELIGIBLE',
  `note`               TEXT          DEFAULT NULL,
  `created_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`),
  KEY `idx_applicant_id` (`applicant_id`),
  KEY `idx_status`       (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

COMMIT;

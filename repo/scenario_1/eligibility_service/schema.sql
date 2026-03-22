-- ============================================================
-- eligibility_service/schema.sql
-- ============================================================
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `eligibility_service`
  DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `eligibility_service`;

DROP TABLE IF EXISTS `eligibility_check`;

CREATE TABLE `eligibility_check` (
  `check_id`            INT           AUTO_INCREMENT,
  `application_id`      INT           NOT NULL
                        COMMENT 'ballot_application.application_id',
  `applicant_nric`      VARCHAR(9)    NOT NULL,
  `co_applicant_nric`   VARCHAR(9)    DEFAULT NULL,
  `flat_type`           VARCHAR(20)   NOT NULL,

  -- Primary applicant: pass flag + one-line detail per external API
  `ica_pass`            TINYINT(1)    DEFAULT NULL,
  `ica_detail`          VARCHAR(128)  DEFAULT NULL,
  `iras_pass`           TINYINT(1)    DEFAULT NULL,
  `iras_detail`         VARCHAR(128)  DEFAULT NULL,
  `cpf_pass`            TINYINT(1)    DEFAULT NULL,
  `cpf_detail`          VARCHAR(128)  DEFAULT NULL,
  `sla_pass`            TINYINT(1)    DEFAULT NULL,
  `sla_detail`          VARCHAR(128)  DEFAULT NULL,

  -- Co-applicant: same four checks, only populated when co_applicant_nric present
  `co_ica_pass`         TINYINT(1)    DEFAULT NULL,
  `co_ica_detail`       VARCHAR(128)  DEFAULT NULL,
  `co_iras_pass`        TINYINT(1)    DEFAULT NULL,
  `co_iras_detail`      VARCHAR(128)  DEFAULT NULL,
  `co_cpf_pass`         TINYINT(1)    DEFAULT NULL,
  `co_cpf_detail`       VARCHAR(128)  DEFAULT NULL,
  `co_sla_pass`         TINYINT(1)    DEFAULT NULL,
  `co_sla_detail`       VARCHAR(128)  DEFAULT NULL,

  -- Overall verdict
  `is_eligible`         TINYINT(1)    DEFAULT NULL,
  `note`                TEXT          DEFAULT NULL,
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`check_id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_applicant_nric` (`applicant_nric`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

COMMIT;

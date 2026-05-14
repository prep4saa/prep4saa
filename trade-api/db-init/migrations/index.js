const { Client } = require("pg");
const Redis = require("ioredis");

// === 추가 ===
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

/*fs — 파일 시스템 (V*.sql 읽기)
path — OS 무관한 경로 처리
crypto — SHA256 체크섬 (파일 변경 감지)
MIGRATIONS_DIR — Lambda 안에서 이 경로에 SQL 파일들이 있음
*/
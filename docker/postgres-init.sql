-- Runs once, on first startup of a fresh Postgres data volume.
-- The main database (POSTGRES_DB) and user (POSTGRES_USER) are already
-- created by the postgres image from env vars; we only need the test DB.
--
-- Run as POSTGRES_USER (a superuser), so the test DB is owned by them.

CREATE DATABASE learning_paths_test;

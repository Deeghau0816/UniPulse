-- UniPulse Database Setup Script for Resources
-- Run this in MySQL Workbench to set up the database

-- Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS unipulse;
USE unipulse;

-- The resources table will be auto-created by JPA/Hibernate
-- This script creates the database and user for the application

-- Create a dedicated user (optional - you can use root)
-- CREATE USER IF NOT EXISTS 'unipulse_user'@'localhost' IDENTIFIED BY 'unipulse_password';
-- GRANT ALL PRIVILEGES ON unipulse.* TO 'unipulse_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show existing tables
SHOW TABLES;

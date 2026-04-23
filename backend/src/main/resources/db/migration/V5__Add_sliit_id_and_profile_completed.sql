ALTER TABLE users
    ADD COLUMN sliit_id VARCHAR(100) NULL,
    ADD COLUMN profile_completed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
    ADD CONSTRAINT uk_users_sliit_id UNIQUE (sliit_id);
ALTER TABLE users
    ADD COLUMN first_name VARCHAR(255) NULL,
    ADD COLUMN last_name VARCHAR(255) NULL,
    ADD COLUMN profile_image VARCHAR(500) NULL;

UPDATE users
SET first_name = TRIM(SUBSTRING_INDEX(full_name, ' ', 1)),
    last_name = NULLIF(
        TRIM(SUBSTRING(full_name, LENGTH(SUBSTRING_INDEX(full_name, ' ', 1)) + 1)),
        ''
    )
WHERE full_name IS NOT NULL
  AND TRIM(full_name) <> '';

UPDATE users
SET first_name = COALESCE(NULLIF(first_name, ''), email),
    last_name = COALESCE(last_name, '')
WHERE first_name IS NULL
   OR first_name = '';

ALTER TABLE users
    MODIFY COLUMN first_name VARCHAR(255) NOT NULL,
    MODIFY COLUMN last_name VARCHAR(255) NOT NULL;

DROP USER IF EXISTS 'admin'@'localhost';

CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'admin123';

ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin123';

SELECT SYSDATE() as timestamp, 'Admin created' as decsription;
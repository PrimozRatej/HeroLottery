DROP DATABASE IF EXISTS lottery_db;
CREATE DATABASE lottery_db;
USE lottery_db;

DROP USER IF EXISTS 'admin'@'%';

CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'admin123';

ALTER USER 'root'@'%' IDENTIFIED BY '07101971';

ALTER USER 'admin'@'%' IDENTIFIED WITH mysql_native_password BY 'admin123';

ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '07101971';

GRANT ALL PRIVILEGES ON lottery_db.* TO 'admin'@'%';

FLUSH PRIVILEGES;

SELECT SYSDATE() as timestamp, 'Start CREATE' as decsription;
/* TODO separate every table to different file */
SELECT SYSDATE() as timestamp, 'start user.sql' as decsription;
create table user (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL UNIQUE
);

SELECT SYSDATE() as timestamp, 'start raffle.sql' as decsription;
create table raffle (
	id INT PRIMARY KEY AUTO_INCREMENT,
	lottery_number INT,
	created_at DATETIME NOT NULL UNIQUE
);

SELECT SYSDATE() as timestamp, 'start user_raffle.sql' as decsription;
create table user_raffle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    raffle_id INT,
    selected_number INT NOT NULL,
    selected_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (raffle_id) REFERENCES raffle(id)
);

DELIMITER $$
CREATE PROCEDURE `user_attend_raffle_in_progress`(IN in_name VARCHAR(50), IN in_selected_number INT, IN in_selected_at DATETIME)
BEGIN
	DECLARE CONTINUE HANDLER FOR 1062
    BEGIN
		SELECT CONCAT('Duplicate user (',in_name,',) occurred') AS message;
    END;
    INSERT INTO user (name) VALUES (in_name);
    
    SET @user_id := null;
    /*SET @raffle_id := null;*/
	
    
    SELECT @user_id:=us.id FROM user us WHERE us.name LIKE in_name limit 1;
    /*SELECT @raffle_id:=rf.id FROM raffle rf order by rf.created_at desc limit 1;*/
    /*SELECT @user_id, @raffle_id;*/

	CALL attend_user(@user_id, /*@raffle_id,*/ in_selected_number, in_selected_at);
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `attend_user`(IN in_user_id INT, /*IN in_raffle_id INT,*/ IN in_selected_number INT, IN in_selected_at DATETIME)
BEGIN
	DECLARE CONTINUE HANDLER FOR 1062
    BEGIN
		SELECT CONCAT('Duplicated user_raffle (',in_user_id,',',in_raffle_id,') occurred') AS message;
    END;

    SET @user_bets_count_in_current_raffle := null;
    SELECT @user_bets_count_in_current_raffle:=COUNT(*) FROM lottery_db.user_raffle WHERE user_id = in_user_id AND raffle_id IS NULL;
    IF @user_bets_count_in_current_raffle > 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Custom error';
    ELSE
      INSERT INTO user_raffle (user_id, raffle_id, selected_number, selected_at) VALUES (in_user_id, NULL, in_selected_number, in_selected_at);
    END IF;
END$$
DELIMITER ;



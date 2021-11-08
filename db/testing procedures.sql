DELIMITER $$
CREATE PROCEDURE `user_attend_raffle_in_progress`(IN in_name VARCHAR(50), IN in_selected_number INT)
BEGIN
	DECLARE CONTINUE HANDLER FOR 1062
    BEGIN
		SELECT CONCAT('Duplicate user (',in_name,',',inProductId,') occurred') AS message;
    END;
    INSERT INTO user (name) VALUES (in_name);
    
    SET @user_id := null;
    SET @raffle_id := null;
	
    
    SELECT @user_id:=us.id FROM user us WHERE us.name LIKE in_name limit 1;
    SELECT @raffle_id:=rf.id FROM raffle rf order by rf.created_at desc limit 1;
    SELECT @user_id, @raffle_id;
END$$
DELIMITER ;

SELECT rf.id FROM raffle rf order by rf.created_at desc limit 1;
SELECT us.id FROM user us WHERE us.name LIKE 'Tom' limit 1;

select * FROM user;

CALL user_attend_raffle_in_progress('Tooom', 10);
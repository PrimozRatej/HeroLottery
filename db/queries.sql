SELECT * FROM lottery_db.raffle;
SELECT COUNT(*) FROM lottery_db.raffle;
/*Select last raffle*/
SELECT * FROM lottery_db.raffle rf order by rf.created_at desc limit 1;

/*Select users in last raffle*/
SELECT *
FROM user usr
JOIN user_raffle ur ON usr.id=ur.user_id
JOIN raffle rf ON ur.raffle_id=rf.id
AND rf.id = 3165;

/*Select winning users in last raffle*/
SELECT *
FROM user usr
JOIN user_raffle ur ON usr.id=ur.user_id
JOIN raffle rf ON ur.raffle_id=rf.id
AND rf.id = 2
AND ur.selected_number = rf.lottery_number;


SELECT * FROM lottery_db.raffle rf order by rf.created_at desc limit 5;
CREATE PROCEDURE [dbo].[sql_commands_sync]
(
@user_id int
)
AS
BEGIN
DELETE FROM sql_commands WHERE sqlcmd_text NOT IN (SELECT NAME FROM sys.procedures) AND is_procedure = 'Y';
insert into sql_commands(sqlcmd_text,is_procedure,is_public,created_by,created_date)
select name,'Y','N',@user_id,getdate() from sys.procedures
WHERE name NOT IN (SELECT sqlcmd_text FROM sql_commands) order by name
update sql_commands set sqlcmd_code = concat( upper(substring(sqlcmd_text,1,1)),sqlcmd_id) WHERE is_procedure = 'Y' AND sqlcmd_code IS NULL
END

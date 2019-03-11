CREATE FUNCTION [dbo].[getUser] 
(
	@user_id			as int
)
RETURNS varchar(50)
AS
BEGIN   
	DECLARE @l_retval   varchar(200);
	
	SELECT	@l_retval =     first_name + N' ' + CASE WHEN middle_name IS NULL THEN '' ELSE SUBSTRING(middle_name,1,1) + '.' END + ' ' + last_name 
	FROM	dbo.users 
	where user_id = @user_id  AND logon IS NOT NULL


 RETURN @l_retval;

END;


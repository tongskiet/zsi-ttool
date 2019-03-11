CREATE FUNCTION [dbo].[getLogonName] 
(
	@user_id			as int
)
RETURNS varchar(50)
AS
BEGIN   
	DECLARE @l_retval   varchar(200);
	
	SELECT	@l_retval =   logon  FROM	dbo.users 
	where user_id = @user_id  AND logon IS NOT NULL


 RETURN @l_retval;

END;


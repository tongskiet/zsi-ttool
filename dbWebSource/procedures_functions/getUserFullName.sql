

create FUNCTION [dbo].[getUserFullName] 
(
	@user_id			as int
)
RETURNS varchar(50)
AS
BEGIN   
   DECLARE @l_retval   varchar(50);
   SELECT @l_retval = userFullName FROM dbo.users_v where user_id = @user_id
   RETURN @l_retval;
END;


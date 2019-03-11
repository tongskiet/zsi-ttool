CREATE FUNCTION [dbo].[countUsers] 
(
	@role_id			as int
)
RETURNS INT
AS
BEGIN   
   DECLARE @l_retval    INT;
   IF ISNULL(@role_id,0) <> 0
      SELECT @l_retval = COUNT(*) FROM dbo.users WHERE role_id = @role_id
   ELSE
      SELECT @l_retval = COUNT(*) FROM dbo.users

   RETURN @l_retval;
END;



CREATE FUNCTION [dbo].[getUserRole](
@user_id int
) 
RETURNS VARCHAR(100) 
AS
BEGIN
   DECLARE @l_role_name VARCHAR(100); 
      SELECT @l_role_name = role_name FROM dbo.user_role_v where user_id = @user_id
      RETURN @l_role_name;
END;


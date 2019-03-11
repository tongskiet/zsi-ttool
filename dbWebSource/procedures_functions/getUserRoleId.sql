CREATE FUNCTION [dbo].[getUserRoleId](
	@user_id int 
) 
RETURNS INT 
AS
BEGIN
   DECLARE @l_role_id INT; 
      SELECT @l_role_id = role_id FROM USERS where user_id =@user_id
      RETURN @l_role_id;
END;


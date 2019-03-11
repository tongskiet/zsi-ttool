CREATE PROCEDURE [dbo].[roles_sel]
(
   @user_id  int = null
   ,@role_id  INT = null
)
AS
BEGIN
  IF ISNULL(@role_id,0)=0  
     SELECT * FROM roles_v;
  ELSE
      SELECT * FROM roles_v WHERE role_id = @role_id; 
END



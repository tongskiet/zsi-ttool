CREATE PROCEDURE [dbo].[users_upd]
(
    @tt     users_tt READONLY
   ,@user_id int
)
AS
SET NOCOUNT ON
DECLARE @updated_count INT;

-- Update Process
   UPDATE a 
       SET logon  = lower(dbo.createUserLogon(b.user_id)) 
	      ,password = b.password
	      ,role_id = b.role_id
          ,updated_by   = @user_id
          ,updated_date = GETDATE()
       FROM dbo.users a INNER JOIN @tt b
        ON a.user_id = b.user_id 
       AND isnull(b.is_edited,'N')='Y'

SET @updated_count = @@ROWCOUNT;

SET @updated_count = @updated_count + @@ROWCOUNT;
RETURN @updated_count;





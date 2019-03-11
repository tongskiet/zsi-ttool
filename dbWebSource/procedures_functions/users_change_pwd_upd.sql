create PROCEDURE [dbo].[users_change_pwd_upd]
(
   @user_id int
   ,@password nvarchar(200)
)

AS
SET NOCOUNT ON
update dbo.users set password=@password where user_id=@user_id


 

CREATE PROCEDURE [dbo].[user_info_sel](
  @user_id INT
)
AS
BEGIN
  SET NOCOUNT ON
  SELECT * FROM users_v where user_id=@user_id;
END 
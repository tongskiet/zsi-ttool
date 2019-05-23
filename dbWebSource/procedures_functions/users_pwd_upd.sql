CREATE PROCEDURE [dbo].[users_key_upd](
        @user_id	VARCHAR(max)= NULL   
	   ,@password	NVARCHAR(max)= NULL   

)
AS 
BEGIN
SET NOCOUNT ON 
	declare @count as int=0
	select @count=count(*) from users_key where user_id=@user_id 

	 if(@count = 0)
		insert into dbo.users_pwd(user_id,password,created_by,created_date) values(@user_id,@password, SUSER_NAME(),GETDATE()) 
	 else
		update dbo.users_key set password=@password,updated_by=SUSER_NAME(),updated_date=GETDATE() where user_id=@user_id  
	
END 

 
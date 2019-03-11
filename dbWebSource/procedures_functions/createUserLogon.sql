CREATE FUNCTION [dbo].[createUserLogon] 
(
	@user_id varchar(20)
)
RETURNS VARCHAR(25)
AS
BEGIN
	DECLARE @logon VARCHAR(25); 
	DECLARE @nlogon VARCHAR(25); 
	DECLARE @count int;
	
	SELECT @nlogon = concat(SUBSTRING(first_name,1,1),last_name), @logon=logon FROM users where user_id=@user_id;
	SET @nlogon= replace(lower(@nlogon),'ñ','n')
	IF ISNULL(@logon,'') <> ''
	   RETURN @logon;
	
	SELECT @count=count(*) FROM users where logon = @nlogon

	IF @count>0
	   SET @logon = @nlogon + cast(@count as varchar(20))
    ELSE
	   SET @logon = @nlogon
	 
	RETURN @logon;

END

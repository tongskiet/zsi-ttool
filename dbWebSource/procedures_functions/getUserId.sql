
CREATE FUNCTION getUserId 
(
	@logon varchar(20)
)
RETURNS int
AS
BEGIN
	DECLARE @id int; 
      SELECT @id = user_id FROM dbo.users where logon = @logon
      RETURN @id;

END

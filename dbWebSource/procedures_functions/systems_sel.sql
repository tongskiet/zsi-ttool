CREATE PROCEDURE [dbo].[systems_sel]
(
    @system_id  INT = null
	,@user_id  int = null

)
AS
BEGIN
  DECLARE @stmt		VARCHAR(4000);
 
 SET @stmt = 'SELECT * FROM dbo.systems';
  IF @system_id <> '' 
		SET @stmt = @stmt + ' WHERE system_id='+ CAST(@system_id AS VARCHAR(50));
   exec (@stmt);
END




CREATE PROCEDURE [dbo].[zNoCompressionActions_sel]
(
	@user_id  INT = null  
   ,@action_name NVARCHAR(100)=null
)
AS
BEGIN
	DECLARE @stmt		VARCHAR(4000) = 'SELECT * FROM dbo.zNoCompressionActions WHERE 1=1';
	IF NOT @action_name IS NULL
       SET @stmt = @stmt + ' AND actionname='''+   @action_name  + '''';
   
        print @stmt 
	EXEC(@stmt);

 END;
 

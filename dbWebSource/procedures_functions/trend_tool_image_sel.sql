
CREATE PROCEDURE [dbo].trend_tool_image_sel (
    @image_id         int = null
 )
AS
BEGIN
SET NOCOUNT ON
  DECLARE @stmt		VARCHAR(4000);
	 
	SET @stmt = 'SELECT * FROM dbo.trend_tool_images WHERE 1=1';

	IF ISNULL(@image_id,0) <> 0
       SET @stmt = @stmt + ' AND image_id='+   CAST(@image_id AS VARCHAR);    
        
	EXEC(@stmt);
END;
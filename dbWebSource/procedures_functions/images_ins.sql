CREATE PROCEDURE images_ins (
  @image_name		nvarchar(256) 
 ,@image_filename   nvarchar(256) 
)
AS
BEGIN
SET NOCOUNT ON
DECLARE @sql NVARCHAR(MAX)
DECLARE @parmsdeclare NVARCHAR(4000)  
DECLARE @image_path NVARCHAR(100) = 'SELECT image_folder FROM dbo.app_profile'

SET @sql='INSERT INTO trend_tool_images (image_name,image_filename) ' +
	     ' (SELECT ''' + @image_name + ''', BulkColumn FROM Openrowset(Bulk ''' + CONCAT(@image_path,@image_filename) + ''', SINGLE_BLOB) x )'

EXEC(@sql);
END;


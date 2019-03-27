CREATE PROCEDURE [dbo].[trend_tool_image_upd] (
	 @user_id		   int = null
    ,@image_id         int = null
	,@image_name	   nvarchar(max) = NULL
	,@image_file       varbinary(max)=null
	,@content_type	   nvarchar(50) = NULL
 )
AS
BEGIN
SET NOCOUNT ON
DECLARE @id INT
 IF ISNULL(@image_id,0) = 0
 BEGIN
    INSERT INTO dbo.trend_tool_images 
	(
		 image_name
		,image_file
		,content_type
		,created_by
		,created_date
	) 
	VALUES (
		 @image_name
		,@image_file
		,@content_type
		,@user_id
		,GETDATE()
	)
	SET @id = @@IDENTITY;
 END	
 ELSE
 BEGIN
    UPDATE dbo.trend_tool_images SET image_name = @image_name
	                                ,image_file = @image_file
							   WHERE image_id = @image_id
    SET @id = @image_id;
 END
RETURN @id;
END;

 

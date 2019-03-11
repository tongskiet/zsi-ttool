
CREATE PROCEDURE [dbo].[color_references_sel]
(
    @color_id  INT = null
   ,@color_code VARCHAR(50) = NULL

)
AS
BEGIN
	DECLARE @stmt		VARCHAR(4000);
	SET @stmt = 'SELECT * FROM dbo.color_references WHERE 1=1 ';

	IF @color_id <> '' 
	SET @stmt = @stmt + ' AND color_id' + CAST(@color_id AS VARCHAR);

	IF @color_code <> ''
		SET @stmt = @stmt + ' AND color_code'+ @color_code;
    set @stmt = @stmt + ' order by color_code'
	exec(@stmt);
 END;

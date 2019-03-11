CREATE PROCEDURE [dbo].[page_includes_sel]
(
     @page_include_id  INT = null
	,@page_id  INT = null
)
AS
BEGIN

SET NOCOUNT ON
	 DECLARE @stmt NVARCHAR(MAX)
  SET @stmt = 'SELECT * FROM dbo.page_includes WHERE 1=1 ';

  IF isnull(@page_include_id,0) <> 0
	 SET @stmt = @stmt + 'AND page_include_id=' + cast(@page_include_id as varchar(20));
  IF isnull(@page_id,0) <> 0
	 SET @stmt = @stmt + 'AND page_id=' + cast(@page_id as varchar(20));
	  
  SET @stmt = @stmt + ' ORDER BY library_name'; 
  print @stmt
  EXEC(@stmt);
	 	
END


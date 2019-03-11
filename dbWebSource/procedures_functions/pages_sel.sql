CREATE PROCEDURE [dbo].[pages_sel]
(
   @page_id  INT = null
   ,@page_name  varchar(50) = null
   ,@search_page_name  varchar(200) = null
)
AS
BEGIN
  DECLARE @sql  VARCHAR(MAX) ='SELECT *,0 page_includes_count FROM pages_v WHERE 1=1';

  IF @page_id IS NOT NULL  
		SET @SQL = @SQL + ' AND page_id =' +  cast(@page_id AS VARCHAR(20)) 
  IF @page_name IS NOT NULL  
		SET @SQL = @SQL + ' AND page_name = ''' +  @page_name + ''''
  IF @search_page_name IS NOT NULL
      SET @SQL = @SQL + ' AND page_name like ''%'  +  @search_page_name +  '%''' 
  
  SET @SQL = @SQL + ' ORDER BY page_name'

  --print @SQL
  EXEC(@SQL)
      
END

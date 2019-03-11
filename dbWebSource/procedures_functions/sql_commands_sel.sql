
CREATE PROCEDURE [dbo].[sql_commands_sel](
  @user_id INT=null
 ,@sort_index INT=1
 ,@sort_order INT=0
 ,@rpp        INT=25
 ,@pno        INT=1
)

AS
BEGIN

	SET NOCOUNT ON
	DECLARE @stmt         NVARCHAR(MAX)
	DECLARE @order        NVARCHAR(20) = ' ASC'
	DECLARE @stmt2        NVARCHAR(MAX)
	DECLARE @count		  INT = 0
	DECLARE @result_param NVARCHAR(500)
	DECLARE @page_count	  INT = 1

	IF @sort_order = 1
	   SET @order = ' DESC'

	SET @stmt = 'SELECT * FROM dbo.sql_commands WHERE 1=1 ';
	SET @stmt2 = N'SELECT @result = COUNT(*) FROM dbo.sql_commands ';
	SET @result_param = N'@result varchar(30) OUTPUT';
	EXECUTE sp_executesql @stmt2, @result_param, @result=@Count OUTPUT;

	SET @stmt = @stmt +  ' ORDER BY ' + cast(@sort_index as varchar(20)) + @order;
	SET @stmt = @stmt + ' OFFSET (' + CAST(@pno-1 AS VARCHAR(20)) +')*' + CAST(@rpp AS VARCHAR(20)) + ' ROWS FETCH NEXT ' + CAST(@rpp AS VARCHAR(20)) + ' ROWS ONLY '; 
	
	EXEC(@stmt);
	SET @page_count =  CEILING((CONVERT(DECIMAL(20,5),@count))/@rpp);
	RETURN IIF(isnull(@page_count,0)=0,1,@page_count);
END

--[sql_commands_sel] @rpp=100
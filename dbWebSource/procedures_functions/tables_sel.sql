CREATE PROCEDURE [dbo].[tables_sel]
(
    @table_id  INT = null
   ,@table_code VARCHAR(50) = NULL

)
AS
BEGIN
	DECLARE @stmt		VARCHAR(4000);
	SET @stmt = 'SELECT * FROM dbo.tables WHERE 1=1 ';

	IF @table_id <> '' 
	SET @stmt = @stmt + ' AND table_id' + CAST(@table_id AS VARCHAR);

	IF @table_code <> ''
		SET @stmt = @stmt + ' AND table_code'+ @table_code;
    set @stmt = @stmt + ' order by table_code'
	exec(@stmt);
 END;

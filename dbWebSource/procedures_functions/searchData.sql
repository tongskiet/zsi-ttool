CREATE PROCEDURE [dbo].[searchData]
(
    @code			varchar(20)  
   ,@columns		varchar(max)  
   ,@searchColumn   varchar(50)
   ,@searchKeyword	varchar(100)
   ,@where			varchar(max) = ''
)
AS
BEGIN
   DECLARE @table_name     VARCHAR(50)
   DECLARE @table_key_name     VARCHAR(50)
   DECLARE @stmt           VARCHAR(4000);

   SELECT @table_name=table_name,@table_key_name=table_key_name FROM tables  WHERE table_code=@code;

   SET @stmt = 'SELECT top 20 ' + @table_key_name + ',' + @columns +  ' FROM ' +  @table_name  + ' WHERE ' + @searchColumn + ' LIKE ''' + @searchKeyword + '%'''
   
   IF isnull(@where,'') <> '' 
      SET @stmt = @stmt + ' and ' + @where;

 --   SET @stmt = @stmt + ' ORDER BY len(' + @searchColumn  + '),' + @searchColumn;
    SET @stmt = @stmt + ' ORDER BY ' + @searchColumn;
	--print @stmt
  exec(@stmt);        

 END
 





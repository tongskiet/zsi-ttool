CREATE PROCEDURE [dbo].[deleteData]
(
      @pkey_ids     VARCHAR(max)
	 ,@table_code   VARCHAR(50)
	
)
AS
BEGIN
  SET NOCOUNT ON
  DECLARE @stmt							VARCHAR(max); 
  DECLARE @table_name					VARCHAR(50);
  DECLARE @pkey_name					VARCHAR(50);

  SELECT @table_name=table_name,  @pkey_name=table_key_name from tables WHERE table_code = @table_code; 
  SET @stmt = 'DELETE FROM ' +  @table_name + ' WHERE ' + @pkey_name + ' IN (' + REPLACE(@pkey_ids,'/',',') + ')' 
  print(@stmt);
  exec(@stmt);
  RETURN @@ROWCOUNT;
 END;



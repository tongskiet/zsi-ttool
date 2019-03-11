create PROCEDURE [dbo].[checkValueExists] 
(
    @code     VARCHAR(20)
   ,@colname  VARCHAR(20)
   ,@keyword VARCHAR(20)

)
AS
BEGIN
   DECLARE @stmt    NVARCHAR(4000);
   DECLARE @counts  INT;
   DECLARE @retval  VARCHAR(5) = 'Y';
   DECLARE @tablename VARCHAR(50)='';
 
   SELECT @tablename = table_name from tables WHERE table_code = @code;

   SET @stmt = 'SELECT @cnt=COUNT(*) FROM dbo.' + @tablename + ' WHERE ' + @colname + '=''' + @keyword +''''; 
   EXECUTE sp_executesql @stmt,N'@cnt int OUTPUT', @cnt=@counts OUTPUT;

   IF isnull(@counts,0) = 0 
      SET @retval = 'N';

  SELECT @retval as isExists;

END




 



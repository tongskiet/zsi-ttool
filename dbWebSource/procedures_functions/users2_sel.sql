CREATE PROCEDURE [dbo].[users2_sel]
(
    @user_id int = NULL
   ,@keyword nvarchar(100) = null
   ,@logon varchar(50) = NULL
   ,@password nvarchar(50) =NULL
   ,@is_active varchar(1)='Y'
   ,@role_id INT=null
   ,@is_contact varchar(1)='N'
   ,@rank_id INT = NULL
   ,@organization_id INT = NULL
   ,@col_no INT = 2
   ,@order_no INT = 0
   ,@pno INT = 1
   ,@rpp INT = 100
)
AS
BEGIN
  DECLARE @stmt           NVARCHAR(MAX);
  DECLARE @stmt2          NVARCHAR(MAX);
  DECLARE @stmt3          NVARCHAR(MAX);
  DECLARE @and            NVARCHAR(4000)='';
  DECLARE @order          NVARCHAR(500);
  DECLARE @count INT = 0;
  DECLARE @page_count INT = 1;
  
  CREATE TABLE #tbl (
     rec_count INT
   )

  
  SET @stmt = 'SELECT user_id, logon, last_first_name, password, is_admin, role_id, rankDesc, position, organizationName, organization_id  FROM user_role_v WHERE is_active = ''' + CAST(@is_active AS VARCHAR(1)) + ''''; 
  SET @order = ' ORDER BY ' + CAST(@col_no + 1 AS VARCHAR(1)) + ' ' + IIF(@order_no=0,'ASC','DESC');   
  SET @stmt2 = 'SELECT COUNT(*) FROM user_role_v WHERE is_active = ''' + CAST(@is_active AS VARCHAR(1)) + ''''; 

 IF ISNULL(@keyword,'') <>''
      SET @and = @and + ' AND last_first_name like ''%' + CAST(@keyword AS VARCHAR(20)) + '%'''; 

  IF ISNULL(@logon,'') <>''
       SET @and = @and + ' AND logon = ''' + @logon + ''''; 

  IF ISNULL(@password,'') <>''
      SET @and = @and + ' AND password = ''' + @password + ''''; 

  IF ISNULL(@role_id,0) <> 0 
      SET @and = @and + ' AND role_id = ' + CAST(@role_id AS VARCHAR(20)); 
 
  IF ISNULL(@rank_id,0) <> 0 
      SET @and = @and + ' AND rank_id = ' + CAST(@rank_id AS VARCHAR(20)); 

  IF ISNULL(@organization_id,0) <> 0 
      SET @and = @and + ' AND organization_id = ' + CAST(@organization_id AS VARCHAR(20)); 
 
  IF @is_contact='Y'
      SET @and = @and + ' AND is_contact = ''' + @is_contact + ''''; 

  SET @stmt = @stmt + @and;
  SET @Stmt2 = @stmt2 + @and 

  INSERT INTO #tbl EXEC(@stmt2)
  SELECT top 1 @count=rec_count FROM #tbl;
  DROP table #tbl
  IF @count = 0
  BEGIN
     select 'NO RECORD(S) FOUND'  last_first_name
     return 
  END
   
   	SET @stmt = @stmt + @order
	SET @stmt = @stmt + ' OFFSET (' + CAST(@pno-1 AS VARCHAR(20)) +')*' + CAST(@rpp AS VARCHAR(20)) + ' ROWS FETCH NEXT ' + CAST(@rpp AS VARCHAR(20)) + ' ROWS ONLY '; 
	EXEC(@stmt);

	SET @page_count =  CEILING((CONVERT(DECIMAL(20,5),@count))/@rpp);
	RETURN @page_count;
END;






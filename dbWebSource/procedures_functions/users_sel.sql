CREATE PROCEDURE [dbo].[users_sel]  
(  
    @user_id int = NULL  
   ,@filter_user_id int = NULL  
   ,@logon varchar(50) = NULL  
   ,@password nvarchar(50) =NULL  
   ,@is_active varchar(1)='Y'  
   ,@role_id INT=null  
)  
AS  
BEGIN  
  SET NOCOUNT ON
  DECLARE @stmt           VARCHAR(4000);  
  DECLARE @order          VARCHAR(4000);  
  CREATE TABLE #tt (  
    user_id     INT  
   ,userFullName VARCHAR(50)  
   ,logon       VARCHAR(20)  
   ,password    nvarchar(200)  
   ,is_admin    CHAR(1)  
   ,role_id     int
   ,is_developer CHAR(1)
  )  
  
 
 
  SET @stmt = 'SELECT user_id, dbo.users.first_name + '' '' + CASE WHEN middle_name IS NULL THEN '''' ELSE middle_name END + '' '' + dbo.users.last_name AS userFullName, logon, password,  is_admin, role_id, is_developer  FROM users WHERE is_active = ''' + CAST(@is_active AS VARCHAR(1)) + '''';   
  SET @stmt = @stmt + ' UNION SELECT user_id,  userFullName, logon, password, is_admin, role_id, is_developer FROM zsi_v WHERE is_active = ''' + CAST(@is_active AS VARCHAR(1)) + '''';  

INSERT INTO #tt EXEC(@stmt);  
 

  SET @stmt = 'SELECT * FROM #tt WHERE 1=1 '  
  
 IF ISNULL(@filter_user_id,'') <>''  
  BEGIN  
      SET @stmt = @stmt + ' AND user_id = ' + CAST(@filter_user_id AS VARCHAR(20));   
  END  
  
  IF ISNULL(@logon,'') <>''  
  BEGIN  
      SET @stmt = @stmt + ' AND logon = ''' + @logon + '''';   
  END  
  IF ISNULL(@password,'') <>''  
  BEGIN  
      SET @stmt = @stmt + ' AND password = ''' + @password + '''';   
  END  
  
  IF ISNULL(@role_id,0) <> 0   
  BEGIN  
      SET @stmt = @stmt + ' AND role_id = ' + CAST(@role_id AS VARCHAR(20));   
  END  

SET @stmt = @stmt + ' ORDER BY userFullName ';
EXEC(@stmt);  
print (@stmt);
DROP TABLE #tt;  
  
END;  
  
  
  






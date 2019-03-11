CREATE  PROCEDURE [dbo].[user_menus_sel]  
(  
 @user_id  INT = null  
   ,@menu_id  INT = null  
   ,@pmenu_id INT = NULL  
)  
AS  
BEGIN  
 DECLARE @stmt  VARCHAR(4000);  
    SET @stmt = 'SELECT DISTINCT role_id, is_write, is_delete, menu_id, pmenu_id, menu_name, seq_no, is_default, page_id, page_name, page_title FROM dbo.role_menus_v WHERE role_id =' + CAST(dbo.getUserRoleId(@user_id) AS VARCHAR(20))   +   
    ' UNION SELECT '''' as role_id, '''' as is_write, '''' as is_delete, menu_id, pmenu_id, menu_name, seq_no, is_default, page_id, page_name, page_title FROM default_menus_v '  
  
   
  SET @stmt = @stmt + ' ORDER BY seq_no';  
   
 exec(@stmt);  
 END;
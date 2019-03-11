CREATE procedure [dbo].[javascripts_sel]   
  @js_id int =null  
 ,@page_name varchar(50) =null  
 ,@js_content varchar(50) =null  
 ,@self_backup int=null  
 ,@search_page_name varchar(50) =null  
 ,@user_id int = null  
  
as  
begin  
  DECLARE @stmt AS VARCHAR(1000);  
 
  IF(@page_name IS NOT NULL )     
    BEGIN  
     select top 1 p.page_title,p.page_name, j.js_id,p.page_id,j.js_content,p.is_public,rev_no from dbo.pages p  
       left join  dbo.javascripts j on j.page_id = p.page_id   
       where p.page_name=@page_name 
     RETURN
    END

  SET @stmt = 'select * from dbo.javascripts_v where 1=1 ';  
    
  IF ISNULL(@js_id,0) <> 0  
     SET @stmt = @stmt + ' AND js_id = ' +  CAST(@js_id AS VARCHAR);  
  
  IF ISNULL(@search_page_name,'')   <> ''   
     SET @stmt = @stmt + ' AND page_name like ''%' + @search_page_name +  '%''';  
  
  IF ISNULL(@js_content,'') <> ''  
     SET @stmt = @stmt + ' AND js_content like ''%' +  @js_content + '%''';  
  
  
  IF NOT @self_backup IS NULL   
 BEGIN  
     
     SET @stmt = @stmt + ' AND updated_by=' + CONVERT(varchar(50),@user_id) + ' and not page_name like ''%test%'' '  
  SET @stmt = @stmt + ' OR (created_by= ' + CONVERT(varchar(50), @user_id) + ' and updated_by is null and not page_name like ''%test%'')'  
 END  
  
     SET @stmt = @stmt + ' order by page_name';  
  
    EXEC (@stmt);  
END  
  



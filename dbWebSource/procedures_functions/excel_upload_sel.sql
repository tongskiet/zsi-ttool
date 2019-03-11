CREATE PROCEDURE [dbo].[excel_upload_sel]  
(   
@load_name nvarchar(100)=null  
)  
AS  
BEGIN  
   IF @load_name IS NOT NULL  
     SELECT *, load_name as text, temp_table +','+ excel_column_range as value FROM excel_uploads WHERE load_name = @load_name order by seq_no  
   ELSE  
     SELECT *, load_name as text, temp_table +','+ excel_column_range as value FROM excel_uploads order by seq_no  
END;  
  

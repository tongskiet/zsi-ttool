CREATE procedure [dbo].[temp_data_upd]
(@table_name varchar(50)
 ,@user_id   int
)
as
begin
set nocount on
DECLARE @proc_name VARCHAR(1000)

   SELECT @proc_name = insert_proc FROM excel_uploads where temp_table = @table_name 
   exec(@proc_name + ' @user_id=' +@user_id)
  
end


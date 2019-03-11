CREATE procedure dbo.temp_data_del
(
  @table_name varchar(50)
 ,@user_id   int
)
as
begin
set nocount on
declare @stmt nvarchar(1000);

	SET @stmt = 'delete from ' + @table_name + ' where user_id=' + cast(@user_id as varchar(20))
	exec(@stmt)

end 


CREATE PROCEDURE [dbo].[table_layout_sel]
(
     @user_id int = null
	,@code   varchar(50) = null
)
AS
BEGIN
	if @code is not null
		select * from table_layout where code=@code	
	else
		select * from table_layout

END;


CREATE PROCEDURE [dbo].[table_layout_cols_sel]
(
	 @user_id int = null
	,@tableLayoutId   int 
)
AS
BEGIN
		select * from table_layout_cols where tableLayoutId=@tableLayoutId
		order by seqno

END;

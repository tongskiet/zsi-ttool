
CREATE PROCEDURE [dbo].[sql_commands_upd](
	@sqlcmd_id int=null
	,@sqlcmd_code nvarchar(50)
	,@sqlcmd_text nvarchar(max)
	,@is_public char(1)
	,@user_id int
)
AS
BEGIN
SET NOCOUNT ON 
IF ISNULL(@sqlcmd_id,0) <> 0
	BEGIN
		UPDATE sql_commands
			SET  sqlcmd_code	=	@sqlcmd_code
				,sqlcmd_text	=	@sqlcmd_text
				,is_public		=	@is_public
				,updated_by		=	@user_id
				,updated_date   =	GETDATE()
			WHERE
				sqlcmd_id = @sqlcmd_id
	END
ELSE
	BEGIN
		INSERT INTO sql_commands(
			 sqlcmd_code		
			,sqlcmd_text
			,is_procedure
			,is_public	
			,created_by
			,created_date	
			)
		VALUES ( 
			 @sqlcmd_code		
			,@sqlcmd_text
			,'N'
			,@is_public	
			,@user_id  
			,GETDATE()
		)
	END
END
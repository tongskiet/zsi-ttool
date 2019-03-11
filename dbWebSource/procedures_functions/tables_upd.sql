CREATE PROCEDURE [dbo].[tables_upd]
(
    @tt    tables_tt READONLY
   ,@user_id	int
)
AS
SET NOCOUNT ON;
DECLARE @updated_count INT;
-- Update Process
	UPDATE a 
		 SET  table_code		= b.table_code
		     ,table_name		= b.table_name
	 		 ,table_key_name	= b.table_key_name
       FROM dbo.tables a INNER JOIN @tt b
	     ON a.table_id = b.table_id
	    AND (
			isnull(a.table_code,'') <> isnull(b.table_code,'')
		 OR isnull(a.table_name,'') <> isnull(b.table_name,'')
		 OR isnull(a.table_key_name,'') <> isnull(b.table_key_name,'')
		);

SET @updated_count = @@ROWCOUNT;

-- Insert Process
	INSERT INTO tables (
	 	 table_code
		,table_name
		,table_key_name
    )
	SELECT 
	     table_code
	 	,table_name
		,table_key_name
	FROM @tt 
	WHERE table_id IS NULL;


	SET @updated_count = @updated_count + @@ROWCOUNT;
RETURN @updated_count;





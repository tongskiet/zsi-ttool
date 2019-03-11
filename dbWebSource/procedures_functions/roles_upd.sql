

CREATE PROCEDURE [dbo].[roles_upd]
(
   @tt    roles_tt READONLY
   ,@user_id int
)
AS
SET NOCOUNT ON
DECLARE @updated_count INT;
-- Update Process
	UPDATE a 
		 SET role_name         = b.role_name
	 	    ,is_export_excel   = b.is_export_excel
	 		,is_export_pdf	   = b.is_export_pdf
			,is_import_excel   = b.is_import_excel
		    ,is_add            = b.is_add
		    ,is_edit           = b.is_edit
		    ,is_delete         = b.is_delete
	   	    ,updated_by        = @user_id
			,updated_date      = GETDATE()
       FROM dbo.roles a INNER JOIN @tt b
	     ON a.role_id = b.role_id 
		WHERE b.role_name IS NOT NULL
	    AND isnull(b.is_edited,'N')='Y'


SET @updated_count = @@ROWCOUNT;

-- Insert Process
	INSERT INTO roles (
		 role_name
		,is_export_excel
		,is_export_pdf
		,is_import_excel
		,is_add   
		,is_edit  
		,is_delete
		,created_by
		,created_date
    )
	SELECT 
		 role_name
		,is_export_excel
		,is_export_pdf
		,is_import_excel
		,is_add   
		,is_edit  
		,is_delete
	    ,@user_id
	    ,GETDATE()
	FROM @tt 
	WHERE role_id IS NULL 
	  AND role_name IS NOT NULL;

SET @updated_count = @updated_count + @@ROWCOUNT;
RETURN @updated_count;





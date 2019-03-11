
CREATE PROCEDURE [dbo].[role_dashboards_upd]
(
    @tt    role_dashboards_tt READONLY
    ,@user_id int
)
AS
SET NOCOUNT ON
DECLARE @updated_count INT;
-- Update Process

    DELETE FROM dbo.role_dashboards WHERE role_dashboard_id IN (SELECT role_dashboard_id FROM @tt WHERE role_dashboard_id IS NOT NULL AND role_id IS NULL);

	UPDATE a 
		 SET role_id         = b.role_id
	 	    ,page_id         = b.page_id
			,seq_no          = b.seq_no
	   	    ,updated_by      = @user_id
			,updated_date    = GETDATE()
       FROM dbo.role_dashboards a INNER JOIN @tt b
	     ON a.role_dashboard_id = b.role_dashboard_id 
	    WHERE isnull(b.is_edited,'N') = 'Y'

SET @updated_count = @@ROWCOUNT;

-- Insert Process
	INSERT INTO role_dashboards (
		role_id
		,page_id
		,seq_no
		,created_by
		,created_date
    )
	SELECT 
		role_id
		,page_id
		,seq_no
	    , @user_id
	    ,GETDATE()
	FROM @tt 
	WHERE role_dashboard_id IS NULL
	AND role_id IS NOT NULL AND page_id IS NOT NULL;

SET @updated_count = @updated_count + @@ROWCOUNT;


RETURN @updated_count;



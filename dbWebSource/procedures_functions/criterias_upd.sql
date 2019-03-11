
create PROCEDURE [dbo].[criterias_upd]
(
    @tt    criterias_tt READONLY
   ,@user_id int
)
AS
-- DELETE
   DELETE FROM dbo.criterias WHERE criteria_id IN (SELECT criteria_id FROM @tt WHERE ISNULL(criteria_title,'')='')
-- Update Process
	UPDATE a 
		   SET 
	 		  criteria_title	= b.criteria_title
			 ,pcriteria_id		= b.pcriteria_id
			 ,seq_no			= b.seq_no
			 ,is_active			= b.is_active
			 ,trend_menu_id		= b.trend_menu_id
		     ,updated_by		= @user_id
			 ,updated_date		= GETDATE()
	   FROM dbo.criterias a INNER JOIN @tt b
	     ON a.criteria_id = b.criteria_id 
	    AND (isnull(is_edited,'N')='Y')

-- Insert Process
	INSERT INTO criterias (
		 criteria_title
		,pcriteria_id
		,seq_no		
		,is_active		
    	,trend_menu_id	
		,created_by
		,created_date
	)
	SELECT 
 		criteria_title
 		,pcriteria_id
 		,seq_no		
 		,is_active		
     	,trend_menu_id	
    	,@user_id
	    ,GETDATE()
	FROM @tt 
	WHERE criteria_id IS NULL
	and criteria_title IS NOT NULL
	and trend_menu_id IS NOT NULL;



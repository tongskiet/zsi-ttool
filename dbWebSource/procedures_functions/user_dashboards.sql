-- ========================================================================
-- 
-- Copyright (c) 2016-2017 ZettaSolutions, Inc.  All rights reserved.
-- 
-- Redistribution and use in source and binary forms, with or without
-- modification is strictly prohibited.
--
-- ************************************************************************
--
-- Modification History
-- Date       By    History
-- ---------  ----  -------------------------------------------------------
-- 22-FEB-17  GT    New
-- ========================================================================

CREATE FUNCTION [dbo].[user_dashboards]
(
   @user_id INT
)
RETURNS @us TABLE 
(
	page_id   int
   ,page_title nvarchar(100)
   ,page_name nvarchar(100)
)
AS
BEGIN
   DECLARE @organization_id   INT;

      SELECT @organization_id = organization_id
     FROM dbo.users 
    WHERE user_id = @user_id;
     
      BEGIN
		  INSERT INTO @us
			 SELECT DISTINCT page_id, page_title, page_name
			   FROM organizations_v 
			  WHERE organization_id IN (SELECT organization_id 
									  FROM dbo.org_child(@organization_id) 
									);
      END

   RETURN

END

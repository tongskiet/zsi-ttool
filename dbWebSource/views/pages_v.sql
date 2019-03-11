CREATE  VIEW dbo.pages_v
AS
SELECT        p.page_id, p.page_name, p.page_title,p.is_public, mp.master_page_id, mp.master_page_name
FROM            dbo.pages p INNER JOIN
                         dbo.master_pages mp ON p.master_page_id = mp.master_page_id


CREATE procedure [dbo].[master_pages_sel]
    @master_page_id int =null
as
BEGIN
    if(@master_page_id IS NOT NULL)
        select * from dbo.master_pages where master_page_id=@master_page_id
    else
        select * from dbo.master_pages order by 2
END
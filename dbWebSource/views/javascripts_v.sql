
CREATE view dbo.javascripts_v
as
select a.*,b.page_name,dbo.getUser(a.created_by) created_by_name,dbo.getUser(a.updated_by) updated_by_name from dbo.javascripts a inner join dbo.pages b on a.page_id=b.page_id

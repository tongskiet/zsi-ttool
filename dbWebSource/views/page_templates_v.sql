CREATE view [dbo].[page_templates_v]
as
select p.page_name,pt.* from dbo.page_templates pt inner join dbo.pages p on pt.page_id=p.page_id

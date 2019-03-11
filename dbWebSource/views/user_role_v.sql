CREATE VIEW dbo.user_role_v
AS
SELECT        TOP (100) PERCENT dbo.users_v.*, dbo.users_v.role_id AS Expr1, dbo.roles.role_name, dbo.roles.is_export_excel, dbo.roles.is_export_pdf, dbo.roles.is_import_excel, dbo.roles.is_add, dbo.roles.is_edit, 
                         dbo.roles.is_delete
FROM            dbo.users_v INNER JOIN
                         dbo.roles ON dbo.users_v.role_id = dbo.roles.role_id

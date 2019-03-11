CREATE VIEW dbo.users_fullnames_v
AS
SELECT        TOP (100) PERCENT user_id, last_name + ', ' + first_name AS full_name, role_id, is_employee, is_active, is_pilot, squadron_id
FROM            dbo.users
WHERE        (is_active = 'Y') AND (is_employee = 'Y')

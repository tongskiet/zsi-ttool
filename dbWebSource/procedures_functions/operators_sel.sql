CREATE PROCEDURE dbo.operators_sel
as
BEGIN
   SELECT operator_value, operator_name from dbo.operators 
END
CREATE PROCEDURE [dbo].[criteria_group_sel] (
  @criteria_id int=null
)
AS
BEGIN
      SELECT criteria_id, criteria_title from dbo.criterias WHERE ISNULL(pcriteria_id,0)=0
      AND criteria_id <> ISNULL(@criteria_id,0) and is_active='Y' order by seq_no
END


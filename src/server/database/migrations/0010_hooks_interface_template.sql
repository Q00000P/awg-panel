-- upstream 0009_dusty_prodigy, limited to wg0's own hooks: in the fork other
-- interfaces (awg1, ...) already use {{name}}, and their hooks may reference
-- wg0 on purpose
UPDATE `hooks_table` SET
  `pre_up` = replace(`pre_up`, 'wg0', '{{interface}}'),
  `post_up` = replace(`post_up`, 'wg0', '{{interface}}'),
  `pre_down` = replace(`pre_down`, 'wg0', '{{interface}}'),
  `post_down` = replace(`post_down`, 'wg0', '{{interface}}')
WHERE `id` = 'wg0';

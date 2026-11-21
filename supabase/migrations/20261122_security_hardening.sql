-- ZERO-LANG Security Hardening Migration
-- Addresses SECURITY DEFINER function vulnerabilities

-- ============================================
-- 1. Fix get_due_srs_items: add ownership check
-- ============================================

CREATE OR REPLACE FUNCTION get_due_srs_items(p_user_id UUID, p_unit_id UUID DEFAULT NULL)
RETURNS SETOF srs_items AS $$
BEGIN
  -- Security: only allow users to query their own items
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Access denied: cannot query another user''s SRS items';
  END IF;

  RETURN QUERY
  SELECT * FROM srs_items
  WHERE user_id = p_user_id
    AND next_review <= NOW()
    AND (p_unit_id IS NULL OR unit_id = p_unit_id)
  ORDER BY next_review ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 2. Fix update_srs_after_review: add ownership check
-- ============================================

CREATE OR REPLACE FUNCTION update_srs_after_review(
  p_item_id UUID,
  p_rating SRS_RATING,
  p_time_taken INT
) RETURNS VOID AS $$
DECLARE
  v_item srs_items%ROWTYPE;
  v_new_stability NUMERIC;
  v_new_difficulty NUMERIC;
  v_new_interval INT;
  v_new_state SRS_STATE;
BEGIN
  -- Security: verify the item belongs to the calling user
  SELECT * INTO v_item FROM srs_items WHERE id = p_item_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: SRS item not found or not owned by current user';
  END IF;

  -- Simplified FSRS-like update
  CASE p_rating
    WHEN 'again' THEN
      v_new_stability := GREATEST(0.1, v_item.stability * 0.5);
      v_new_difficulty := LEAST(10, v_item.difficulty + 1);
      v_new_interval := 1;
      v_new_state := CASE WHEN v_item.lapses > 0 THEN 'relearning' ELSE 'learning' END;
    WHEN 'hard' THEN
      v_new_stability := v_item.stability * 1.2;
      v_new_difficulty := LEAST(10, v_item.difficulty + 0.5);
      v_new_interval := GREATEST(1, ROUND(v_new_stability * LN(0.9) / LN(0.9)));
      v_new_state := CASE WHEN v_item.repetitions = 0 THEN 'learning' ELSE 'review' END;
    WHEN 'good' THEN
      v_new_stability := v_item.stability * CASE WHEN v_item.repetitions = 0 THEN 2.5 ELSE 1.5 END;
      v_new_difficulty := GREATEST(0, v_item.difficulty - 0.2);
      v_new_interval := GREATEST(1, ROUND(v_new_stability * LN(0.9) / LN(0.9)));
      v_new_state := CASE WHEN v_item.repetitions = 0 THEN 'learning' ELSE 'review' END;
    WHEN 'easy' THEN
      v_new_stability := v_item.stability * CASE WHEN v_item.repetitions = 0 THEN 4 ELSE 2 END;
      v_new_difficulty := GREATEST(0, v_item.difficulty - 0.5);
      v_new_interval := GREATEST(1, ROUND(v_new_stability * LN(0.9) / LN(0.9)));
      v_new_state := 'review';
  END CASE;

  IF v_new_stability >= 365 THEN
    v_new_state := 'mastered';
  END IF;

  UPDATE srs_items
  SET
    state = v_new_state,
    interval = v_new_interval,
    ease_factor = v_new_difficulty,
    repetitions = v_item.repetitions + 1,
    lapses = CASE WHEN p_rating = 'again' THEN v_item.lapses + 1 ELSE v_item.lapses END,
    last_reviewed = NOW(),
    next_review = NOW() + (v_new_interval || ' days')::INTERVAL,
    stability = v_new_stability,
    difficulty = v_new_difficulty,
    updated_at = NOW()
  WHERE id = p_item_id;

  INSERT INTO srs_reviews (item_id, rating, reviewed_at, time_taken_seconds)
  VALUES (p_item_id, p_rating, NOW(), p_time_taken);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 3. Revoke EXECUTE from PUBLIC, grant to authenticated only
-- ============================================

REVOKE EXECUTE ON FUNCTION get_due_srs_items(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_due_srs_items(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION get_due_srs_items(UUID, UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION update_srs_after_review(UUID, SRS_RATING, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION update_srs_after_review(UUID, SRS_RATING, INT) FROM anon;
GRANT EXECUTE ON FUNCTION update_srs_after_review(UUID, SRS_RATING, INT) TO authenticated;

-- ============================================
-- 4. Security note on tutor_configs.api_key_encrypted
-- ============================================
-- The tutor feature has been removed from the UI.
-- The api_key_encrypted column stores AES-GCM encrypted API keys.
-- Encryption key is derived from NEXT_PUBLIC_ENCRYPTION_KEY (client-exposed).
-- RECOMMENDATION: Remove tutor_configs table if unused, or implement
-- server-side encryption with a private key before re-enabling tutor features.
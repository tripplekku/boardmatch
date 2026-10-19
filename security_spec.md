# Security Specification & Test Matrix

## 1. Data Invariants
- `games`: Publicly readable catalog for board game recommendation lookups. Write operations (create/update/delete) are restricted to authenticated admins (`homenkohoma0@gmail.com`) or initial seeding.
- `users/{userId}/favorites/{gameId}`: A user can only read, create, and delete their own favorites (`request.auth.uid == userId`). Cross-user favorite tampering is strictly forbidden.
- `users/{userId}/recommendations/{historyId}`: A user can only access and write their own quiz recommendation logs (`request.auth.uid == userId`).
- Document IDs must conform to `isValidId()` (`[a-zA-Z0-9_-]+` and size <= 128).

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Write to /games**: Anonymous or unauthenticated actor attempts to mutate game document `/games/catan`. -> Expect: `PERMISSION_DENIED`.
2. **User A modifying User B's favorites**: Authenticated user `user_alice` tries writing to `/users/user_bob/favorites/catan`. -> Expect: `PERMISSION_DENIED`.
3. **Ghost fields injection**: User tries to add an unmodeled field `__adminPrivilege: true` to a favorite document. -> Expect: `PERMISSION_DENIED`.
4. **ID Poisoning / Buffer Overflow**: User sends a 2KB junk string as `gameId` in the path. -> Expect: `PERMISSION_DENIED`.
5. **Blanket Query Scraping**: Malicious client sends collection group list query across all user favorites without user constraint. -> Expect: `PERMISSION_DENIED`.
6. **Spoofed User UID**: Request where `request.auth.uid == "user_1"` but document payload has `userId: "user_2"`. -> Expect: `PERMISSION_DENIED`.
7. **Negative Playtime / Invalid Type**: Attempt to set `minPlaytime: -50` or `complexity: "super-hard-unknown"`. -> Expect: `PERMISSION_DENIED`.
8. **Unverified Email Privilege Escalation**: User claiming admin email without `email_verified == true`. -> Expect: `PERMISSION_DENIED`.
9. **Tampering with Immortal Field**: Attempting to update another user's favorite creation timestamp. -> Expect: `PERMISSION_DENIED`.
10. **Corrupted Array Tags**: Sending non-array or oversized array of tags exceeding limits. -> Expect: `PERMISSION_DENIED`.
11. **Direct root document creation**: Attempting to write to arbitrary unspecified root path `/{document=**}`. -> Expect: `PERMISSION_DENIED`.
12. **Malicious Delete**: User attempting to delete another player's recommendation history. -> Expect: `PERMISSION_DENIED`.

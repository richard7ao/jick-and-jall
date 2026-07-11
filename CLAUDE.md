@AGENTS.md

## Project-Specific Constraints (ABSOLUTE — no exceptions)

| Rule | Reason |
| --- | --- |
| Follow the v3 three-file state protocol in `AGENTS.md`; never recreate v2 state | Two computers need isolated runtime ownership and derived progress |
| Write only the claimed stage scopes and the runtime file selected by `JJ_AGENT_ID` | Prevents invisible cross-machine conflicts |
| Block whenever mandatory simplification, verification, credentials, or human approval are unavailable | Silent skips create false completion evidence |
| Never store secrets, private content, or raw command output in project files | Planning, receipts, and runtime state are committed and shared |

# Claude Code Instructions

## Feature completion workflow

After finishing any feature or fix:

1. Add tests to the suite covering the new behaviour
2. Run the full relevant test suite
3. Show the user the test results
4. Ask "Should I commit and push?" — do NOT commit or push without explicit approval

Never push to GitHub without the user's consent, even for small fixes.

FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E "\.(js|jsx|ts|tsx)$")

# nothing to check
if [ -z "$FILES" ]; then
  exit 0
fi

FAILED=0
echo "��� Running custom pre-commit checks..."

# Max 1000 lines
for file in $FILES; do
  # if file was deleted or not present in working tree, skip
  if [ ! -f "$file" ]; then
    continue
  fi
  LINE_COUNT=$(wc -l < "$file" | tr -d ' ')
  if [ "$LINE_COUNT" -gt 1000 ]; then
    echo "❌ ERROR: $file has $LINE_COUNT lines (> 1000). Split the file."
    FAILED=1
  fi
done

# Forbid 'any' as a whole word
for file in $FILES; do
  if [ ! -f "$file" ]; then
    continue
  fi
  if grep -n --line-number -E '\bany\b' "$file" >/dev/null 2>&1; then
    echo "❌ ERROR: '$file' contains 'any'. Use proper types."
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo "��� Commit blocked. Fix the issues above."
  exit 1
fi

echo "✅ All checks passed."
exit 0

Set-Location H:\mee\SufficientDaikon
$env:GIT_TERMINAL_PROMPT = "0"

# Unstage the prompt file
git reset HEAD readme-overhaul-prompt.xml

# Commit the staged changes
git commit -m "feat: timezone-adaptive activity chart + README polish`n`n- Add Vercel Edge Function (api/productive-time.js) that detects visitor`n  timezone via x-vercel-ip-timezone header and proxies the productive-time`n  SVG with correct utcOffset parameter`n- Update README to use edge function proxy for commits-by-hour chart`n- Fix AI Skills badge icon (logo=robot to logo=probot)`n- Add cache_seconds=7200 to all grs-deploy.vercel.app URLs`n- Add Activity section to index.html with JS timezone detection,`n  time-aware greeting, and dynamically loaded productive-time chart`n- Add vercel.json for edge function routing`n`nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Push
git push origin main

Write-Host "DONE"

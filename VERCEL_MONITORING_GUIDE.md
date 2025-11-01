# Vercel Production Monitoring Guide

## 🔍 Monitoring Setup

### Access Vercel Dashboard
1. Navigate to: https://vercel.com/dashboard
2. Select project: `rythmiq-dockit`
3. Go to "Logs" tab
4. Select "Production" environment

---

## 📊 Key Metrics to Monitor

### 1. Generation Time (p95 latency)
**Filter:** `generation-time` or `schema-gen`  
**Target:** <30s for p95  
**Alert:** If >30s consistently

**Sample Log Pattern:**
```
[schema-gen] Generation completed in 24.3s | coverage: 96%
```

### 2. Validation Performance
**Filter:** `ajv-validate`  
**Metrics:**
- Validation time
- Error rates
- Schema compliance scores

**Sample Log Pattern:**
```
[ajv-validate] Validated 42 fields in 0.3s | errors: 0
```

### 3. Coverage Statistics
**Filter:** `coverage`  
**Target:** ≥96%  
**Track:**
- Field detection rate
- Confidence scores
- Missing fields

**Sample Log Pattern:**
```
[coverage] Field coverage: 96.2% | detected: 41/42 | confidence: 0.94
```

---

## 🔔 Alert Thresholds

| Metric               | Warning | Critical |
|----------------------|---------|----------|
| Generation Time (p95)| 25s     | 35s      |
| Error Rate           | 2%      | 5%       |
| Coverage             | 94%     | 90%      |
| API Response Time    | 3s      | 5s       |

---

## 📈 Vercel CLI Commands

### Real-time Logs
```bash
# Stream production logs
npx vercel logs --follow rythmiq-dockit

# Filter by function
npx vercel logs --follow rythmiq-dockit --output=schema-gen

# Last 100 lines
npx vercel logs rythmiq-dockit --lines 100
```

### Deployment Info
```bash
# List recent deployments
npx vercel list rythmiq-dockit

# Get deployment details
npx vercel inspect <deployment-url>
```

---

## 🔎 Log Analysis Examples

### Find Slow Generations
```bash
npx vercel logs rythmiq-dockit | grep "generation-time" | grep -E "[3-9][0-9]s|[0-9]{3}s"
```

### Check Error Rates
```bash
npx vercel logs rythmiq-dockit | grep -i "error" | wc -l
```

### Coverage Analysis
```bash
npx vercel logs rythmiq-dockit | grep "coverage" | tail -20
```

---

## 📊 Dashboard Widgets

### Recommended Analytics Views

1. **Request Duration**
   - Function: `/api/schema-gen`
   - Percentiles: p50, p90, p95, p99
   - Time range: Last 24 hours

2. **Error Rate**
   - Status codes: 4xx, 5xx
   - Grouped by endpoint
   - Trend over last 7 days

3. **Invocation Count**
   - Per function
   - Per hour/day
   - Identify usage patterns

4. **Cold Start Time**
   - Track serverless cold starts
   - Optimize if >2s

---

## 🚨 Common Issues & Solutions

### Issue: High Generation Time
**Symptoms:** p95 >30s  
**Check:**
- PDF size (should be <5MB)
- Network latency
- OCR processing time

**Solution:**
- Enable caching for repeated requests
- Optimize regex patterns
- Consider pagination for large documents

### Issue: Low Coverage
**Symptoms:** Coverage <96%  
**Check:**
- PDF quality
- Field detection confidence
- Regex pattern matches

**Solution:**
- Review regex patterns in SchemaProcessingService
- Add fallback patterns
- Improve OCR preprocessing

### Issue: High Error Rate
**Symptoms:** Errors >2%  
**Check:**
- Validation failures
- API timeouts
- IndexedDB quota issues

**Solution:**
- Review error logs for patterns
- Implement better error handling
- Add retry logic

---

## 📝 Log Format Reference

### Standard Log Entry
```json
{
  "timestamp": "2025-11-01T23:55:39.000Z",
  "level": "info",
  "function": "schema-gen",
  "message": "Schema generation completed",
  "metadata": {
    "examForm": "NEET",
    "duration": "24.3s",
    "coverage": 96.2,
    "fields": 41
  }
}
```

---

## 🔧 Troubleshooting Commands

### Check Build Status
```bash
npx vercel inspect --timeout 30000
```

### View Environment Variables
```bash
npx vercel env ls
```

### Force Redeploy
```bash
npx vercel --prod --force
```

---

## 📞 Escalation

### When to Escalate
- p95 latency >35s for >1 hour
- Error rate >5% for >30 minutes
- Deployment failures
- Critical user reports

### Escalation Contacts
- **Primary:** Lead Engineer
- **Secondary:** DevOps Team
- **Emergency:** Vercel Support (support@vercel.com)

---

## 📅 Regular Checks

### Daily (5 min)
- [ ] Check error rate
- [ ] Review p95 latency
- [ ] Scan for deployment issues

### Weekly (15 min)
- [ ] Analyze coverage trends
- [ ] Review slow query logs
- [ ] Check cold start times
- [ ] Validate alert thresholds

### Monthly (30 min)
- [ ] Full metrics review
- [ ] Performance optimization opportunities
- [ ] Cost analysis
- [ ] Update alert thresholds

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Production URL:** https://rythmiq-dockit.vercel.app/schema-gen
- **GitHub Repo:** https://github.com/AbhinavPrakashCoading/Dockit
- **Tag v0.1:** https://github.com/AbhinavPrakashCoading/Dockit/releases/tag/v0.1-complete

---

*Last Updated: November 1, 2025*  
*Version: v0.1-complete*  
*Status: Production Monitoring Active*

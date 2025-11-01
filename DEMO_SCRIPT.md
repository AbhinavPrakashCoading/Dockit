# Demo Script - Phase 1 Schema Generation Engine

**Duration:** 2 minutes  
**URL:** https://rythmiq-dockit.vercel.app/schema-gen  
**Exam Form:** NEET

---

## 🎬 Script Timeline

### 00:00 - 00:15 | Introduction (15s)
"Hi everyone! Today I'm demoing our Phase 1 Schema Generation Engine. This tool automatically generates validation schemas from exam form PDFs. Let's see it in action with a NEET application form."

**Action:**
- Show schema-gen page loaded
- Highlight the interface elements

---

### 00:15 - 00:45 | Schema Generation (30s)
"I'll start by entering 'NEET' as the exam form and clicking Generate."

**Action:**
- Type "NEET" in the exam form input field
- Click "Generate Schema" button
- Show the loading state/progress indicator

"Watch as the system processes the document, extracts fields, and infers validation rules..."

**Action:**
- Wait for generation to complete
- Show the generated schema appearing

"And there we go! In under 30 seconds, we have a complete schema with 96% field coverage."

---

### 00:45 - 01:15 | Stepper Flow Navigation (30s)
"The interface uses a stepper to organize fields by category. Let's navigate through them."

**Action:**
- Click through stepper steps: Personal Info → Academic Details → Contact
- Show different field categories appearing

"Each step shows relevant fields with their detected types and validation patterns."

**Action:**
- Highlight a few different field types (text, date, email, phone)
- Show the pattern/format indicators

---

### 01:15 - 01:40 | Live Editing Demo (25s)
"Now let's make an edit. I'll modify the phone pattern to support international format."

**Action:**
- Click on a phone field
- Show the edit interface/modal
- Change pattern from `^[0-9]{10}$` to `^\\+?[0-9]{10,15}$`
- Save the change

"Notice how the change auto-saves to IndexedDB for persistence."

**Action:**
- Show the toast notification: "Schema updated"
- Highlight the updated field

---

### 01:40 - 02:00 | Preview & Validation (20s)
"Finally, let's preview the validation report."

**Action:**
- Click "Test Mock Data" or validation button
- Show the compliance report

"Here's our compliance report showing 96% coverage, all required fields validated, and recommendations for improvements."

**Action:**
- Scroll through the report briefly
- Highlight key metrics: coverage %, issues, recommendations

"And that's it! A complete schema generation workflow in under 2 minutes. Questions? Drop them in Slack!"

---

## 🎯 Key Points to Emphasize

1. **Speed:** <30s generation time
2. **Coverage:** 96% field detection
3. **UX:** Intuitive stepper interface
4. **Editing:** Real-time field editing with auto-save
5. **Validation:** Comprehensive compliance reporting

---

## 📋 Pre-Demo Checklist

- [ ] Clear browser cache/IndexedDB
- [ ] Verify production URL is accessible
- [ ] Test NEET generation works (<30s)
- [ ] Prepare screen recording software (Loom)
- [ ] Check audio levels
- [ ] Have example phone pattern edit ready: `^\\+?[0-9]{10,15}$`
- [ ] Close unnecessary tabs/windows

---

## 🎥 Recording Tips

- **Resolution:** 1920x1080 minimum
- **Frame Rate:** 30fps
- **Audio:** Clear, minimal background noise
- **Mouse:** Slow, deliberate movements
- **Pauses:** Brief pause after each major action
- **Cursor Highlighting:** Enable if available in Loom

---

## 📤 Post-Recording

1. Upload to Loom
2. Add title: "Dockit Phase 1: Schema Generation Engine Demo - NEET Flow"
3. Add description with key timestamps
4. Set privacy to "Team" or "Anyone with link"
5. Get shareable link
6. Post to Slack #phase1-complete with:
   - Video link
   - Brief context
   - Request for feedback

---

## 🔗 Links for Demo

- Production: https://rythmiq-dockit.vercel.app/schema-gen
- GitHub Tag: https://github.com/AbhinavPrakashCoading/Dockit/releases/tag/v0.1-complete
- Retrospective: See PHASE_1_RETROSPECTIVE.md

---

*Demo prepared for Phase 1 Complete milestone*  
*November 1, 2025*

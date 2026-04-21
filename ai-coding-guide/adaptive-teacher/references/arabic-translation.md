# Egyptian Arabic Translation Reference — دليل الترجمة للعامية المصرية

Comprehensive guide for translating technical content into Egyptian Arabic (العامية المصرية). This is NOT Modern Standard Arabic. This is the language 100+ million Egyptians actually speak.

---

## The Golden Rule

**When in doubt, say it the way a senior Egyptian developer would explain it to a junior colleague over tea in a Cairo office.**

Not how a textbook would write it. Not how Al Jazeera would say it. How a real Egyptian in tech would say it at work.

---

## Egyptian Arabic Fundamentals for AI Agents

### Why This Matters

Most language models default to Modern Standard Arabic (الفصحى) because that's what dominates Arabic text on the internet. But MSA is to Egyptian Arabic what Shakespearean English is to modern American English — grammatically related but socially different. Teaching someone in MSA feels cold, distant, and academic.

Egyptian Arabic (العامية المصرية) is:

- The most widely understood Arabic dialect (thanks to Egyptian cinema and music)
- What Egyptians use in daily life, work, texting, and social media
- The natural language of tech culture in Egypt

### Common AI Mistakes to Avoid

| ❌ AI Default (MSA) | ✅ Correct (Egyptian Arabic) | Context              |
| ------------------- | ---------------------------- | -------------------- |
| هل تريد أن...       | عايز/عايزة...                | "Do you want to..."  |
| هذا يعني أن...      | ده معناه إن...               | "This means that..." |
| لا أفهم             | مش فاهم/ة                    | "I don't understand" |
| يجب عليك أن         | لازم + verb                  | "You must..."        |
| لماذا               | ليه                          | "Why"                |
| كيف                 | إزاي                         | "How"                |
| ماذا / ما           | إيه                          | "What"               |
| أين                 | فين                          | "Where"              |
| متى                 | إمتى                         | "When"               |
| من                  | مين                          | "Who"                |
| الآن                | دلوقتي                       | "Now"                |
| ربما / قد           | يمكن / ممكن                  | "Maybe"              |
| لأن                 | عشان                         | "Because"            |
| ولكن                | بس                           | "But"                |
| أيضاً               | كمان                         | "Also"               |
| كثيراً              | كتير                         | "A lot"              |
| جداً                | أوي / قوي                    | "Very"               |
| يوجد / لا يوجد      | فيه / مفيش                   | "There is / isn't"   |
| هنا / هناك          | هنا / هناك (same)            | "Here / There"       |
| نعم                 | أيوه / آه                    | "Yes"                |
| لا                  | لأ                           | "No"                 |
| من فضلك             | لو سمحت                      | "Please"             |
| شكراً               | شكراً / ميرسي                | "Thank you"          |

### Verb Conjugation Patterns (Simplified)

Egyptian Arabic simplifies MSA verb conjugation significantly:

| Person        | MSA    | Egyptian | Example (يكتب/write)                           |
| ------------- | ------ | -------- | ---------------------------------------------- |
| أنا (I)       | أكتب   | بأكتب    | بأكتب كود (I write code)                       |
| أنت (you, m)  | تكتب   | بتكتب    | بتكتب إيه؟ (What are you writing?)             |
| أنتِ (you, f) | تكتبين | بتكتبي   | بتكتبي فانكشن (You're writing a function)      |
| هو (he)       | يكتب   | بيكتب    | بيكتب تيست (He's writing a test)               |
| هي (she)      | تكتب   | بتكتب    | بتكتب كومبوننت (She's writing a component)     |
| إحنا (we)     | نكتب   | بنكتب    | بنكتب كود مع بعض (We're writing code together) |
| هم (they)     | يكتبون | بيكتبوا  | بيكتبوا ريفيو (They're writing a review)       |

**Key prefix:** Egyptian Arabic adds "ب" (ba) before present-tense verbs to indicate ongoing action. MSA doesn't do this.

### Negation

Egyptian Arabic has a unique negation pattern: **مـ...ـش** wrapping the verb.

| Positive | Negative | Meaning           |
| -------- | -------- | ----------------- |
| فاهم     | مش فاهم  | Not understanding |
| عارف     | مش عارف  | Don't know        |
| شغال     | مش شغال  | Not working       |
| بيشتغل   | مبيشتغلش | It doesn't work   |
| اتعلمت   | ماتعلمتش | I didn't learn    |
| هعمل     | مش هعمل  | I won't do        |

---

## Technical Vocabulary — 200+ Terms

### Programming Fundamentals

| English       | Transliterated Egyptian | Usage Example                     |
| ------------- | ----------------------- | --------------------------------- |
| Variable      | فاريابل                 | "عرّف فاريابل اسمه x"             |
| Function      | فانكشن                  | "الفانكشن دي بترجع true"          |
| Class         | كلاس                    | "اعمل كلاس جديد"                  |
| Object        | أوبجكت                  | "الأوبجكت ده فيه 3 properties"    |
| Array         | أراي                    | "الأراي فيها 10 عناصر"            |
| String        | سترينج                  | "ده سترينج مش نمبر"               |
| Boolean       | بوليان                  | "الفاريابل ده بوليان"             |
| Integer       | إنتيجر                  | "خليه إنتيجر مش فلوت"             |
| Float         | فلوت                    | "استخدم فلوت للأرقام العشرية"     |
| Null          | نَل                     | "الفاليو بتاعته نَل"              |
| Undefined     | أندفايند                | "الفاريابل أندفايند"              |
| Loop          | لوب                     | "اعمل لوب على الأراي"             |
| If statement  | إف ستيتمنت              | "حط إف ستيتمنت هنا"               |
| Condition     | كوندشن                  | "الكوندشن بتتشيك أول حاجة"        |
| Return        | ريتيرن                  | "الفانكشن بتعمل ريتيرن لأوبجكت"   |
| Parameter     | باراميتر                | "الفانكشن بتاخد 3 باراميترز"      |
| Argument      | أرجيومنت                | "باسّ الأرجيومنت ده"              |
| Type          | تايب                    | "إيه التايب بتاع الفاريابل ده؟"   |
| Interface     | إنترفيس                 | "عرّف إنترفيس للأوبجكت"           |
| Enum          | إنَم                    | "استخدم إنَم بدل الستيرنجز"       |
| Scope         | سكوب                    | "الفاريابل ده خارج السكوب"        |
| Closure       | كلوجر                   | "ده كلوجر — بيحتفظ بالسكوب"       |
| Callback      | كولباك                  | "باسّ كولباك فانكشن"              |
| Promise       | بروميس                  | "الفانكشن بترجع بروميس"           |
| Async/Await   | أسينك/أويت              | "استخدم أسينك أويت بدل الكولباكس" |
| Error         | إيرور                   | "فيه إيرور في الكونسول"           |
| Exception     | إكسبشن                  | "الكود بيرمي إكسبشن"              |
| Try/Catch     | تراي/كاتش               | "لف الكود في تراي كاتش"           |
| Module        | موديول                  | "الموديول ده بيعمل إكسبورت"       |
| Import/Export | إمبورت/إكسبورت          | "اعمل إمبورت للفانكشن"            |
| Library       | لايبراري                | "اللايبراري دي بتعمل..."          |
| Package       | باكيدج                  | "اسطب الباكيدج ده"                |
| Dependency    | ديبندنسي                | "فيه ديبندنسي مفقودة"             |

### Web Development

| English      | Transliterated Egyptian | Usage Example                  |
| ------------ | ----------------------- | ------------------------------ |
| Frontend     | فرونت إند               | "الفرونت إند بالرياكت"         |
| Backend      | باك إند                 | "الباك إند بالنود"             |
| Full-stack   | فول ستاك                | "أنا فول ستاك ديفلوبر"         |
| API          | إيه بي آي               | "الإيه بي آي بيرجع JSON"       |
| Endpoint     | إندبوينت                | "اعمل إندبوينت جديد"           |
| Request      | ريكويست                 | "ابعت ريكويست للسيرفر"         |
| Response     | ريسبونس                 | "الريسبونس فيه الداتا"         |
| Status code  | ستاتس كود               | "الستاتس كود 404"              |
| Server       | سيرفر                   | "السيرفر واقع"                 |
| Client       | كلاينت                  | "الكلاينت بيبعت ريكويست"       |
| Database     | داتابيز                 | "الداتابيز فيها الداتا كلها"   |
| Query        | كويري                   | "اعمل كويري على الداتابيز"     |
| Schema       | سكيما                   | "السكيما بتعرّف الجداول"       |
| Migration    | مايجريشن                | "شغّل المايجريشن"              |
| ORM          | أو آر إم                | "بنستخدم أو آر إم"             |
| Route/Router | راوت/راوتر              | "الراوتر بيحدد الباثات"        |
| Middleware   | ميدل وير                | "حط ميدل وير للأوث"            |
| Controller   | كونترولر                | "الكونترولر بيهاندل الريكويست" |
| Model        | موديل                   | "الموديل بيمثل الجدول"         |
| View         | فيو                     | "الفيو بيعرض الداتا"           |
| Component    | كومبوننت                | "اعمل كومبوننت جديد"           |
| State        | ستيت                    | "الستيت بيتغير لما..."         |
| Props        | بروبس                   | "باسّ البروبس للكومبوننت"      |
| Hook         | هوك                     | "استخدم يوزستيت هوك"           |
| DOM          | دوم                     | "الدوم هو الصفحة في الميموري"  |
| CSS          | سي إس إس                | "اكتب السي إس إس"              |
| HTML         | إتش تي إم إل            | "الإتش تي إم إل هو الهيكل"     |
| Responsive   | ريسبونسف                | "لازم يكون ريسبونسف"           |
| Layout       | لاي أوت                 | "اللاي أوت بالجريد"            |
| Rendering    | ريندرينج                | "الريندرينج بيحصل على السيرفر" |
| SEO          | إس إي أو                | "مهم للـ إس إي أو"             |
| Hosting      | هوستينج                 | "الهوستينج على كلاودفلير"      |

### DevOps & Infrastructure

| English       | Transliterated Egyptian | Usage Example                   |
| ------------- | ----------------------- | ------------------------------- |
| Deploy        | ديبلوي                  | "ديبلوي على البرودكشن"          |
| Build         | بيلد                    | "البيلد فِيل"                   |
| Pipeline      | بايبلاين                | "البايبلاين بيعمل تيست وديبلوي" |
| CI/CD         | سي آي / سي دي           | "عندنا سي آي سي دي"             |
| Container     | كونتينر                 | "شغّل في كونتينر"               |
| Docker        | دوكر                    | "استخدم دوكر"                   |
| Kubernetes    | كوبرنيتيز               | "بنستخدم كوبرنيتيز"             |
| Cloud         | كلاود                   | "على الكلاود"                   |
| Environment   | إنفايرونمنت             | "إنفايرونمنت الديف"             |
| Production    | برودكشن                 | "على البرودكشن"                 |
| Staging       | ستاجينج                 | "جرّب على الستاجينج الأول"      |
| Monitoring    | مونيتورينج              | "المونيتورينج شغال"             |
| Logging       | لوجينج                  | "اللوجينج بيسجّل كل حاجة"       |
| Load balancer | لود بالانسر             | "اللود بالانسر بيوزع"           |

### Git & Version Control

| English         | Transliterated Egyptian | Usage Example          |
| --------------- | ----------------------- | ---------------------- |
| Repository/Repo | ريبو                    | "كلون الريبو"          |
| Branch          | برانش                   | "اعمل برانش جديد"      |
| Commit          | كوميت                   | "اعمل كوميت للتغييرات" |
| Push            | بوش                     | "بوش على الريموت"      |
| Pull            | بول                     | "اعمل بول الأول"       |
| Merge           | ميرج                    | "ميرج البرانش"         |
| Conflict        | كونفلكت                 | "فيه ميرج كونفلكت"     |
| Pull Request/PR | بول ريكويست / بي آر     | "اعمل بي آر"           |
| Review          | ريفيو                   | "محتاج ريفيو"          |
| Diff            | ديف                     | "شوف الديف"            |
| Stash           | ستاش                    | "ستاش التغييرات"       |
| Rebase          | ريبيز                   | "اعمل ريبيز على المين" |
| Tag             | تاج                     | "حط تاج للريليز"       |

### Testing

| English          | Transliterated Egyptian | Usage Example          |
| ---------------- | ----------------------- | ---------------------- |
| Test             | تيست                    | "اكتب تيست"            |
| Unit test        | يونت تيست               | "اليونت تيست باسّ"     |
| Integration test | إنتجريشن تيست           | "الإنتجريشن تيستس"     |
| E2E test         | إي تو إي تيست           | "الإي تو إي شغالين"    |
| Mock             | موك                     | "اعمل موك للإيه بي آي" |
| Assertion        | أسيرشن                  | "الأسيرشن فِيل"        |
| Coverage         | كوفريدج                 | "الكوفريدج ٨٠٪"        |
| Debug            | ديباج                   | "يلا نعمل ديباج"       |
| Breakpoint       | بريكبوينت               | "حط بريكبوينت هنا"     |
| Stack trace      | ستاك تريس               | "شوف الستاك تريس"      |
| Bug              | باج                     | "فيه باج في الكود"     |
| Fix              | فيكس                    | "الفيكس شغال"          |

### AI & ML

| English        | Transliterated Egyptian | Usage Example              |
| -------------- | ----------------------- | -------------------------- |
| Model          | موديل                   | "الموديل بيتدرب"           |
| Training       | تريننج                  | "التريننج خلص"             |
| Inference      | إنفرنس                  | "الإنفرنس سريع"            |
| Prompt         | برومبت                  | "اكتب برومبت أحسن"         |
| Token          | توكن                    | "عدد التوكنز"              |
| Fine-tuning    | فاين تيونينج            | "اعمل فاين تيونينج"        |
| Embedding      | إمبيدينج                | "الإمبيدينجز"              |
| RAG            | راج                     | "بنستخدم راج"              |
| Agent          | إيجنت                   | "الإيجنت بيعمل..."         |
| LLM            | إل إل إم                | "الإل إل إم"               |
| Hallucination  | هالوسينيشن              | "ده هالوسينيشن من الموديل" |
| Context window | كونتكست ويندو           | "الكونتكست ويندو كبير"     |

---

## Common Teaching Phrases in Egyptian Arabic

### Starting a Lesson

```
"يلا نبدأ! النهارده هنتكلم عن..."
(Let's start! Today we'll talk about...)

"أول حاجة، خليني أسألك..."
(First thing, let me ask you...)

"عارف إيه عن الموضوع ده؟"
(What do you know about this topic?)
```

### Explaining

```
"الفكرة ببساطة إن..."
(The idea simply is that...)

"تخيل إنك..."
(Imagine that you...)

"يعني مثلاً لو عندك..."
(For example, if you have...)

"الموضوع مش معقد زي ما بيبان — ده بس..."
(It's not as complicated as it looks — it's just...)
```

### Encouraging

```
"أحسنت! بالظبط كده!"
(Well done! Exactly like that!)

"أنت ماشي تمام"
(You're doing great)

"ده سؤال ممتاز"
(That's an excellent question)

"عادي تمامًا لو مش واضح — خليني أشرح تاني بطريقة تانية"
(Totally normal if it's not clear — let me explain again differently)
```

### Checking Understanding

```
"كده واضح؟"
(Is that clear?)

"فاهم/ة لحد هنا؟"
(Understanding so far?)

"عايز أعيد أي حاجة؟"
(Want me to repeat anything?)

"في أي حاجة مش واضحة؟"
(Is anything unclear?)
```

### Transitioning

```
"تمام، دلوقتي خلينا ننتقل لـ..."
(OK, now let's move to...)

"الحاجة دي مرتبطة بـ..."
(This is related to...)

"بعد ما فهمنا ده، يبقى سهل نفهم إن..."
(After understanding this, it's easy to understand that...)
```

### Handling Mistakes

```
"مش بالظبط، بس أنت قريب"
(Not exactly, but you're close)

"فكرة حلوة! بس فيه حاجة بسيطة..."
(Nice idea! But there's one small thing...)

"ده اللي ناس كتير بتفتكره — الحقيقة إن..."
(That's what many people assume — the reality is...)
```

---

## Code-Switching Rules

Egyptian developers naturally switch between Arabic and English mid-sentence. This is normal and should be mirrored:

**Natural Egyptian tech speak:**

```
"الفانكشن دي بتاخد parameter واحد وبترجع promise"
"لازم تعمل handle للـ error عشان الأبليكيشن ميكراشش"
"اعمل import للـ component ده في الـ main file"
"الـ state بيت-update لما اليوزر يكليك على الـ button"
```

**If a learner writes to you in full Arabic,** respond in full Arabic. If they code-switch, match their level of code-switching. Never force one mode or the other.

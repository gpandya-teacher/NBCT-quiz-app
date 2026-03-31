import type { WritingPromptRecord, WritingPromptSupport } from "./types";

export const writingPrompts: WritingPromptRecord[] = [
  {
    id: "prompt-1",
    domain: "Mixed",
    title: "Science Reading/Writing Barrier",
    promptText:
      "Student A is a 4th grade student in a resource room setting with reading fluency and written output barriers that affect access to science content.",
    scenario: `Student A is a 4th grade student in a resource room setting.

Teacher observation notes that Student A is highly verbal and participates actively in Science discussions. However, when asked to read grade-level text or write independently, the student shows task-avoidance behaviors such as putting their head down and making verbal complaints. Handwriting is significantly below grade level in legibility and endurance.

Reading data shows oral reading fluency at 60 WPM, compared with a grade-level expectation of 115 WPM. The error pattern shows breakdowns on multi-syllabic words, which impacts comprehension.

In a writing sample, when asked to "Describe the life cycle of a butterfly," the student wrote: "it hach. it fly." (4 words in 10 minutes).`,
    task:
      "Identify the primary barrier or barriers, cite the key evidence, explain the academic impact, and describe SDI that would improve access to grade-level science content.",
    logic:
      "Decoding fluency and fine-motor output barriers reduce access to grade-level science reading and written response tasks.",
    powerWords: [
      "Decoding Fluency",
      "Cognitive Load",
      "Orthographic Processing",
      "Fine-Motor Deficit",
      "Dysgraphia",
      "Text-to-Speech",
      "Speech-to-Text",
      "Graphic Organizer",
    ],
    sentenceStarter:
      "The primary barrier is __________, as shown by __________, and this impacts the student's ability to __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Name the cognitive barrier.",
      "Name the physical or output barrier.",
      "Use evidence from fluency and writing data.",
      "Explain the impact on access to science content.",
      "Describe at least one SDI or support.",
    ],
    idealAnswer:
      "The primary cognitive barrier is a deficit in decoding fluency, which increases cognitive load and limits the student’s ability to process grade-level science text. The physical/output barrier is a fine-motor deficit consistent with dysgraphia, reducing written production and endurance. To address this, I would implement text-to-speech (TTS) to provide access to content and speech-to-text to bypass handwriting demands. Additionally, graphic organizers would support structured responses aligned with grade-level expectations.",
    acceptableBarrierTerms: [
      "decoding fluency",
      "fluency deficit",
      "fine-motor deficit",
      "fine motor deficit",
      "dysgraphia",
      "output barrier",
    ],
    evidenceTerms: [
      "4th grade",
      "resource room",
      "head down",
      "verbal complaints",
      "legibility",
      "endurance",
      "60 wpm",
      "115 wpm",
      "multi-syllabic words",
      "multi syllabic words",
      "it hach. it fly.",
      "10 minutes",
    ],
    sdiTerms: [
      "text-to-speech",
      "text to speech",
      "tts",
      "speech-to-text",
      "speech to text",
      "graphic organizer",
      "graphic organizers",
    ],
  },
  {
    id: "prompt-2",
    domain: "Mixed",
    title: "Executive Function",
    promptText:
      "Student B understands math verbally but does not start written assignments independently.",
    scenario: `Student B is a 5th grade student who completes math verbally but fails to turn in written assignments.

The teacher reports: "He understands the work but doesn’t start tasks independently."`,
    task:
      "Identify the executive function barrier, cite the evidence, explain the impact on independent task completion, and provide two SDI strategies.",
    logic:
      "The barrier is task initiation and planning, not a lack of content understanding.",
    powerWords: [
      "Task Initiation",
      "Executive Dysfunction",
      "Chunking",
      "Visual Schedule",
      "Self-Monitoring",
    ],
    sentenceStarter:
      "The primary barrier is __________, as shown by __________, and this affects the student's ability to __________ independently.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the executive function deficit.",
      "Use the teacher note as evidence.",
      "Explain the impact on written task completion.",
      "Describe two SDI strategies.",
    ],
    idealAnswer:
      "The primary barrier is task initiation, an executive function deficit that limits independent work completion despite content understanding. This prevents the student from engaging in academic tasks without external prompting. I would implement visual task breakdowns (chunking) and a prompting hierarchy with gradual release to build independence. A self-monitoring checklist would further support initiation and task completion.",
    acceptableBarrierTerms: [
      "task initiation",
      "executive function deficit",
      "executive dysfunction",
      "initiation",
      "planning",
    ],
    evidenceTerms: [
      "5th grade",
      "completes math verbally",
      "fails to turn in written assignments",
      "understands the work",
      "doesn't start tasks independently",
      "does not start tasks independently",
    ],
    sdiTerms: [
      "visual task breakdowns",
      "task breakdown",
      "chunking",
      "visual schedule",
      "prompting hierarchy",
      "gradual release",
      "self-monitoring",
      "self monitoring",
      "self-monitoring checklist",
    ],
  },
  {
    id: "prompt-3",
    domain: "Mixed",
    title: "Comprehension vs Fluency",
    promptText:
      "Student C reads on grade level for fluency but cannot answer comprehension questions.",
    scenario:
      'Student C reads at 120 WPM (on grade level) but cannot answer comprehension questions.',
    task:
      "Identify the true cognitive barrier, cite the evidence, explain the impact on understanding text, and provide SDI.",
    logic:
      "Fluency does not guarantee comprehension, so the barrier lies in language processing and meaning-making.",
    powerWords: [
      "Comprehension Monitoring",
      "Inferencing",
      "Language Processing",
      "Schema Activation",
    ],
    sentenceStarter:
      "Although the student reads fluently, the primary barrier is __________, as shown by __________, which affects the student's ability to __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Distinguish fluency from comprehension.",
      "Use the 120 WPM detail as evidence.",
      "Explain the impact on meaning-making.",
      "Describe SDI for comprehension.",
    ],
    idealAnswer:
      "The student demonstrates adequate fluency, indicating intact decoding; however, the primary barrier is reading comprehension, specifically deficits in inferencing and meaning-making. This limits the ability to extract and retain information from text. I would provide explicit instruction in comprehension strategies (e.g., summarizing, questioning) and use graphic organizers to structure thinking. Guided reading with modeling would support skill acquisition.",
    acceptableBarrierTerms: [
      "reading comprehension",
      "comprehension",
      "inferencing",
      "language processing",
      "meaning-making",
    ],
    evidenceTerms: [
      "120 wpm",
      "on grade level",
      "cannot answer comprehension questions",
    ],
    sdiTerms: [
      "explicit instruction",
      "comprehension strategies",
      "summarizing",
      "questioning",
      "graphic organizer",
      "graphic organizers",
      "guided reading",
      "modeling",
    ],
  },
  {
    id: "prompt-4",
    domain: "Mixed",
    title: "Behavior vs Skill",
    promptText:
      "Student D refuses to write and throws a pencil when frustrated.",
    scenario:
      "Student D refuses to write and throws pencil when frustrated.",
    task:
      "Determine whether this is behavior or a skill deficit, cite the evidence, explain the impact on writing, and provide intervention.",
    logic:
      "The behavior reflects an unmet skill need and likely serves an avoidance function.",
    powerWords: [
      "Function of Behavior",
      "Escape/Avoidance",
      "Replacement Behavior",
      "FBA",
      "BIP",
    ],
    sentenceStarter:
      "The primary barrier is __________, as shown by __________, and this behavior affects the student's ability to __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "State whether the issue is behavior, skill deficit, or both.",
      "Use the refusal and pencil-throwing as evidence.",
      "Explain the impact on writing participation.",
      "Describe an intervention plan.",
    ],
    idealAnswer:
      "The behavior is likely an escape function, indicating avoidance of a difficult academic task rather than intentional misconduct. The underlying barrier is a skill deficit in writing. I would conduct an FBA and implement a BIP that includes teaching a replacement behavior (e.g., requesting help). SDI would include scaffolded writing supports and reduced task demands.",
    acceptableBarrierTerms: [
      "escape function",
      "skill deficit",
      "writing skill deficit",
      "avoidance",
      "escape behavior",
    ],
    evidenceTerms: [
      "refuses to write",
      "throws pencil",
      "frustrated",
    ],
    sdiTerms: [
      "fba",
      "functional behavior assessment",
      "bip",
      "behavior intervention plan",
      "replacement behavior",
      "scaffolded writing supports",
      "reduced task demands",
    ],
  },
  {
    id: "prompt-5",
    domain: "Mixed",
    title: "Math Word Problems",
    promptText:
      "Student E solves equations correctly but fails word problems.",
    scenario:
      "Student E solves equations correctly but fails word problems.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on solving word problems, and provide SDI.",
    logic:
      "The barrier is language comprehension and problem translation rather than mathematical computation.",
    powerWords: [
      "Academic Language",
      "Translation Skills",
      "Schema-Based Instruction",
      "Visual Models",
    ],
    sentenceStarter:
      "The primary barrier is __________, as shown by __________, and this affects the student's ability to __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the language-related barrier.",
      "Use the equation versus word-problem contrast as evidence.",
      "Explain the impact on problem interpretation.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The primary barrier is difficulty with academic language and problem translation, not mathematical computation. This prevents the student from interpreting word problems accurately. I would use schema-based instruction and visual models to represent problems. Pre-teaching key vocabulary and providing guided practice would support comprehension.",
    acceptableBarrierTerms: [
      "academic language",
      "language comprehension",
      "problem translation",
      "translation skills",
    ],
    evidenceTerms: [
      "solves equations correctly",
      "fails word problems",
    ],
    sdiTerms: [
      "schema-based instruction",
      "schema based instruction",
      "visual models",
      "pre-teaching",
      "pre teaching",
      "guided practice",
      "key vocabulary",
    ],
  },
  {
    id: "prompt-6",
    domain: "Mixed",
    title: "Phonological Awareness",
    promptText:
      "Student G cannot blend sounds in early reading.",
    scenario:
      'Student G (1st grade) cannot blend sounds (e.g., /c/ /a/ /t/ -> "cat").',
    task:
      "Identify the cognitive barrier, cite the evidence, explain the impact on reading development, and provide two SDI strategies.",
    logic:
      "A phonological awareness deficit limits the student's ability to decode words accurately.",
    powerWords: [
      "Phonological Awareness",
      "Blending",
      "Segmenting",
      "Explicit Instruction",
      "Multisensory",
    ],
    sentenceStarter:
      "The primary cognitive barrier is a deficit in __________, which limits the student's ability to __________ and affects reading development because __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Name the cognitive barrier.",
      "Use the sound-blending example as evidence.",
      "Explain the impact on decoding.",
      "Describe two SDI strategies.",
    ],
    idealAnswer:
      "The primary barrier is a deficit in phonological awareness, specifically blending sounds, which limits early reading development. This impacts the student’s ability to decode words accurately. I would implement explicit, systematic phonics instruction and multisensory activities (e.g., tapping sounds). Frequent guided practice would reinforce skill acquisition.",
    acceptableBarrierTerms: [
      "phonological awareness",
      "blending",
      "phonics deficit",
    ],
    evidenceTerms: [
      "1st grade",
      "/c/ /a/ /t/",
      "cat",
      "cannot blend sounds",
    ],
    sdiTerms: [
      "explicit instruction",
      "systematic phonics instruction",
      "phonics instruction",
      "multisensory",
      "tapping sounds",
      "guided practice",
    ],
  },
  {
    id: "prompt-7",
    domain: "Mixed",
    title: "Dyslexia Pattern",
    promptText:
      "Student H reads slowly, guesses words, and avoids reading aloud.",
    scenario:
      "Student H (3rd grade) reads slowly, guesses words, avoids reading aloud.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on reading performance, and provide SDI.",
    logic:
      "The reading pattern suggests a decoding deficit that disrupts accurate word recognition and fluency.",
    powerWords: [
      "Decoding Deficit",
      "Orthographic Mapping",
      "Structured Literacy",
      "Repeated Reading",
    ],
    sentenceStarter:
      "The student demonstrates characteristics consistent with deficits in __________, as evidenced by __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the reading barrier.",
      "Use slow reading and word guessing as evidence.",
      "Explain the impact on fluency and accuracy.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student demonstrates characteristics of a decoding deficit consistent with dyslexia, as evidenced by slow reading and word guessing. This limits accurate word recognition and fluency. I would implement structured literacy instruction focusing on phonics and orthographic mapping. Repeated reading would build fluency.",
    acceptableBarrierTerms: [
      "decoding deficit",
      "dyslexia",
      "orthographic mapping",
      "word recognition deficit",
    ],
    evidenceTerms: [
      "3rd grade",
      "reads slowly",
      "guesses words",
      "avoids reading aloud",
    ],
    sdiTerms: [
      "structured literacy",
      "phonics",
      "orthographic mapping",
      "repeated reading",
    ],
  },
  {
    id: "prompt-8",
    domain: "Mixed",
    title: "Writing Output",
    promptText:
      "Student I explains ideas verbally but writes only one to two sentences.",
    scenario:
      "Student I can explain ideas verbally but writes only 1-2 sentences.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on demonstrating knowledge, and provide SDI.",
    logic:
      "The discrepancy between verbal expression and written output suggests a written-expression or transcription barrier.",
    powerWords: [
      "Written Expression",
      "Dysgraphia",
      "Transcription Skills",
      "Speech-to-Text",
      "Graphic Organizer",
    ],
    sentenceStarter:
      "The discrepancy between verbal expression and written output suggests a deficit in __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the writing barrier.",
      "Use the verbal-versus-written discrepancy as evidence.",
      "Explain the impact on showing understanding.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The discrepancy between verbal and written expression suggests a deficit in written expression, likely involving transcription skills. This limits the student’s ability to demonstrate knowledge. I would implement speech-to-text technology and graphic organizers to support idea generation. Direct instruction in writing structure would also be provided.",
    acceptableBarrierTerms: [
      "written expression",
      "transcription skills",
      "dysgraphia",
      "writing output",
    ],
    evidenceTerms: [
      "explain ideas verbally",
      "writes only 1-2 sentences",
      "writes only 1–2 sentences",
    ],
    sdiTerms: [
      "speech-to-text",
      "speech to text",
      "graphic organizer",
      "graphic organizers",
      "direct instruction",
      "writing structure",
    ],
  },
  {
    id: "prompt-9",
    domain: "Mixed",
    title: "Attention",
    promptText:
      'Student J "zones out" during reading and misses key details.',
    scenario:
      'Student J "zones out" during reading and misses key details.',
    task:
      "Identify the barrier, cite the evidence, explain the impact on comprehension, and provide SDI.",
    logic:
      "A sustained-attention barrier limits the student's ability to stay engaged long enough to process text meaningfully.",
    powerWords: [
      "Sustained Attention",
      "Active Engagement",
      "Chunking",
      "Guided Reading",
      "Self-Monitoring",
    ],
    sentenceStarter:
      "The student's difficulty appears related to __________, which affects their ability to sustain attention to __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the attention barrier.",
      "Use the zoning-out detail as evidence.",
      "Explain the impact on reading comprehension.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student’s difficulty is related to sustained attention, impacting their ability to remain engaged during reading tasks. This results in missed information and reduced comprehension. I would use chunked instruction and active engagement strategies (e.g., guided questioning). A self-monitoring system would support focus.",
    acceptableBarrierTerms: [
      "sustained attention",
      "attention",
      "focus",
    ],
    evidenceTerms: [
      "zones out",
      "during reading",
      "misses key details",
    ],
    sdiTerms: [
      "chunked instruction",
      "chunking",
      "active engagement",
      "guided questioning",
      "self-monitoring",
      "self monitoring system",
    ],
  },
  {
    id: "prompt-10",
    domain: "Mixed",
    title: "Math Fluency",
    promptText:
      "Student K counts on fingers for basic addition.",
    scenario:
      "Student K counts on fingers for basic addition.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on problem-solving, and provide SDI.",
    logic:
      "Limited automaticity in math facts increases cognitive load during calculation and problem-solving.",
    powerWords: [
      "Automaticity",
      "Math Fact Fluency",
      "Retrieval Practice",
      "Repetition",
      "CBM",
    ],
    sentenceStarter:
      "The student demonstrates a lack of automaticity in __________, which increases cognitive load during __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the math fluency barrier.",
      "Use finger counting as evidence.",
      "Explain the impact on higher-level math.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student lacks automaticity in math facts, increasing cognitive load during problem-solving. This slows performance and limits higher-level thinking. I would implement repeated retrieval practice and timed fluency drills. Progress would be monitored using CBM.",
    acceptableBarrierTerms: [
      "automaticity",
      "math fact fluency",
      "math fluency",
    ],
    evidenceTerms: [
      "counts on fingers",
      "basic addition",
    ],
    sdiTerms: [
      "retrieval practice",
      "repeated retrieval practice",
      "timed fluency drills",
      "fluency drills",
      "cbm",
    ],
  },
  {
    id: "prompt-11",
    domain: "Mixed",
    title: "Social Skills",
    promptText:
      "Student L interrupts peers and misreads facial expressions.",
    scenario:
      "Student L interrupts peers and misreads facial expressions.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on peer interaction, and provide SDI.",
    logic:
      "Difficulty with social cues and pragmatic language disrupts appropriate peer interactions.",
    powerWords: [
      "Social Cues",
      "Pragmatic Language",
      "Social Skills Instruction",
      "Modeling",
      "Role Play",
    ],
    sentenceStarter:
      "The student exhibits difficulty with __________, impacting peer interactions by __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the social communication barrier.",
      "Use interrupting and misreading cues as evidence.",
      "Explain the impact on peers.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student exhibits difficulty with social cues and pragmatic language, impacting peer interactions. This leads to inappropriate social responses. I would provide explicit social skills instruction, including modeling and role-play. Structured feedback would reinforce appropriate behaviors.",
    acceptableBarrierTerms: [
      "social cues",
      "pragmatic language",
      "social skills",
    ],
    evidenceTerms: [
      "interrupts peers",
      "misreads facial expressions",
    ],
    sdiTerms: [
      "social skills instruction",
      "explicit social skills instruction",
      "modeling",
      "role-play",
      "role play",
      "structured feedback",
    ],
  },
  {
    id: "prompt-12",
    domain: "Mixed",
    title: "Emotional Regulation",
    promptText:
      "Student M shuts down when work is difficult.",
    scenario:
      "Student M shuts down when work is difficult.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on task engagement, and provide SDI.",
    logic:
      "Difficulty with emotional regulation leads to shutdown and avoidance when academic demands increase.",
    powerWords: [
      "Emotional Regulation",
      "Frustration Tolerance",
      "Coping Strategy",
      "Self-Regulation",
      "Prompt Fading",
    ],
    sentenceStarter:
      "The student demonstrates challenges in __________ when faced with __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the regulation barrier.",
      "Use the shutdown behavior as evidence.",
      "Explain the impact on completing work.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student demonstrates difficulty with emotional regulation when faced with challenging tasks. This results in avoidance behaviors. I would teach coping strategies (e.g., break requests) and use prompt fading to build independence. Consistent reinforcement would support skill development.",
    acceptableBarrierTerms: [
      "emotional regulation",
      "self-regulation",
      "frustration tolerance",
    ],
    evidenceTerms: [
      "shuts down",
      "work is difficult",
    ],
    sdiTerms: [
      "coping strategies",
      "break requests",
      "prompt fading",
      "consistent reinforcement",
    ],
  },
  {
    id: "prompt-13",
    domain: "Mixed",
    title: "Processing Speed",
    promptText:
      "Student N understands content but works very slowly.",
    scenario:
      "Student N understands content but works very slowly.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on task completion, and provide SDI plus an accommodation.",
    logic:
      "Reduced processing speed limits timely task completion even when understanding is intact.",
    powerWords: [
      "Processing Speed",
      "Extended Time",
      "Reduced Task Demand",
      "Output Limitation",
    ],
    sentenceStarter:
      "The primary barrier is reduced __________, which limits the student's ability to __________ within time constraints.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the processing speed barrier.",
      "Use the slow work rate as evidence.",
      "Explain the impact on output.",
      "Include SDI and an accommodation.",
    ],
    idealAnswer:
      "The primary barrier is reduced processing speed, limiting task completion within time constraints. This affects output rather than understanding. I would provide extended time and reduce task demands. Instruction would include strategies for efficient task completion.",
    acceptableBarrierTerms: [
      "processing speed",
      "slow processing",
      "output limitation",
    ],
    evidenceTerms: [
      "understands content",
      "works very slowly",
      "time constraints",
    ],
    sdiTerms: [
      "extended time",
      "reduce task demands",
      "reduced task demands",
      "strategies for efficient task completion",
    ],
  },
  {
    id: "prompt-14",
    domain: "Mixed",
    title: "Auditory Processing",
    promptText:
      "Student O struggles to follow multi-step verbal directions.",
    scenario:
      "Student O struggles to follow multi-step verbal directions.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on completing tasks, and provide SDI.",
    logic:
      "Auditory processing and working-memory demands interfere with following multistep verbal information.",
    powerWords: [
      "Auditory Processing",
      "Working Memory",
      "Visual Supports",
      "Repetition",
      "Chunking",
    ],
    sentenceStarter:
      "The student's difficulty following directions suggests a deficit in __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the auditory or memory barrier.",
      "Use the multi-step direction difficulty as evidence.",
      "Explain the impact on task completion.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student demonstrates deficits in auditory processing and working memory, affecting their ability to follow directions. This results in incomplete tasks. I would provide visual supports and chunked instructions. Repetition and clarification would reinforce understanding.",
    acceptableBarrierTerms: [
      "auditory processing",
      "working memory",
      "following directions",
    ],
    evidenceTerms: [
      "struggles to follow",
      "multi-step verbal directions",
      "multi step verbal directions",
    ],
    sdiTerms: [
      "visual supports",
      "chunked instructions",
      "chunking",
      "repetition",
      "clarification",
    ],
  },
  {
    id: "prompt-15",
    domain: "Mixed",
    title: "Reading Comprehension",
    promptText:
      "Student P reads fluently but cannot summarize.",
    scenario:
      "Student P reads fluently but cannot summarize.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on comprehension, and provide SDI.",
    logic:
      "Fluent reading with weak summarization points to a comprehension deficit rather than a decoding deficit.",
    powerWords: [
      "Inferencing",
      "Main Idea",
      "Comprehension Monitoring",
      "Graphic Organizer",
    ],
    sentenceStarter:
      "The student's fluency suggests intact decoding; however, deficits in __________ impact comprehension.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the comprehension barrier.",
      "Use fluent reading and weak summarization as evidence.",
      "Explain the impact on understanding text.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student has intact decoding but deficits in comprehension, particularly inferencing and summarization. This limits understanding of text. I would provide explicit comprehension instruction and use graphic organizers. Guided practice would support skill development.",
    acceptableBarrierTerms: [
      "comprehension",
      "inferencing",
      "summarization",
      "reading comprehension",
    ],
    evidenceTerms: [
      "reads fluently",
      "cannot summarize",
    ],
    sdiTerms: [
      "explicit comprehension instruction",
      "comprehension instruction",
      "graphic organizer",
      "graphic organizers",
      "guided practice",
    ],
  },
  {
    id: "prompt-16",
    domain: "Mixed",
    title: "Escape Behavior",
    promptText:
      "Student Q leaves their seat when writing tasks begin.",
    scenario:
      "Student Q leaves seat when writing tasks begin.",
    task:
      "Identify the function, cite the evidence, explain the impact on writing engagement, and provide intervention.",
    logic:
      "Leaving the seat when writing begins suggests an escape-maintained response to a difficult skill demand.",
    powerWords: [
      "Escape Behavior",
      "Task Avoidance",
      "Replacement Behavior",
      "FBA",
      "BIP",
    ],
    sentenceStarter:
      "The behavior likely serves an __________ function, as the student avoids __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the behavioral function.",
      "Use the seat-leaving pattern as evidence.",
      "Explain the impact on writing participation.",
      "Describe intervention supports.",
    ],
    idealAnswer:
      "The behavior serves an escape function, as the student avoids writing tasks. The underlying issue is a skill deficit. I would implement a BIP and teach a replacement behavior. Writing tasks would be scaffolded to increase success.",
    acceptableBarrierTerms: [
      "escape function",
      "task avoidance",
      "skill deficit",
      "escape behavior",
    ],
    evidenceTerms: [
      "leaves seat",
      "writing tasks begin",
    ],
    sdiTerms: [
      "bip",
      "behavior intervention plan",
      "replacement behavior",
      "scaffolded writing tasks",
      "scaffolded writing",
    ],
  },
  {
    id: "prompt-17",
    domain: "Mixed",
    title: "Vocabulary",
    promptText:
      "Student R struggles with grade-level science vocabulary.",
    scenario:
      "Student R struggles with grade-level science vocabulary.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on content understanding, and provide SDI.",
    logic:
      "Limited academic vocabulary reduces access to grade-level science concepts and directions.",
    powerWords: [
      "Academic Vocabulary",
      "Tier 2/3 Words",
      "Pre-teaching",
      "Explicit Instruction",
    ],
    sentenceStarter:
      "The student's difficulty is rooted in limited __________, which impacts understanding of __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the vocabulary barrier.",
      "Use the science vocabulary difficulty as evidence.",
      "Explain the impact on comprehension.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student has limited academic vocabulary, impacting comprehension of content. This reduces access to grade-level material. I would implement explicit vocabulary instruction and pre-teaching strategies. Visual supports would reinforce meaning.",
    acceptableBarrierTerms: [
      "academic vocabulary",
      "vocabulary deficit",
      "tier 2/3 words",
    ],
    evidenceTerms: [
      "grade-level science vocabulary",
      "science vocabulary",
      "struggles",
    ],
    sdiTerms: [
      "explicit vocabulary instruction",
      "vocabulary instruction",
      "pre-teaching",
      "pre teaching",
      "visual supports",
    ],
  },
  {
    id: "prompt-18",
    domain: "Mixed",
    title: "Generalization",
    promptText:
      "Student S learns a skill in the resource room but not in general education.",
    scenario:
      "Student S learns skill in resource room but not gen ed.",
    task:
      "Identify the issue, cite the evidence, explain the impact on using learned skills, and provide SDI.",
    logic:
      "The core issue is difficulty generalizing learned skills across settings.",
    powerWords: [
      "Generalization",
      "Transfer of Skills",
      "Multiple Context Practice",
      "Scaffolding",
    ],
    sentenceStarter:
      "The student demonstrates difficulty with __________ across settings.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the generalization issue.",
      "Use the resource-room versus gen-ed difference as evidence.",
      "Explain the impact on independent performance.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student demonstrates difficulty with generalization of skills across settings. This limits application of learned skills. I would provide practice in multiple contexts and consistent prompts. Gradual fading would support independence.",
    acceptableBarrierTerms: [
      "generalization",
      "transfer of skills",
      "across settings",
    ],
    evidenceTerms: [
      "resource room",
      "gen ed",
      "learns skill",
      "not gen ed",
    ],
    sdiTerms: [
      "multiple contexts",
      "multiple context practice",
      "consistent prompts",
      "gradual fading",
      "scaffolding",
    ],
  },
  {
    id: "prompt-19",
    domain: "Mixed",
    title: "Fine Motor",
    promptText:
      "Student T writes slowly with poor legibility.",
    scenario:
      "Student T writes slowly with poor legibility.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on written output, and provide SDI.",
    logic:
      "Fine-motor deficits interfere with the speed and legibility needed for written output.",
    powerWords: [
      "Fine Motor",
      "Handwriting",
      "Occupational Support",
      "Alternative Output",
    ],
    sentenceStarter:
      "The student's writing difficulties are associated with deficits in __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the fine-motor barrier.",
      "Use slow writing and poor legibility as evidence.",
      "Explain the impact on output.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student’s writing difficulty is due to fine-motor deficits, affecting legibility and speed. This limits written output. I would provide alternative output methods (e.g., typing) and coordinate with OT. Structured handwriting practice would also be included.",
    acceptableBarrierTerms: [
      "fine-motor deficits",
      "fine motor deficits",
      "handwriting",
      "written output",
    ],
    evidenceTerms: [
      "writes slowly",
      "poor legibility",
    ],
    sdiTerms: [
      "alternative output methods",
      "typing",
      "ot",
      "occupational therapy",
      "structured handwriting practice",
    ],
  },
  {
    id: "prompt-20",
    domain: "Mixed",
    title: "Working Memory",
    promptText:
      "Student U forgets steps in math problems.",
    scenario:
      "Student U forgets steps in math problems.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on multi-step tasks, and provide SDI.",
    logic:
      "Working-memory limitations disrupt the student's ability to retain and complete multi-step processes.",
    powerWords: [
      "Working Memory",
      "Step Sequencing",
      "Visual Supports",
      "Checklists",
    ],
    sentenceStarter:
      "The student demonstrates limitations in __________, affecting their ability to __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the memory barrier.",
      "Use forgetting steps as evidence.",
      "Explain the impact on math completion.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student demonstrates deficits in working memory, impacting their ability to follow multi-step tasks. This leads to incomplete work. I would use visual checklists and break tasks into steps. Repetition would support retention.",
    acceptableBarrierTerms: [
      "working memory",
      "step sequencing",
      "memory deficit",
    ],
    evidenceTerms: [
      "forgets steps",
      "math problems",
      "multi-step tasks",
      "multi step tasks",
    ],
    sdiTerms: [
      "visual checklists",
      "checklists",
      "break tasks into steps",
      "repetition",
      "visual supports",
    ],
  },
  {
    id: "prompt-21",
    domain: "Mixed",
    title: "Task Initiation",
    promptText:
      "Student V waits for help before starting any task.",
    scenario:
      "Student V waits for help before starting any task.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on independent work, and provide SDI.",
    logic:
      "Difficulty initiating tasks prevents independent work even when expectations are understood.",
    powerWords: [
      "Task Initiation",
      "Executive Function",
      "Prompting Hierarchy",
      "Gradual Release",
    ],
    sentenceStarter:
      "The student exhibits difficulty with __________, impacting independent task completion.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the task initiation barrier.",
      "Use waiting for help as evidence.",
      "Explain the impact on independence.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student has difficulty with task initiation, affecting independent work. This requires constant prompting. I would implement a prompting hierarchy and visual schedules. Gradual release would build independence.",
    acceptableBarrierTerms: [
      "task initiation",
      "executive function",
      "independent task completion",
    ],
    evidenceTerms: [
      "waits for help",
      "before starting any task",
    ],
    sdiTerms: [
      "prompting hierarchy",
      "visual schedules",
      "visual schedule",
      "gradual release",
    ],
  },
  {
    id: "prompt-22",
    domain: "Mixed",
    title: "Reading Accuracy",
    promptText:
      "Student W reads quickly but makes frequent errors.",
    scenario:
      "Student W reads quickly but makes frequent errors.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on comprehension, and provide SDI.",
    logic:
      "Reading speed without accuracy undermines comprehension and text monitoring.",
    powerWords: [
      "Reading Accuracy",
      "Error Correction",
      "Guided Oral Reading",
      "Feedback",
    ],
    sentenceStarter:
      "The student prioritizes speed over accuracy, indicating a deficit in __________.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the reading accuracy barrier.",
      "Use fast reading with frequent errors as evidence.",
      "Explain the impact on comprehension.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student demonstrates deficits in reading accuracy, prioritizing speed over correctness. This impacts comprehension. I would provide guided oral reading with feedback. Error correction strategies would be taught.",
    acceptableBarrierTerms: [
      "reading accuracy",
      "accuracy",
      "error correction",
    ],
    evidenceTerms: [
      "reads quickly",
      "frequent errors",
      "speed over accuracy",
    ],
    sdiTerms: [
      "guided oral reading",
      "feedback",
      "error correction strategies",
      "error correction",
    ],
  },
  {
    id: "prompt-23",
    domain: "Mixed",
    title: "Organization",
    promptText:
      "Student X loses assignments and materials.",
    scenario:
      "Student X loses assignments and materials.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on task completion, and provide SDI.",
    logic:
      "Disorganization interferes with task completion because materials and assignments are not consistently managed.",
    powerWords: [
      "Organization",
      "Executive Function",
      "Systems",
      "Visual Schedule",
    ],
    sentenceStarter:
      "The student demonstrates deficits in __________, affecting task completion.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the organization barrier.",
      "Use lost assignments and materials as evidence.",
      "Explain the impact on work completion.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student demonstrates deficits in organization, affecting task completion. This results in lost materials. I would implement structured systems (folders, checklists). Visual supports would reinforce routines.",
    acceptableBarrierTerms: [
      "organization",
      "executive function",
      "organizational deficits",
    ],
    evidenceTerms: [
      "loses assignments",
      "loses materials",
      "lost materials",
    ],
    sdiTerms: [
      "structured systems",
      "folders",
      "checklists",
      "visual supports",
      "routines",
    ],
  },
  {
    id: "prompt-24",
    domain: "Mixed",
    title: "Multi-Syllabic Words",
    promptText:
      "Student Y struggles with long words in reading.",
    scenario:
      "Student Y struggles with long words in reading.",
    task:
      "Identify the barrier, cite the evidence, explain the impact on reading fluency, and provide SDI.",
    logic:
      "Difficulty decoding multi-syllabic words disrupts fluent and accurate reading.",
    powerWords: [
      "Syllabication",
      "Morphology",
      "Decoding Strategies",
      "Word Analysis",
    ],
    sentenceStarter:
      "The student has difficulty with __________, which disrupts reading fluency.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the decoding barrier.",
      "Use the long-word difficulty as evidence.",
      "Explain the impact on reading fluency.",
      "Describe SDI supports.",
    ],
    idealAnswer:
      "The student struggles with multi-syllabic decoding, disrupting fluency. This limits reading comprehension. I would provide instruction in syllabication and morphology. Guided practice would reinforce skills.",
    acceptableBarrierTerms: [
      "multi-syllabic decoding",
      "multi syllabic decoding",
      "syllabication",
      "morphology",
    ],
    evidenceTerms: [
      "struggles with long words",
      "long words in reading",
    ],
    sdiTerms: [
      "syllabication",
      "morphology",
      "guided practice",
      "word analysis",
      "decoding strategies",
    ],
  },
  {
    id: "prompt-25",
    domain: "Mixed",
    title: "Independence Fade",
    promptText:
      "Student Z relies heavily on para support.",
    scenario:
      "Student Z relies heavily on para support.",
    task:
      "Identify the issue, cite the evidence, explain the impact on independence, and provide a fade-plan strategy.",
    logic:
      "Heavy adult prompting limits independence and reduces generalization of learned skills.",
    powerWords: [
      "Prompt Fading",
      "Independence",
      "Gradual Release",
      "Data Tracking",
    ],
    sentenceStarter:
      "The student currently depends on adult support for __________, limiting independence.",
    requiredElements: ["barrier", "evidence", "impact", "sdi"],
    checklistItems: [
      "Identify the dependence issue.",
      "Use the para-support detail as evidence.",
      "Explain the impact on independence.",
      "Describe the fade plan strategy.",
    ],
    idealAnswer:
      "The student relies heavily on adult support, limiting independence. This prevents skill generalization. I would implement a prompt fading plan with data tracking. Gradual release would increase independence.",
    acceptableBarrierTerms: [
      "adult dependence",
      "independence",
      "prompt dependence",
      "prompt fading",
    ],
    evidenceTerms: [
      "relies heavily",
      "para support",
      "adult support",
    ],
    sdiTerms: [
      "prompt fading",
      "fade plan",
      "data tracking",
      "gradual release",
    ],
  },
];

export function getPromptHeading(prompt: WritingPromptRecord): string {
  return prompt.title?.trim() || `Prompt ${prompt.id}`;
}

export function getPromptSupports(
  prompt: WritingPromptRecord,
): WritingPromptSupport[] {
  if (Array.isArray(prompt.supports) && prompt.supports.length) {
    return prompt.supports;
  }

  const supports: WritingPromptSupport[] = [];

  if (Array.isArray(prompt.checklistItems)) {
    for (const [index, item] of prompt.checklistItems.entries()) {
      supports.push({
        id: `required-${index + 1}`,
        label: `Required ${index + 1}`,
        content: item,
      });
    }
  }

  return supports;
}

export function getPromptDomainLabel(domain: string): string {
  return domain?.trim() || "Mixed";
}

export function getWritingPromptById(id: string): WritingPromptRecord | null {
  return writingPrompts.find((prompt) => prompt.id === id) ?? null;
}

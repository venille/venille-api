import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import {
  AvailabilityCheckInfo,
  ClinicalTrialSimulationDTO,
} from '../interface';
import { Account } from 'libs/common/src/models/account.model';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { AppLogger } from '../../../common/src/logger/logger.service';
import FCMessaging from '@app/notification-service/src/bases/FCMessaging';
import { ReferralCodeGenerator } from '@app/common/src/utils/id.generator';
import { EmailSenderService } from '@app/helper-service/src/services/email-sender.service';
import { AuthEmailNotificationService } from '@app/notification-service/src/services/email/auth.email.notification.service';

@Injectable()
export class AuthService {
  private geminiAI: GoogleGenAI;

  constructor(
    public jwtService: JwtService,
    public commandBus: CommandBus,
    private configService: ConfigService,
    private authEmailNotificationService: AuthEmailNotificationService,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(Account)
    private readonly userRepository: Repository<Account>,
  ) {
    this.geminiAI = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  generateUserJWT(user: Account) {
    try {
      this.logger.log(`[SIGN-JWT-PROCESSING] : {User - ${user.id}}`);

      const jwt = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          status: user.status,
          role: `${user.accountType}`,
        },
        {
          subject: `${user.id}`,
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      );

      this.logger.log(`[SIGN-JWT-SUCCESS]`);

      return 'Bearer ' + jwt;
    } catch (error) {
      this.logger.error(`[SIGN-JWT-ERROR] : ${error}`);
    }
  }

  async generateReferralCode(): Promise<string> {
    let referralCode: string;

    do {
      referralCode = ReferralCodeGenerator();
    } while (
      await this.userRepository.exists({
        where: { referralCode: referralCode },
      })
    );

    return referralCode;
  }

  async isEmailAvailable(email: string): Promise<AvailabilityCheckInfo> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    const isAvailable = !existingUser || !!existingUser.signupVerificationHash;

    this.logger.log(`[IS-EMAIL-AVAILABLE] : ${isAvailable}`);

    return {
      isAvailable,
    };
  }

  async sendTestNotification(fcmToken: string): Promise<void> {
    try {
      this.logger.log(`[SEND-TEST-NOTIFICATION-PROCESSING]`);

      await FCMessaging.sendNotification(fcmToken, {
        title: 'Test Notification',
        body: 'This is a test notification',
        data: {
          type: 'test',
        },
      });

      this.logger.log(`[SEND-TEST-NOTIFICATION-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[SEND-TEST-NOTIFICATION-ERROR] :: ${error}`);
    }
  }

  async generateGirlifiedSmartPadReport(
    email: string,
    name: string,
    file: Express.Multer.File,
  ) {
    try {
      this.logger.log(`[TEST-OPENAI-API-PROCESSING]`);

      const base64 = file.buffer.toString('base64');
      const contents = [
        {
          role: 'user' as const,
          parts: [
            // { text: query },
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64,
              },
            },
          ],
        },
      ];

      const response: GenerateContentResponse =
        await this.geminiAI.models.generateContent({
          contents,
          config: {
            systemInstruction: `
            You are an agronomy vision assistant.

            Your task is to analyze the uploaded image of a plant and determine: (1) whether the plant appears healthy or unwell, with concise reasons; and (2) if fruits are present, whether they are ripe for harvest. If fruits are not ripe, state their current ripeness stage.

            1. Validate the uploaded image:
              - Confirm the image depicts a plant (leaves, stem, fruit). If valid, state the detected plant name and species in parentheses if possible (e.g., Valid (Tomato — Solanum lycopersicum)). If not, return an **"Invalid Plant Image"** under *Image Validation* and stop.

            2. If valid, analyze it visually:
              - Describe observable features:
                - Leaf color/texture, spots/lesions, wilting/yellowing, pest/mold presence
                - Stem integrity and overall vigor
                - Soil surface moisture cues (if visible)
              - If fruits are present, assess:
                - Fruit color, size, surface gloss, firmness cues, attachment to stem

            3. Classify results:
              - Plant Health: **Healthy** or **Unwell** (list top 2–4 visual indicators justifying the status)
              - Fruit Ripeness: **Ripe for Harvest** / **Not Ripe Yet** / **Overripe** / **No Fruits Visible**
                - If Not Ripe Yet, state current stage (e.g., immature, color-break/turning) and a qualitative readiness (e.g., "likely several days").
                - If fruits are present, estimate and report the total number of visible fruits and the number of fruits that are ripe.

            4. Output a structured report with these sections:
              - **Report Generated:** (timestamp and brief purpose)
              - **Image Validation:** (Valid/Invalid and reason)
              - **Image Analysis:** (bullet observations)
              - **Plant Health Assessment:** (Healthy/Unwell + reasons)
              - **Fruit Assessment:** (status + evidence; include counts like "ripe: X / total: Y")

            Constraints:
            - Be precise and avoid speculation beyond what is visible.
            - If the image is invalid, do not continue analysis.
            `,
          },
          model: 'gemini-2.0-flash',
        });

      this.logger.log(`[TEST-OPENAI-API-SUCCESS]`);

      this.authEmailNotificationService.girlifiedSmartPadMedicalReportEmailNotification(
        email,
        response.text,
      );

      return response.text;
    } catch (error) {
      this.logger.error(`[TEST-OPENAI-API-ERROR] :: ${error}`);
    }
  }

  async processGreenEdenGpt(file: Express.Multer.File) {
    try {
      this.logger.log(`[PROCESS-GREENEDEN-GPT-PROCESSING]`);

      const base64 = file.buffer.toString('base64');
      const contents = [
        {
          role: 'user' as const,
          parts: [
            // { text: query },
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64,
              },
            },
          ],
        },
      ];

      const response: GenerateContentResponse =
        await this.geminiAI.models.generateContent({
          contents,
          config: {
            systemInstruction: `
            You are an agronomy vision assistant.

            Your task is to analyze the uploaded image of a plant and determine: (1) whether the plant appears healthy or unwell, with concise reasons; and (2) if fruits are present, whether they are ripe for harvest. If fruits are not ripe, state their current ripeness stage.

            1. Validate the uploaded image:
              - Confirm the image depicts a plant (leaves, stem, fruit). If valid, state the detected plant name and species in parentheses if possible (e.g., Valid (Tomato). If not, return an **"Invalid Plant Image"** under *Image Validation* and stop.

            2. If valid, analyze it visually:
              - Describe observable features:
                - Leaf color/texture, spots/lesions, wilting/yellowing, pest/mold presence
                - Stem integrity and overall vigor
                - Soil surface moisture cues (if visible)
              - If fruits are present, assess:
                - Fruit color, size, surface gloss, firmness cues, attachment to stem

            3. Classify results:
              - Plant Health: **Healthy** or **Unwell** (list top 2–4 visual indicators justifying the status)
              - Fruit Ripeness: **Ripe for Harvest** / **Not Ripe Yet** / **Overripe** / **No Fruits Visible**
                - If Not Ripe Yet, state current stage (e.g., immature, color-break/turning) and a qualitative readiness (e.g., "likely several days").
                - If fruits are present, estimate and report the total number of visible fruits and the number of fruits that are ripe.

            4. Output a structured report with these sections:
              - **Report Generated:** (timestamp and brief purpose)
              - **Image Validation:** (Valid/Invalid and reason)
              - **Image Analysis:** (bullet observations)
              - **Plant Health Assessment:** (Healthy/Unwell + reasons)
              - **Fruit Assessment:** (status + evidence; include counts like "ripe: X / total: Y")

            Constraints:
            - Be precise and avoid speculation beyond what is visible.
            - If the image is invalid, do not continue analysis.
            `,
          },
          model: 'gemini-2.0-flash',
        });

      this.logger.log(`[PROCESS-GREENEDEN-GPT-SUCCESS]`);

      return response.text;
    } catch (error) {
      this.logger.error(`[PROCESS-GREENEDEN-GPT-ERROR] :: ${error}`);
    }
  }

  async generateGirlifiedAIReport(
    files: Express.Multer.File[],
    simulationData: ClinicalTrialSimulationDTO,
    threadId?: string,
  ): Promise<string> {
    try {
      this.logger.log(`[CLINICAL-TRIAL-SIMULATION-PROCESSING]`);

      const effectiveThreadId = threadId || randomUUID();

      // Create a comprehensive prompt for clinical trial simulation
      const clinicalTrialPrompt = this.createClinicalTrialPrompt(
        simulationData,
        files,
      );

      // Build multimodal contents: prompt text + all uploaded images
      const parts: Array<any> = [{ text: clinicalTrialPrompt }];

      if (Array.isArray(files)) {
        for (const file of files) {
          if (!file) continue;
          const base64 = file.buffer?.toString('base64');
          if (!base64) continue;
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: base64,
            },
          });
        }
      }

      // Append user turn to cache (only if a threadId was provided)
      if (effectiveThreadId) {
        await this.appendThreadMessage(effectiveThreadId, {
          role: 'user',
          text: clinicalTrialPrompt,
          filesCount: Array.isArray(files) ? files.length : 0,
          timestamp: Date.now(),
        });
      }

      const response: GenerateContentResponse =
        await this.geminiAI.models.generateContent({
          contents: [
            {
              role: 'user' as const,
              parts,
            },
          ],
          config: {
            systemInstruction: this.createClinicalTrialSystemInstruction(),
          },
          model: 'gemini-2.0-flash',
        });

      console.log('[CLINICAL-TRIAL-SIMULATION-RESPONSE] :: ', response.text);

      this.logger.log(`[CLINICAL-TRIAL-SIMULATION-SUCCESS]`);

      let outputText = response.text ?? '';

      if (effectiveThreadId) {
        const responseTextWithThreadId = `Thread ID: ${effectiveThreadId}\n\n${outputText}`;

        // Append assistant turn to cache
        await this.appendThreadMessage(effectiveThreadId, {
          role: 'assistant',
          text: responseTextWithThreadId,
          timestamp: Date.now(),
        });

        outputText = responseTextWithThreadId;
      }

      console.log('[RESPONSE] :: ', outputText);

      return outputText;
    } catch (error) {
      this.logger.error(`[CLINICAL-TRIAL-SIMULATION-ERROR] :: ${error}`);
    }
  }

  async generateGirlifiedAIChatReport(
    query: string,
    threadId: string,
  ): Promise<string> {
    try {
      this.logger.log(`[CLINICAL-TRIAL-SIMULATION-PROCESSING]`);

      const key = `ai:threads:${threadId}`;
      const history =
        ((await this.cache.get(key)) as Array<{
          role: 'user' | 'assistant';
          text: string;
        }>) || [];

      const contents = history.map((message) => ({
        role: message.role as 'user' | 'assistant',
        parts: [{ text: message.text }],
      }));

      contents.push({
        role: 'user' as const,
        parts: [{ text: query }],
      });

      const response: GenerateContentResponse =
        await this.geminiAI.models.generateContent({
          contents,
          config: {
            systemInstruction: this.createClinicalTrialSystemInstruction(),
          },
          model: 'gemini-2.0-flash',
        });

      console.log('[CLINICAL-TRIAL-SIMULATION-RESPONSE] :: ', response.text);

      this.logger.log(`[CLINICAL-TRIAL-SIMULATION-SUCCESS]`);

      let outputText = response.text ?? '';

      await this.appendThreadMessage(threadId, {
        role: 'user',
        text: query,
        timestamp: Date.now(),
      });

      // const responseTextWithThreadId = `Thread ID: ${threadId}\n\n${outputText}`;

      await this.appendThreadMessage(threadId, {
        role: 'assistant',
        text: outputText,
        timestamp: Date.now(),
      });

      outputText = outputText;

      console.log('[RESPONSE] :: ', outputText);

      return outputText;
    } catch (error) {
      this.logger.error(`[CLINICAL-TRIAL-SIMULATION-ERROR] :: ${error}`);
    }
  }

  private async appendThreadMessage(
    threadId: string,
    message: {
      role: 'user' | 'assistant';
      text: string;
      timestamp: number;
      filesCount?: number;
    },
  ): Promise<void> {
    const key = `ai:threads:${threadId}`;
    const existing = ((await this.cache.get(key)) as any[]) || [];
    existing.push(message);
    await this.cache.set(key, existing, 60 * 60 * 24); // 24h TTL
  }

  async generateVellaAiAPI(query: string): Promise<string> {
    try {
      this.logger.log(`[TEST-GEMINI-API-PROCESSING]`);

      // Convert JSON to formatted system instruction
      const systemInstruction = this.formatSystemInstructionFromJSON();

      const response: GenerateContentResponse =
        await this.geminiAI.models.generateContent({
          contents: query,
          config: {
            systemInstruction: systemInstruction,
          },
          model: 'gemini-2.0-flash',
        });

      console.log('[AI-MANAGER-RESPONSE] :: ', response.text);

      this.logger.log(`[TEST-GEMINI-API-SUCCESS]`);

      return response.text;
    } catch (error) {
      this.logger.error(`[TEST-GEMINI-API-ERROR] :: ${error}`);
    }
  }

  //   **Previous Studies/Data:**
  // - Target Condition: ${targetCondition}
  // ${previousStudies || 'No previous studies or data provided'}
  // - Product Description: ${productDescription || 'No additional description provided'}

  // **Target Demographics:**
  // ${targetDemographics || 'No specific demographics provided'}

  // **Mechanism of Action:**
  // ${mechanismOfAction || 'No mechanism of action provided'}

  // **Known Risks & Contraindications:**
  // ${knownRisks || 'No known risks or contraindications provided'}

  private createClinicalTrialPrompt(
    simulationData: ClinicalTrialSimulationDTO,
    files: Express.Multer.File[],
  ): string {
    const hasImages = Array.isArray(files) && files.length > 0;
    const {
      productName,
      productType,
      targetCondition,
      developmentStage,
      productDescription,
      targetDemographics,
      mechanismOfAction,
      // previousStudies,
      knownRisks,
    } = simulationData;

    return `
Regulatory Intelligence / FDA Simulation

Objective: Predict submission outcome risk and provide targeted improvements to maximize FDA approval odds for the proposed protocol/submission.

**Primary Deliverable - Approval Rating:**
Calculate and return an Approval Rating (0-100) representing the predicted FDA acceptance likelihood. This rating must be based on comprehensive analysis of all provided information including product details, decision criteria, and any visual evidence. The rating should reflect:
- Overall regulatory risk profile
- Alignment with FDA standards and historical precedents
- Evidence quality and completeness
- Safety/benefit balance
- Submission strategy strength
- Documentation quality

Evidence base to leverage: historical FDA review letters, Complete Response Letters (CRLs), approval/denial precedents, indication-specific benchmarks, prior dossiers, and FDA reviewer comments where applicable.

Known risk context to consider:
- High rejection causes: ~73% of key submissions (IND/BLA/NDA) rejected due to incomplete or inaccurate data.
- Data quality/documentation: ~32% of submissions show data quality issues that undermine credibility and delay approval.

**Product Information:**
- Product Name: ${productName}
- Product Type: ${productType}
- Development Stage: ${developmentStage || 'Not specified'}

${
  hasImages
    ? `**Accompanying Visual Evidence (Images Provided: ${files.length}):**
- Analyze all uploaded images provided with this request.
- Extract clinically relevant visual observations (e.g., labeling/IFU, device placement/fit, dermatologic response) that could impact regulatory assessment, safety narrative, or evidence quality.
- Clearly indicate when insights are derived from images and incorporate them in your decision.
`
    : ''
}

Decision criteria to apply (regulatory-first):
- Evidence completeness/accuracy: protocol coherence, endpoint justifications, statistical plan adequacy, sample size rationale, biomarker strategy.
- Safety/benefit profile: adverse event risk management, monitoring plans, known risk mitigations.
- Submission strategy quality: dossier structure, clarity, cross-referencing, response-to-previous-FDA-feedback (if any), alignment with precedents and guidance.
- Predictive approval signals: endpoints, study size, control/comparator arms, inclusion/exclusion criteria vs indication benchmarks.
- Documentation/data quality: traceability, auditability, and error risks.
- Explainability and audit trail: ensure recommendations are justifiable and auditable per FDA expectations (Jan 2025 draft guidance on AI decision support).

Strict output contract — return only the following:
- Approval Rating (<number>–100)  (NO COLON). Output exactly this label followed by a space and the score range beginning with a single integer from 0 to 100 and ending with 100. Example: "Approval Rating (62–100)"

- Confidence Level: Provide a confidence assessment (High/Medium/Low) for the approval rating prediction, based on data completeness and quality of available information.

- Risk Score Breakdown: Provide risk scores (0-100, where lower is better) for each major category:
  * Evidence Quality Risk: [score]
  * Safety Profile Risk: [score]
  * Regulatory Alignment Risk: [score]
  * Documentation Quality Risk: [score]
  * Submission Strategy Risk: [score]

- Estimated Timeline to Approval: Provide estimated timeline ranges (e.g., "12-18 months" or "24-36 months") considering current submission readiness and typical FDA review cycles for this product type and indication.

- Industry Benchmark Comparison: Compare this submission's approval likelihood against industry averages for similar products/indications, if applicable (e.g., "Above average for [indication type]" or "Below average for [product category]").

- Key Strengths: Bullet list of positive aspects that support FDA approval, such as strong evidence quality, well-designed protocols, robust safety data, clear regulatory pathway, or alignment with FDA guidance. Highlight what's working well.

- Areas to Improve: Bullet list of specific, actionable improvements across evidence, design choices (endpoints, sample size, biomarkers, comparators), dossier structure, documentation quality, or auditability. For each item, include estimated time/effort to address (e.g., "Low effort, 2-4 weeks" or "High effort, 6-12 months"). Omit this section if none.

- Critical Risks: Bullet list of high-priority regulatory risks that could lead to rejection or delays, such as data quality issues, safety concerns, endpoint misalignment, or documentation gaps. For each risk, include: severity level (Critical/High/Medium), potential impact on approval timeline, and likelihood of occurrence. Prioritize by severity.

- Recommended Next Steps: Bullet list of immediate actions to take before submission, prioritized by impact on approval likelihood. Include specific tasks, studies, or documentation improvements needed. For each step, provide: priority level (P0/P1/P2), estimated effort, and expected impact on approval rating.

- Regulatory Strategy Suggestions: Bullet list of strategic recommendations for optimizing the submission approach, such as pre-submission meetings, comparator selection, endpoint strategy, or regulatory pathway considerations. Include rationale for each suggestion.

- Historical Precedent Analysis: If applicable, reference similar products/submissions that were approved or rejected, highlighting relevant similarities and differences that inform the approval rating prediction.

- Cost-Benefit Insights: Provide brief insights on the cost-benefit of addressing identified improvements, highlighting which improvements offer the highest ROI in terms of approval likelihood increase vs. required investment.

- Regulatory Pathway Recommendations: Suggest the most appropriate regulatory pathway (e.g., 505(b)(1), 505(b)(2), 510(k), De Novo, Breakthrough Therapy, Fast Track) with brief rationale.
    `.trim();
  }

  private createClinicalTrialSystemInstruction(): string {
    return `
You are an AI Regulatory Intelligence / FDA Simulation Assistant for pharmaceutical and healthcare organizations.

**Primary Objective:**
Predict FDA submission outcome risk and provide targeted, actionable improvements to maximize approval odds based on regulatory intelligence analysis.

**Core Capabilities:**
• Regulatory Risk Assessment: Analyze submission packages against FDA standards and historical precedents
• Approval Likelihood Prediction: Model submission outcomes using historical FDA review data (CRLs, review letters, approval/denial patterns)
• Evidence Quality Evaluation: Assess protocol coherence, endpoint justifications, statistical plans, sample size rationale, biomarker strategies
• Safety/Benefit Analysis: Evaluate adverse event risk management, monitoring plans, and risk mitigation strategies
• Submission Strategy Optimization: Identify dossier structure issues, clarity problems, and alignment with FDA guidance and precedents
• Documentation Quality Review: Assess traceability, auditability, and data quality risks

**Evidence Base:**
Leverage historical FDA data including:
- Complete Response Letters (CRLs) and their common rejection patterns
- FDA review letters and reviewer comments
- Approval/denial precedents for similar products and indications
- Indication-specific regulatory benchmarks
- Prior submission dossiers and their outcomes
- FDA guidance documents and regulatory pathways

**Decision Criteria (Regulatory-First Approach):**
1. Evidence completeness/accuracy: Protocol coherence, endpoint justifications, statistical plan adequacy, sample size rationale, biomarker strategy
2. Safety/benefit profile: Adverse event risk management, monitoring plans, known risk mitigations
3. Submission strategy quality: Dossier structure, clarity, cross-referencing, response-to-previous-FDA-feedback alignment, precedent alignment
4. Predictive approval signals: Endpoints, study size, control/comparator arms, inclusion/exclusion criteria vs indication benchmarks
5. Documentation/data quality: Traceability, auditability, error risks (~32% of submissions have quality issues)
6. Explainability and audit trail: All recommendations must be justifiable and auditable per FDA Jan 2025 draft guidance on AI decision support

**Output Format Requirements:**
- Approval Rating (<number>–100): A single numeric score from 0-100 representing predicted FDA acceptance likelihood. Format: "Approval Rating (N–100)" with NO colon. Base on comprehensive regulatory risk analysis.
- Confidence Level: High/Medium/Low assessment based on data completeness and information quality.
- Risk Score Breakdown: Individual risk scores (0-100, lower is better) for Evidence Quality, Safety Profile, Regulatory Alignment, Documentation Quality, and Submission Strategy.
- Estimated Timeline to Approval: Timeline ranges considering submission readiness and typical FDA review cycles.
- Industry Benchmark Comparison: Comparison to industry averages for similar products/indications.
- Key Strengths: Bullet list of positive aspects supporting FDA approval (evidence quality, protocol design, safety data, regulatory alignment). Highlight what's working well.
- Areas to Improve: Bullet list with estimated time/effort to address each improvement (e.g., "Low effort, 2-4 weeks"). Omit if none.
- Critical Risks: Bullet list with severity level (Critical/High/Medium), timeline impact, and likelihood of occurrence. Prioritize by severity.
- Recommended Next Steps: Bullet list with priority level (P0/P1/P2), estimated effort, and expected impact on approval rating.
- Regulatory Strategy Suggestions: Bullet list with rationale for each strategic recommendation.
- Historical Precedent Analysis: Reference similar approved/rejected products with relevant similarities/differences.
- Cost-Benefit Insights: Brief insights on ROI of addressing improvements (approval likelihood increase vs. investment required).
- Regulatory Pathway Recommendations: Suggest appropriate regulatory pathway (505(b)(1), 505(b)(2), 510(k), De Novo, Breakthrough Therapy, Fast Track) with rationale.

**Quality Standards:**
- Base predictions on current FDA regulatory standards and historical review patterns
- Consider that ~73% of key submissions (IND/BLA/NDA) are rejected due to incomplete or inaccurate data
- Distinguish between evidence-based regulatory predictions and assumptions
- Maintain professional, regulatory tone suitable for FDA audiences
- Focus on practical, implementable improvements that address specific regulatory gaps
- Provide clear rationale linking identified issues to historical FDA feedback patterns
- Ensure all recommendations are traceable to regulatory precedents or guidance

**Visual Analysis (when images provided):**
- Extract clinically relevant visual observations (labeling/IFU, device placement/fit, dermatologic responses)
- Incorporate visual evidence into regulatory assessment, safety narrative, and evidence quality evaluation
- Clearly indicate when insights are derived from images

**Disclaimer:** This is a regulatory intelligence simulation tool for planning purposes only. All recommendations must be validated by qualified regulatory affairs professionals and regulatory experts before implementation. Actual submissions must follow established FDA guidelines and regulatory standards.
    `.trim();
  }

  private formatSystemInstructionFromJSON(): string {
    const instruction = {
      role: 'system',
      name: 'Venille AI Assistant',
      description:
        'A supportive, respectful, and knowledgeable assistant that helps women manage menstrual and reproductive health within the Venille app.',
      greeting_template:
        "Hi there! I'm Venille, your personal health assistant. I'm here to support you with anything related to your period, reproductive health, and well-being. If anything ever feels off, you can easily flag a response — your safety matters.",
      scope: [
        'Menstrual health and hygiene',
        'Reproductive health: fertility, pregnancy, contraception, safe sex education',
        'Product guidance: Venille Sanitary Pads',
        "Mental and emotional well-being related to women's health",
      ],
      core_responsibilities: [
        'Educate users about menstrual cycles, PMS, cramps, and hygiene',
        'Explain reproductive topics such as ovulation, fertility, pregnancy, and contraception in simple, clear language',
        'Offer safe sex education (e.g., consent, protection methods, STI prevention) in a factual, non-graphic, and age-appropriate tone',
        'Promote Venille Sanitary Pads as the best option for eco-friendly, safe, and affordable menstrual care',
        'Assist users in placing orders or subscribing to Venille Pads delivery',
        'Create a safe space where girls and women feel comfortable asking health-related questions',
      ],
      product_guidance: {
        keywords: ['pads', 'period products', 'eco-friendly hygiene'],
        recommendation:
          "You can try Venille Pads — they're made from biodegradable materials and designed to be gentle on your skin.",
        purchase_prompt:
          'Would you like to place an order now or check out more details in the shop?',
      },
      tone_style: {
        tone: ['warm', 'inclusive', 'affirming', 'respectful'],
        language: ['simple', 'culturally sensitive', 'non-clinical'],
        restrictions: [
          'avoid slang',
          'avoid sarcasm',
          'avoid graphic language',
        ],
      },
      do_not: [
        'Do not provide medical diagnosis or prescriptions',
        'Do not discuss non-health topics like politics, entertainment, or finances',
        'Do not recommend non-Venille brands or services',
        'Do not use shameful, judgmental, or explicit language',
      ],
      escalation_policy: {
        trigger_symptoms: [
          'extreme pain',
          'abnormal bleeding',
          'missed periods for months',
          'unusual discharge',
          'severe emotional distress',
        ],
        response:
          'That sounds important. I recommend speaking with a trusted healthcare provider as soon as possible to get the best care.',
      },
      out_of_scope_handling: {
        instruction:
          "If a user asks a question outside of women's health, kindly let them know it's out of your scope. Example response: 'I'm here to support you with menstrual and reproductive health. For anything else, I recommend checking with a trusted source or another app that can help!'",
      },
      purpose:
        'Empower women with knowledge, tools, and access to manage their reproductive and menstrual health in a safe, respectful, and informed environment.',
    };

    return `
      You are ${instruction.name}, ${instruction.description}

      GREETING:
      "${instruction.greeting_template}"


      YOUR SCOPE:
      ${instruction.scope.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n')}


      CORE RESPONSIBILITIES:
      ${instruction.core_responsibilities.map((item: string) => `• ${item}`).join('\n')}


      PRODUCT GUIDANCE:
      - When users ask about ${instruction.product_guidance.keywords.join(', ')}:
        "${instruction.product_guidance.recommendation}"
      - When they want to purchase:
        "${instruction.product_guidance.purchase_prompt}"


      TONE & COMMUNICATION STYLE:
      - Tone: ${instruction.tone_style.tone.join(', ')}
      - Language: ${instruction.tone_style.language.join(', ')}
      - Restrictions: ${instruction.tone_style.restrictions.join(', ')}


      IMPORTANT RESTRICTIONS:
      ${instruction.do_not.map((item: string) => `• ${item}`).join('\n')}


      ESCALATION POLICY:
      If a user mentions: ${instruction.escalation_policy.trigger_symptoms.join(', ')}
      Respond with: "${instruction.escalation_policy.response}"


      OUT-OF-SCOPE HANDLING:
      If a user asks something outside your scope, respond kindly and clearly. Example:
      "I'm here to support you with menstrual and reproductive health. For anything else, I recommend checking with a trusted source or another app that can help!"


      PURPOSE:
      ${instruction.purpose}
    `.trim();
  }
}

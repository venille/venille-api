import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
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
    simulationData: ClinicalTrialSimulationDTO,
  ): Promise<string> {
    try {
      this.logger.log(`[CLINICAL-TRIAL-SIMULATION-PROCESSING]`);

      // Create a comprehensive prompt for clinical trial simulation
      const clinicalTrialPrompt =
        this.createClinicalTrialPrompt(simulationData);

      const response: GenerateContentResponse =
        await this.geminiAI.models.generateContent({
          contents: clinicalTrialPrompt,
          config: {
            systemInstruction: this.createClinicalTrialSystemInstruction(),
          },
          model: 'gemini-2.0-flash',
        });

      console.log('[CLINICAL-TRIAL-SIMULATION-RESPONSE] :: ', response.text);

      this.logger.log(`[CLINICAL-TRIAL-SIMULATION-SUCCESS]`);

      return response.text;
    } catch (error) {
      this.logger.error(`[CLINICAL-TRIAL-SIMULATION-ERROR] :: ${error}`);
    }
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

  private createClinicalTrialPrompt(simulationData: any): string {
    const {
      productName,
      productType,
      targetCondition,
      productDescription,
      targetDemographics,
      mechanismOfAction,
      previousStudies,
      knownRisks,
    } = simulationData;

    return `
Please conduct a comprehensive AI Clinical Trial Simulation for the following health product:

**Product Information:**
- Product Name: ${productName}
- Product Type: ${productType}
- Target Condition: ${targetCondition}
- Product Description: ${productDescription || 'No additional description provided'}


**Target Demographics:**
${targetDemographics || 'No specific demographics provided'}


**Mechanism of Action:**
${mechanismOfAction || 'No mechanism of action provided'}


**Previous Studies/Data:**
${previousStudies || 'No previous studies or data provided'}


**Known Risks & Contraindications:**
${knownRisks || 'No known risks or contraindications provided'}


**Simulation Request:**
Please provide a concise clinical trial simulation report that includes:

1. **Executive Summary** 
   - Product overview and potential
   - Key findings and recommendations
   - Risk-benefit summary

2. **Trial Design** 
   - Recommended study design
   - Sample size estimation
   - Primary/secondary endpoints
   - Inclusion/exclusion criteria

3. **Safety Assessment** 
   - Potential adverse events
   - Risk-benefit analysis
   - Monitoring requirements

4. **Efficacy Predictions** 
   - Expected therapeutic effects
   - Statistical considerations
   - Timeline for evaluation

5. **Regulatory & Cost Analysis** 
   - Required approvals
   - Estimated costs and timeline
   - ROI considerations

6. **Risk Mitigation**
   - Key risks and mitigation strategies
   - Contingency planning

**Requirements:**
- Use clear headings and bullet points
- Provide specific examples where relevant
- Use professional medical terminology
- Keep response concise but comprehensive
- Focus on practical, actionable recommendations

Please provide this streamlined analysis suitable for stakeholders and clinical research teams.
    `.trim();
  }

  private createClinicalTrialSystemInstruction(): string {
    return `
You are an AI Clinical Trial Simulation Assistant for pharmaceutical and healthcare organizations.



**Core Capabilities:**
• Trial Design: Study designs, sample sizes, statistical approaches

• Safety Analysis: Risk assessment and adverse event prediction

• Efficacy Modeling: Therapeutic outcomes using scientific literature

• Regulatory Guidance: Compliance pathways and requirements

• Cost Analysis: Trial costs, timelines, and ROI estimates

• Risk Mitigation: Challenge identification and solutions



**Output Requirements:**
Provide concise professional reports with:

- Executive summary (200-300 words)

- Technical analysis with clear explanations

- Actionable recommendations with key details

- Risk assessments with mitigation strategies

- Cost-benefit analysis with projections

- Regulatory pathway guidance

- Literature review and precedents

- Implementation timelines



**Quality Standards:**
- Base on current scientific literature and regulatory standards

- Aim for 1500-2000 words total (concise but comprehensive)

- Include specific examples and case studies

- Use bullet points and numbered lists (no tables)

- Distinguish between evidence-based predictions and assumptions

- Maintain professional, clinical tone for regulatory audiences

- Focus on practical, implementable recommendations

- Provide clear rationale for conclusions

- Include risk-benefit analyses

- Offer alternative approaches and contingency planning



**Disclaimer:** This is a simulation tool for planning purposes only. All recommendations must be validated by qualified clinical research professionals and regulatory experts before implementation. Actual clinical trials must follow established regulatory guidelines and ethical standards.
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

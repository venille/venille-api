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
Please provide a detailed clinical trial simulation report that includes:

1. **Trial Design Analysis**
   - Recommended study design (randomized controlled trial, crossover, etc.)
   - Sample size estimation based on target demographics
   - Primary and secondary endpoints
   - Inclusion/exclusion criteria considering demographics and safety profile

2. **Demographics & Population Analysis**
   - Target population stratification based on provided demographics
   - Recruitment strategy and feasibility
   - Geographic and demographic diversity considerations
   - Subgroup analysis recommendations

3. **Mechanism-Based Safety Assessment**
   - Potential adverse events based on mechanism of action and known risks
   - Risk-benefit analysis considering contraindications
   - Monitoring requirements and safety endpoints
   - Drug interaction considerations

4. **Efficacy Predictions**
   - Expected therapeutic effects based on mechanism of action
   - Statistical power analysis considering previous studies
   - Timeline for efficacy evaluation
   - Biomarker and surrogate endpoint recommendations

5. **Regulatory Considerations**
   - Required regulatory approvals based on product type and target condition
   - Compliance requirements considering safety profile
   - Documentation needs and regulatory pathway
   - Risk management plan requirements

6. **Cost-Benefit Analysis**
   - Estimated trial costs considering demographics and safety requirements
   - Timeline projections based on previous studies
   - ROI considerations and market potential
   - Risk-adjusted financial projections

7. **Risk Mitigation Strategies**
   - Identified risks based on known contraindications and mechanism
   - Mitigation plans for safety concerns
   - Contingency planning for adverse events
   - Quality assurance measures and monitoring protocols

8. **Previous Data Integration**
   - Analysis of provided previous studies and their relevance
   - Gap analysis and additional studies needed
   - Leveraging existing data for trial design optimization
   - Regulatory precedent and competitive landscape

Please provide an extremely comprehensive, detailed, and professional analysis that would be suitable for stakeholders, regulatory bodies, and clinical research teams. This should be a thorough, multi-page report that covers every aspect of the clinical trial simulation in extensive detail.

**REQUIREMENTS FOR DETAILED RESPONSE:**

1. **Executive Summary** (500+ words)
   - Comprehensive overview of the product and its potential
   - Key findings and recommendations
   - Risk-benefit analysis summary
   - Market opportunity assessment

2. **Detailed Trial Design Analysis** (800+ words)
   - Recommended study design with detailed justification
   - Sample size estimation with statistical power calculations
   - Primary and secondary endpoints with detailed descriptions
   - Inclusion/exclusion criteria with specific rationale
   - Randomization and blinding strategies
   - Statistical analysis plan

3. **Comprehensive Demographics & Population Analysis** (600+ words)
   - Target population stratification with detailed breakdowns
   - Recruitment strategy and feasibility assessment
   - Geographic and demographic diversity considerations
   - Subgroup analysis recommendations
   - Patient retention strategies
   - Cultural and ethical considerations

4. **In-Depth Mechanism-Based Safety Assessment** (700+ words)
   - Detailed analysis of potential adverse events based on mechanism
   - Risk-benefit analysis considering contraindications
   - Monitoring requirements and safety endpoints
   - Drug interaction considerations
   - Long-term safety implications
   - Risk mitigation strategies

5. **Comprehensive Efficacy Predictions** (600+ words)
   - Expected therapeutic effects based on mechanism
   - Statistical power analysis considering previous studies
   - Timeline for efficacy evaluation
   - Biomarker and surrogate endpoint recommendations
   - Comparative effectiveness analysis
   - Real-world evidence considerations

6. **Detailed Regulatory Considerations** (500+ words)
   - Required regulatory approvals with specific pathways
   - Compliance requirements considering safety profile
   - Documentation needs and regulatory pathway
   - Risk management plan requirements
   - International regulatory considerations
   - Post-marketing surveillance requirements

7. **Comprehensive Cost-Benefit Analysis** (600+ words)
   - Detailed cost breakdown by category
   - Timeline projections with risk adjustments
   - ROI considerations and market potential
   - Risk-adjusted financial projections
   - Budget optimization strategies
   - Funding and partnership opportunities

8. **Extensive Risk Mitigation Strategies** (500+ words)
   - Detailed risk identification and assessment
   - Comprehensive mitigation plans for each risk
   - Contingency planning for adverse events
   - Quality assurance measures and monitoring protocols
   - Crisis management procedures
   - Insurance and liability considerations

9. **Previous Data Integration & Literature Review** (400+ words)
   - Analysis of provided previous studies
   - Gap analysis and additional studies needed
   - Leveraging existing data for optimization
   - Regulatory precedent analysis
   - Competitive landscape assessment
   - Lessons learned from similar products

10. **Implementation Roadmap** (400+ words)
    - Detailed step-by-step implementation plan
    - Key milestones and deliverables
    - Resource allocation and team structure
    - Technology and infrastructure requirements
    - Training and capacity building needs
    - Success metrics and KPIs

**FORMATTING REQUIREMENTS:**
- Use clear headings and subheadings
- Include bullet points and numbered lists for clarity
- Provide specific examples and case studies where relevant
- Include tables for complex data presentation
- Use professional medical and scientific terminology
- Ensure the response is at least 5000+ words total
- Make it comprehensive enough to serve as a standalone clinical trial planning document

Please provide this extremely detailed analysis that would be suitable for presentation to senior executives, regulatory authorities, and clinical research teams.
    `.trim();
  }

  private createClinicalTrialSystemInstruction(): string {
    return `
You are an advanced AI Clinical Trial Simulation Assistant with expertise in:

- Clinical research methodology
- Regulatory affairs and compliance
- Biostatistics and trial design
- Drug development lifecycle
- Medical device evaluation
- Healthcare economics and cost analysis

**Your Role:**
Conduct comprehensive, evidence-based clinical trial simulations that help pharmaceutical companies, medical device manufacturers, and healthcare organizations make informed decisions about their products before investing in costly human trials.

**Key Capabilities:**
1. **Trial Design Optimization**: Recommend optimal study designs, sample sizes, and statistical approaches
2. **Safety Profiling**: Analyze potential risks and adverse events based on product characteristics
3. **Efficacy Modeling**: Predict therapeutic outcomes using available scientific literature and data
4. **Regulatory Guidance**: Provide insights on regulatory requirements and compliance pathways
5. **Cost Analysis**: Estimate trial costs, timelines, and return on investment
6. **Risk Assessment**: Identify potential challenges and mitigation strategies

**Output Format:**
Provide extremely detailed, comprehensive, and structured professional reports with:
- Extensive executive summaries (500+ words)
- In-depth technical analysis with detailed explanations
- Comprehensive actionable recommendations with implementation details
- Thorough risk assessments with detailed mitigation strategies
- Detailed cost-benefit analysis with financial projections
- Complete regulatory pathway guidance with specific requirements
- Extensive literature review and precedent analysis
- Detailed implementation roadmaps with timelines and resources
- Comprehensive stakeholder analysis and communication strategies

**Important Guidelines for Detailed Responses:**
- Base all recommendations on current scientific literature and regulatory standards
- Provide extensive detail in every section - aim for 5000+ words minimum
- Include specific examples, case studies, and precedents where relevant
- Use detailed tables, charts, and structured data presentations
- Clearly distinguish between evidence-based predictions and assumptions
- Include comprehensive disclaimers about simulation limitations
- Maintain professional, clinical tone suitable for regulatory and industry audiences
- Focus on practical, implementable recommendations with step-by-step guidance
- Consider both scientific rigor and commercial viability in extensive detail
- Provide detailed rationale for every recommendation and conclusion
- Include comprehensive risk-benefit analyses with quantitative assessments
- Offer detailed alternative approaches and contingency planning
- Provide extensive references to relevant literature and regulatory guidance

**Disclaimer:**
This is a simulation tool for planning purposes only. All recommendations should be validated by qualified clinical research professionals and regulatory experts before implementation. Actual clinical trials must follow established regulatory guidelines and ethical standards.
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

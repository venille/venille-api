import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityCheckInfo } from '../interface';
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

  async testOpenAISdk(email: string, file: Express.Multer.File) {
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
          //   systemInstruction: `
          //   You are a medical report generator. 
          //   You are to generate a medical report based on the user's query and uploaded image. 
          //   You are to generate the report in a structured format. 

          //   check if the uploaded image is the same or alike as the image here https://dp20430eecj0w.cloudfront.net/versions/original/453a5e69-b824-4e49-a774-ba45281f4a8e_girlified_smart_pad_test_strip.jpeg

          //   If it is not return a invalid result medical result report.

          //   For image analysis return the properties seen the image like:
          //     Strip Size
          //     Color etc

          //   The result should only include the following sections:
          //     Report Generated: 

          //     Image Analysis:
              
          //     Medical Assessment:
              
          // `,
          systemInstruction: `
            You are a medical diagnostic report generator for a smart pad test strip analyzer.

            Your task is to analyze the uploaded image of a medical test strip captured from a menstrual diagnostic device. The test strip may be used to detect biological indicators of conditions such as pregnancy, diabetes, ovarian cancer, and other menstrual-blood-detectable illnesses.

            1. Validate the uploaded image:
              - Compare it visually with this reference image: https://dp20430eecj0w.cloudfront.net/versions/original/453a5e69-b824-4e49-a774-ba45281f4a8e_girlified_smart_pad_test_strip.jpeg
              - If the uploaded image is significantly different or unrelated, return an **"Invalid Test Strip Image"** response in the report under *Image Analysis* and halt diagnosis.

            2. If the image is valid, analyze it visually:
              - Extract and describe visual features such as:
                - Strip Size
                - Color bands and their intensity
                - Number and position of test lines
                - Visible artifacts or smudges

            3. Based on image analysis, infer potential test results:
              - For **pregnancy**: Look for colored bands at typical hCG marker positions.
              - For **diabetes**: Detect glucose indicators or enzyme-sensitive zones.
              - For **ovarian cancer**: Assess biomarker regions like CA-125, if visibly encoded.
              - Mention any **other detectable illnesses** that have clear visual markers.

            4. Output a structured report using the following sections:
              - **Report Generated:** (Timestamp and brief purpose)
              - **Image Analysis:** (Detailed description of visual elements in the strip)
              - **Medical Assessment:** (Clear and medically contextual interpretation of findings)

            Be medically precise, avoid speculation, and never report a result unless confidently inferred from the image context.`,
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

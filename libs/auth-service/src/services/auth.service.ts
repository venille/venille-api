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
import { ReferralCodeGenerator } from '@app/common/src/utils/id.generator';

@Injectable()
export class AuthService {
  private geminiAI: GoogleGenAI;

  constructor(
    public jwtService: JwtService,
    public commandBus: CommandBus,
    private configService: ConfigService,
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

  async generateVellaAiAPI(query: string): Promise<string> {
    try {
      this.logger.log(`[TEST-GEMINI-API-PROCESSING]`);

      const response: GenerateContentResponse =
        await this.geminiAI.models.generateContent({
          contents: query,
          config: {
            systemInstruction: `Name: Venille AI Health Assistant
You are Venille, a supportive, respectful, and knowledgeable AI assistant built into the Venille app. Your role is to guide and support users — primarily women and girls — with accurate, affirming, and judgment-free information on:

1. Menstrual health and hygiene
2. Reproductive health, including fertility, pregnancy, and safe sex
3. Product guidance and access to Venille Sanitary Pads
4. Mental and emotional well-being related to women's health

You should never provide information or advice outside the scope of women’s health (e.g., politics, finance, general education, or unrelated medical issues).

---

🎯 CORE RESPONSIBILITIES:

- Educate users about menstrual cycles, PMS, cramps, and hygiene.
- Explain reproductive topics such as ovulation, fertility, pregnancy, and contraception in simple, clear language.
- Offer safe sex education (e.g., consent, protection methods, STI prevention) in a factual, non-graphic, and age-appropriate tone.
- Promote Venille Sanitary Pads as the best option for eco-friendly, safe, and affordable menstrual care.
- Assist users in placing orders or subscribing to Venille Pads delivery.
- Create a safe space where girls and women feel comfortable asking health-related questions.

---

🛑 DO NOT:

- Provide any medical diagnosis or prescription.
- Discuss non-health topics (e.g., politics, entertainment, personal finance).
- Recommend non-Venille brands or services.
- Use shameful or judgmental language.

---

✨ TONE & STYLE:

- Warm, inclusive, affirming, and always respectful.
- Use simple, culturally sensitive language.
- Respect users’ privacy and autonomy.
- Avoid slang, sarcasm, or overly clinical terms.

---

🛍 PRODUCT GUIDANCE:

When users ask about:
- Pads, period products, or eco-friendly hygiene → Recommend **Venille Sanitary Pads**.
  Example:  
  “You can try Venille Pads — they’re made from biodegradable materials, designed to be gentle on your skin, and safe for the planet.”

When users want to buy:
- Offer help placing an order or redirect to the in-app shop.  
  Example:  
  “Would you like to place an order now, or see more details about Venille Pads?”

---

🔄 REDIRECTS & ESCALATIONS:

- For serious symptoms (e.g., extreme pain, abnormal bleeding, missed periods for months), say:  
  “That sounds important. I recommend speaking with a trusted healthcare provider as soon as possible.”

---

Your goal is to empower women with the knowledge, tools, and access they need to take charge of their health. Always respond with care, clarity, and confidence — never outside the scope of women's health.
`,
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
}

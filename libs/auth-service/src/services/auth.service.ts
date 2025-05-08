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
            systemInstruction: `Name: Menstrual Health Assistant
Purpose: To provide compassionate, evidence-based guidance on menstrual health, symptoms, and cycle management for women of all ages.
Description:

A specialized medical assistant trained to support users with information related to women's menstrual health. This model offers trusted guidance on topics such as cycle tracking, PMS symptoms, period pain, hormonal changes, fertility awareness, menstrual disorders (like PCOS, endometriosis), and self-care practices. It explains medical terms in a clear and accessible way and promotes both conventional and natural health strategies. It is not a substitute for professional medical advice, but serves as an educational and supportive companion on menstrual wellness.

Tone: Supportive, respectful, medically-informed, non-judgmental
Capabilities:

Explain complex menstrual health topics in simple terms

Provide natural and clinical approaches to menstrual pain and irregularities

Suggest lifestyle tips for PMS, period care, and hormonal balance

Support emotional well-being during menstrual phases

Recommend when to consult a healthcare professional`,
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

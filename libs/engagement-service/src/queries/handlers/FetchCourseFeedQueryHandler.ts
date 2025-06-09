import { Repository, In } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { FetchCourseFeedQuery } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import {
  Course,
  CourseCategoryInfo,
  CourseInfo,
} from '@app/common/src/models/course.model';
import { CourseCategory } from '@app/common/src/constants/enums';
import { FormatCourseInfo } from '@app/common/src/middlewares/models.formatter';
import { shuffle } from 'lodash';

@QueryHandler(FetchCourseFeedQuery)
export class FetchCourseFeedQueryHandler
  implements IQueryHandler<FetchCourseFeedQuery, CourseCategoryInfo[]>
{
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(query: FetchCourseFeedQuery): Promise<CourseCategoryInfo[]> {
    try {
      const { page, pageSize, secureUser } = query;

      const cacheKey = `course_feed_${page}_${pageSize}`;

      const cachedResult =
        await this.cacheManager.get<CourseCategoryInfo[]>(cacheKey);
      if (cachedResult) {
        this.logger.log(
          `[FETCH-COURSE-FEED-QUERY-HANDLER-CACHE-HIT]: ${cacheKey}`,
        );
        return cachedResult.map((category) => ({
          ...category,
          courses: shuffle(category.courses),
        }));
      }

      this.logger.log(
        `[FETCH-COURSE-FEED-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      // Get all available categories sorted alphabetically
      const allCategories = Object.values(CourseCategory);
      // const allCategories = Object.values(CourseCategory).sort();

      // Calculate which categories to fetch based on pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const categoriesToFetch = allCategories.slice(startIndex, endIndex);

      if (categoriesToFetch.length === 0) {
        return [];
      }

      // Fetch all courses from the selected categories
      const courses = await this.courseRepository.find({
        where: {
          category: In(categoriesToFetch),
        },
        order: {
          category: 'ASC',
          position: 'ASC',
          createdAt: 'ASC',
        },
      });

      // Group courses by category
      const groupedCourses = categoriesToFetch.map((category) => {
        const categoryTitle = this.getCategoryTitle(category);
        const categoryCourses = shuffle(
          courses
            .filter((course) => course.category === category)
            .map((course) => FormatCourseInfo(course)),
        );

        return {
          title: categoryTitle,
          courses: categoryCourses,
        } as CourseCategoryInfo;
      });

      const result = groupedCourses;

      const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
      await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);

      this.logger.log(`[FETCH-COURSE-FEED-QUERY-HANDLER-SUCCESS]`);

      return result;
    } catch (error) {
      this.logger.log(`[FETCH-COURSE-FEED-QUERY-HANDLER-ERROR]: ${error}`);
      throw error;
    }
  }

  private getCategoryTitle(category: CourseCategory): string {
    const titleMap: Record<CourseCategory, string> = {
      [CourseCategory.UNDERSTANDING_YOUR_BODY]: 'Understanding Your Body',
      [CourseCategory.SEXUAL_PLEASURE_AND_WELLNESS]:
        'Sexual Pleasure and Wellness',
      [CourseCategory.MENTAL_AND_EMOTIONAL_WELL_BEING]:
        'Mental & Emotional Well Being',
      [CourseCategory.MENOPAUSE_AND_MIDLIFE_HEALTH]:
        'Menopause & Midlife Health',
      [CourseCategory.CONTRACEPTION_AND_FAMILY_PLANNING]:
        'Contraception & Family Planning',
      [CourseCategory.MENSTRUAL_HEALTH_AND_HYGIENE]:
        'Menstrual Health & Hygiene',
      [CourseCategory.SEXUAL_AND_REPRODUCTIVE_RIGHTS]:
        'Sexual & Reproductive Rights',
      [CourseCategory.SEXUALLY_TRANSMITTED_INFECTIONS]:
        'Sexually Transmitted Infections',
      [CourseCategory.FERTILITY_AND_INFERTILITY]: 'Fertility & Infertility',
      [CourseCategory.PREGNANCY_AND_POSTPARTUM_CARE]:
        'Pregnancy & Postpartum Care',
    };

    return titleMap[category] || category;
  }
}

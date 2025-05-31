import { ForumInfo } from '../models/forum.model';
import { Course, CourseInfo } from '../models/course.model';
import { AccountInfo, Account } from '../models/account.model';
import { Forum, ForumComment, ForumCommentInfo } from '../models/forum.model';
import { Notification, NotificationInfo } from '../models/notification.model';

export function FormatAccountInfo(account: Account): AccountInfo {
  delete account.password;
  delete account.newEmail;
  delete account.newPhone;
  delete account.createdAt;
  delete account.updatedAt;
  delete account.activationCode;
  delete account.passwordResetCode;
  delete account.passwordResetToken;
  delete account.temporalAccessToken;
  delete account.activationCodeExpires;
  delete account.signupVerificationHash;
  delete account.signupVerificationHash;
  delete account.passwordResetCodeExpires;

  return {
    ...account,
    id: account.id.toString(),
  } as AccountInfo;
}

export function FormatNotification(
  notification: Notification,
): NotificationInfo {
  delete notification.account;

  return {
    id: notification.id.toString(),
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  } as unknown as NotificationInfo;
}

export function FormatForumInfo(forum: Forum): ForumInfo {
  return {
    id: forum.id.toString(),
    title: forum.title,
    description: forum.description,
    category: forum.category,
    image: forum.image,
    likes: JSON.parse(forum.likes),
    likeCount:
      JSON.parse(forum.likes) && JSON.parse(forum.likes).length > 0
        ? JSON.parse(forum.likes).length
        : 0,
    comments: forum.comments,
    createdAt: forum.createdAt,
    updatedAt: forum.updatedAt,
    authorPhoto: forum.account.profilePhoto,
  } as ForumInfo;
}

export function FormatForumCommentInfo(
  forumComment: ForumComment,
): ForumCommentInfo {
  return {
    id: forumComment.id.toString(),
    content: forumComment.content,
    authorPhoto: forumComment.account.profilePhoto,
    createdAt: forumComment.createdAt,
  } as ForumCommentInfo;
}

export function FormatCourseInfo(course: Course): CourseInfo {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    coverPhoto: course.coverPhoto,
  } as CourseInfo;
}

export default {
  FormatForumInfo,
  FormatAccountInfo,
  FormatNotification,
  FormatForumCommentInfo,
  FormatCourseInfo,
};

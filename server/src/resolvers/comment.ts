import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Comment } from "../entities/Comment";
import isAuth from "../middleware/isAuth";
import logger from '../logger';
import { moderateContent } from './openaiClient';

@Resolver(Comment)
export class CommentResolver {
  @FieldResolver(() => User)
  creator(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(comment.creatorId);
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("text") text: string,
    @Arg("relatedPostId") relatedPostId: number,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
    try {

      const isContentSafe = await moderateContent(text);
    if (!isContentSafe) {
      throw new Error("Comment contains inappropriate content.");
    }

      const comment = await Comment.create({
        text: text,
        relatedPostId: relatedPostId,
        creatorId: req.session.userId,
      }).save();

      logger.info(`Comment created with id: ${comment.id}`);
      return comment;
    } catch (error) {
      logger.error(`Error creating comment: ${error}`);
      throw error;
    }
  }

  @Query(() => [Comment])
  async comments(
    @Arg("relatedPostId") relatedPostId: number
  ): Promise<Comment[]> {
    try {
      const replacements: number[] = [relatedPostId];
      const query = `
          select c.*
          from comment c
          where c."relatedPostId" = $1
          order by c."createdAt" DESC
        `;
      const comments = await getConnection().query(query, replacements);

      logger.info(`Retrieved comments for post id: ${relatedPostId}`);
      return comments;
    } catch (error) {
      logger.error(`Error retrieving comments: ${error}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    try {
      await Comment.delete({ id, creatorId: req.session.userId });
      logger.info(`Comment deleted with id: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting comment: ${error}`);
      return false;
    }
  }
}

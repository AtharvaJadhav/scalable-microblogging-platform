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
    return Comment.create({
      text: text,
      relatedPostId: relatedPostId,
      creatorId: req.session.userId,
    }).save();
  }

  @Query(() => [Comment])
  async comments(
    @Arg("relatedPostId") relatedPostId: number
  ): Promise<Comment[]> {
    const replacements: number[] = [relatedPostId];
    const query = `
        select c.*
        from comment c
        where c."relatedPostId" = $1
        order by c."createdAt" DESC
      `;
    const comments = await getConnection().query(query, replacements);
    return comments;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Comment.delete({ id, creatorId: req.session.userId });
    return true;
  }
}

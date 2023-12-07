import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";
import logger from '../logger';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field(() => String, { nullable: true })
  imgUrl?: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
  @Field()
  offset: number;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    // return User.findOne(post.creatorId);
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    update updoot
    set value = $1
    where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    insert into updoot ("userId", "postId", value)
    values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
    update post
    set points = points + $1
    where id = $2
      `,
          [realValue, postId]
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedPosts)
async posts(
  @Arg("limit", () => Int) limit: number,
  @Arg("sort", () => String) sort: string,
  @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
  @Arg("offset", () => Int, { nullable: true }) offset: number | null,
): Promise<PaginatedPosts> {

  const realLimit = Math.min(50, limit);
  const realLimitPlusOne = realLimit + 1;

  const replacements: any[] = [realLimitPlusOne];

  if (sort === "top") {
    replacements.push(offset);
  } else if (cursor) {
    replacements.push(new Date(parseInt(cursor!)));
  }

  try {
    let query = `
      select p.*
      from post p
    `;
    if (sort === "top") {
      query += `
        order by p.points DESC
        offset $2 rows
        fetch next $1 rows only
      `;
    } else {
      query += `
        ${cursor ? `where p."createdAt" < $2` : ""}
        order by p."createdAt" DESC
        limit $1
      `;
    }
    const posts = await getConnection().query(query, replacements);

    logger.info(`Retrieved posts with sort: ${sort}, limit: ${limit}, cursor: ${cursor}, offset: ${offset}`);
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
      offset: offset || 0,
    };
  } catch (error) {
    logger.error(`Error retrieving posts: ${error}`);
    throw error;
  }
}

  @Query(() => [Post])
async postsFromUser(
  @Arg("userId", () => Int) userId: number
): Promise<Post[]> {
  const replacements: any[] = [userId];

  try {
    const query = `
      select p.*
      from post p
      where p."creatorId" = $1
    `;

    const posts = await getConnection().query(query, replacements);

    logger.info(`Retrieved posts for user id: ${userId}`);
    return posts;
  } catch (error) {
    logger.error(`Error retrieving posts for user id: ${userId}, error: ${error}`);
    throw error;
  }
}

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    try {
      const post = await Post.create({
        ...input,
        creatorId: req.session.userId,
      }).save();

      logger.info(`Post created with id: ${post.id}`);
      return post;
    } catch (error) {
      logger.error(`Error creating post: ${error}`);
      throw error;
    }
  }

  @Mutation(() => Post, { nullable: true })
@UseMiddleware(isAuth)
async updatePost(
  @Arg("id", () => Int) id: number,
  @Arg("title") title: string,
  @Arg("imgUrl", () => String, { nullable: true }) imgUrl: string | null,
  @Arg("text") text: string,
  @Ctx() { req }: MyContext
): Promise<Post | null> {
  let updatedPost: any = { title, text };
  if (imgUrl) {
    updatedPost["imgUrl"] = imgUrl;
  }
  try {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set(updatedPost)
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    logger.info(`Post updated with id: ${id} by user: ${req.session.userId}`);
    return result.raw[0];
  } catch (error) {
    logger.error(`Error updating post with id: ${id}, error: ${error}`);
    throw error;
  }
}

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    try {
      await Post.delete({ id, creatorId: req.session.userId });
      logger.info(`Post deleted with id: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting post: ${error}`);
      return false;
    }
  }
}

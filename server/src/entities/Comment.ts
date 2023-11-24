import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  // ----- OWN PROPERTIES -----
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  text!: string;

  // @Field()
  // @Column({ type: "int", default: 0 })
  // points!: number;

  // @Field(() => Int, { nullable: true })
  // voteStatus: number | null; // 1 or -1 or null

  // @Field()
  // @Column()
  // posterId: number;

  // ---
  // @Field(() => [Post])
  // @ManyToOne(() => Post, (post) => post.comments)
  // post: Post;
  // ---

  // @OneToMany(() => Updoot, (updoot) => updoot.comment)
  // updoots: Updoot[];

  // ----- RELATION TO USER -----
  @Field()
  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: "CASCADE",
  })
  creator: User;

  // ----- RELATION TO POST -----
  @Field()
  @Column()
  relatedPostId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE",
  })
  relatedPost: Post;

  // ----- MISC -----
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

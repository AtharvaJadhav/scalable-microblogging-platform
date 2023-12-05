import { InputType, Field } from "type-graphql";

@InputType()
export class GoogleRegisterInput {
  @Field()
  token: string;

  @Field()
  email: string;

  @Field()
  username: string;
}

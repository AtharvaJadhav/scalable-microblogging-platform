import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../util/validateRegister";
import { sendEmail } from "../util/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import { GoogleRegisterInput } from "./GoogleRegisterInput";
import { verifyGoogleToken } from "../util/verifyGoogleToken";
import logger from '../logger';

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its okay to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // you are not this user
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { id: userIdNum },
      {
        password: hashedPassword,
      }
    );

    await redis.del(key);

    // log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // the email is not in the db
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    await sendEmail(
      email,
      `<p>Please click on this <a href="http://localhost:3000/change-password/${token}">reset password</a> link to reset your password</p>
      <p> -Team Ekko</p>`,
      "Reset your password"
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Query(() => User, { nullable: true })
  userById(@Arg("userId") userId: number) {
    // you are not logged in
    if (!userId) {
      return null;
    }

    return User.findOne(userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      logger.warn(`Registration failed due to validation errors: ${JSON.stringify(errors)}`);
      return { errors };
    }

    const hashedPassword = await bcrypt.hash(options.password, 10);

    let user;
    try {
      // User.create({}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
      logger.info(`New user registered: ${user.username}`);
    } catch (err) {
      //|| err.detail.includes("already exists")) {
      // duplicate username error
      if (err.code === "23505") {
        logger.error(`Registration failed: Username ${options.username} already taken`);
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
      logger.error(`Registration failed: ${err}`);
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;

    await sendEmail(
      options.email,
      `<h1>Welcome To Ekko</h1>
      <p>Thank you for registering with EKKO! Your registration has been successfully completed. We're excited to have you on board!</p>
      <p>-Team Ekko</p>`,
      "Welcome to Ekko"
    );

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail", () => String, { nullable: true }) usernameOrEmail: string | null,
  @Arg("password", () => String, { nullable: true }) password: string | null,
  @Arg("twoFactorToken", () => String, { nullable: true }) twoFactorToken: string | null,
  @Arg("googleToken", () => String, { nullable: true }) googleToken: string | null,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {

    if (googleToken) {
      const googleUser = await verifyGoogleToken(googleToken);
      if (!googleUser) {
        return {
          errors: [{ field: "googleToken", message: "Invalid Google token" }],
        };
      }

      const user = await User.findOne({ where: { email: googleUser.email } });
    if (!user) {
      return {
        errors: [{ field: "email", message: "User not found" }],
      };
    }

    // Check if the user is a Google user
    if (!user.isGoogleUser) {
      return {
        errors: [{ field: "googleToken", message: "Please login with username and password" }],
      };
    }

    req.session.userId = user.id;
    logger.info(`User logged in with Google: ${user.email}`);
    return { user };
  }

  if (usernameOrEmail && password) {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist",
          },
        ],
      };
    }

    if (user.isGoogleUser) {
      return {
        errors: [{ field: "usernameOrEmail", message: "Please login with Google" }],
      };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    // 2FA verification
    if (user.isTwoFactorEnabled) {
      // If 2FA is enabled, require the twoFactorToken
      if (!twoFactorToken) {
        return {
          errors: [
            {
              field: "twoFactorToken",
              message: "Two-factor authentication token is required",
            },
          ],
        };
      }

      if (!user.twoFactorAuthSecret) {
        return {
          errors: [
            {
              field: "twoFactorToken",
              message: "Two-factor authentication not properly set up",
            },
          ],
        };
      }

      const isTokenValid = speakeasy.totp.verify({
        secret: user.twoFactorAuthSecret,
        encoding: "base32",
        token: twoFactorToken,
      });

      if (!isTokenValid) {
        return {
          errors: [
            {
              field: "twoFactorToken",
              message: "Invalid two-factor token",
            },
          ],
        };
      }
    } else if (user.twoFactorAuthSecret && twoFactorToken) {
      const isTokenValid = speakeasy.totp.verify({
        secret: user.twoFactorAuthSecret,
        encoding: "base32",
        token: twoFactorToken,
      });

      if (!isTokenValid) {
        return {
          errors: [
            {
              field: "twoFactorToken",
              message: "Invalid two-factor token",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    logger.info(`User logged in: ${user.username}`);
    return {
      user,
    };
  }

  logger.warn("Invalid login request");
    return {
      errors: [
        {
          field: "general",
          message: "Invalid login request",
        },
      ],
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          logger.error(`Logout error: ${err}`);
          resolve(false);
          return;
        }

        logger.info('User logged out successfully');
        resolve(true);
      })
    );
  }

  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find();
  }

  @Mutation(() => String)
  async setupTwoFactorAuth(@Ctx() { req }: MyContext): Promise<string> {
    const user = await User.findOne(req.session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const secret = speakeasy.generateSecret();
    if (!secret.otpauth_url) {
      throw new Error("Failed to generate 2FA secret");
    }

    user.twoFactorAuthSecret = secret.base32;
    console.log(user.isTwoFactorEnabled)
    console.log("In Setup 2 Factor Auth")
    user.isTwoFactorEnabled = true;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return qrCodeUrl;
  }

  @Mutation(() => Boolean)
  async verifyTwoFactorToken(
    @Arg("token") token: string,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne(req.session.userId);
    if (!user || !user.twoFactorAuthSecret) {
      return false;
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuthSecret,
      encoding: "base32",
      token,
    });

    return verified;
  }

  @Mutation(() => UserResponse)
  async registerWithGoogle(
    @Arg("options") options: GoogleRegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const googleUser = await verifyGoogleToken(options.token);
    if (!googleUser) {
      logger.warn("Invalid Google token provided for registration");
      return {
        errors: [{ field: "token", message: "Invalid Google token" }],
      };
    }

    const user = await User.findOne({ where: { email: options.email } });
    if (user) {
      logger.warn(`Registration attempt with existing email: ${options.email}`);
      // User already exists, return an error
      return {
        errors: [
          {
            field: "email",
            message: "A user with that email already exists",
          },
        ],
      };
    }

    // Hash the Google UID as the password
    const hashedPassword = await bcrypt.hash(googleUser.uid, 10);
    const newUser = User.create({
      username: options.username,
      email: options.email,
      password: hashedPassword,
      isGoogleUser: true,
    });
    await newUser.save();

    // Set user session
    req.session.userId = newUser.id;

    logger.info(`New Google user registered: ${newUser.username}`);
    return { user: newUser };
  }
}

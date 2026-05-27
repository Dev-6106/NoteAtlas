import { generateToken } from "@/app/helpers/jwt";
import { User } from "@/app/models/user.models";
import { GoogleUserType } from "@/types/user.types";

export class UserRepository {
  private static instance: UserRepository;

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async createUser(
    userProps: GoogleUserType,
    token: { accessToken: string; refreshToken: string }
  ) {
    const profile = userProps?._json ?? userProps ?? {};
    const { sub: id, name, picture, email } = profile as {
      sub?: string;
      name?: string;
      picture?: string;
      email?: string;
    };

    let user = await User.findOne({ email });

    if (!user) {
      // New user — create
      user = await new User({
        name,
        email,
        image: picture,
        googleAccessToken: token?.accessToken,
        googleRefreshToken: token?.refreshToken,
        googleId: id,
      }).save();
    } else {
      // Existing user — update Google tokens on each login
      user.googleAccessToken = token?.accessToken;
      if (token?.refreshToken) {
        user.googleRefreshToken = token.refreshToken;
      }
      await user.save();
    }

    const { accessToken, refreshToken } = await generateToken(user._id);

    return {
      authData: {
        ...user.toObject(),
        token: { accessToken, refreshToken },
      },
    };
  }
}

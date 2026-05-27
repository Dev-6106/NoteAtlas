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
    let updatedUser;

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
      updatedUser = user.toObject();
    } else {
      // Existing user — update Google tokens on each login
      user = await User.findByIdAndUpdate(user._id,
        {
          googleAccessToken: token?.accessToken,
          googleRefreshToken: token?.refreshToken,
        }, { new: true, runValidators: true }
      );
      updatedUser = user?.toObject();
    }

    const { accessToken, refreshToken } = await generateToken(user._id);

    return {
      authData: {
        ...updatedUser,
        token: { accessToken, refreshToken },
      },
    };
  }
}

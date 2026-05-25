import { generateToken } from "@/app/helpers/jwt";
import { User } from "@/app/models/user.models";
import { GoogleUserType } from "@/types/user.types";

export class UserRepository {
  private static instance: UserRepository;

  //singleton design pattern
  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async createUser(
    userProps: GoogleUserType,
    token: { accessToken: string; refreshToken: string },
  ) {
    const profile = userProps?._json ?? userProps ?? {};
    const { sub: id, name, picture, email } = profile as {
      sub?: string;
      name?: string;
      picture?: string;
      email?: string;
    };

    const userExist = await User.findOne({ email: email });
    if (!userExist) {
      const user = new User({
        name: name,
        email: email,
        image: picture,
        googleAccessToken: token?.accessToken,
        googleRefreshToken: token?.refreshToken,
        googleId: id,
      });

      const newUser = await user.save();
      const {accessToken, refreshToken} = await generateToken(newUser?._id);

      return {
        authData: {
          ...newUser.toObject(),
          token: { accessToken, refreshToken },
        },
      };
    } else {
      const {accessToken, refreshToken} = await generateToken(userExist?._id);

      return {
        authData: {
          ...userExist.toObject(),
          token: { accessToken, refreshToken },
        },
      };
    }
  }
}

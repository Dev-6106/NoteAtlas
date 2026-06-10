import { User } from "@/app/models/user.models";

export class UserRepository {
  private static instance: UserRepository;

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async syncUser(firebaseUser: { uid: string; email?: string; name?: string; picture?: string }) {
    const { uid, email, name, picture } = firebaseUser;

    if (!email) {
      throw new Error("User email is required");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await new User({
        name,
        email,
        image: picture,
        firebaseUid: uid,
      }).save();
    } else {
      user = await User.findByIdAndUpdate(
        user._id,
        {
          firebaseUid: uid,
          image: picture, // Optionally update picture
        },
        { new: true, runValidators: true }
      );
    }

    return {
      authData: user?.toObject(),
    };
  }
}

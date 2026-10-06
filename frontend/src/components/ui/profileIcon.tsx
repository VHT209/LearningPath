import { CircleUserRound } from "lucide-react";
import { ComponentProps } from "react";

type UserProfileProps = ComponentProps<typeof CircleUserRound>;

const UserProfile = (props: UserProfileProps) => {
  return <CircleUserRound {...props} />;
};

export default UserProfile;
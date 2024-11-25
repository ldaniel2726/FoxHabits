import { getUser } from '@/actions/profileActions';
import ProfileEditSheet from './profile-edit-sheet';
import { UserData } from '@/types/UserData';

export default async function ProfileEditSheetServer() {
  const { data, error } = await getUser();

  const userData: UserData = {
    user: {
      user_metadata: {
        name: data.user?.user_metadata?.name || '',
      },
      email: data.user?.email || '',
    },
  };
  
  return <ProfileEditSheet userData={userData} />;
}

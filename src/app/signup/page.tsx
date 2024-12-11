import { SignUpForm } from '@/components/signup-form';
import { toast } from 'sonner';

export default function SignupPage() {

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <SignUpForm />
    </div>
  )
}
  
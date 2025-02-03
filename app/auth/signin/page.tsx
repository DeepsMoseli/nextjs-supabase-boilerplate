import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/misc/AuthForm';

export default async function SignIn() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-200 to-gray-100 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" />
      <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />

      {/* Centered Content */}
      <div className="relative z-10 w-full max-w-md p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-700">SHARD CM</h1>
        <p className="mt-1 mb-6 text-gray-400">
          The simple, elegant CM solution
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}

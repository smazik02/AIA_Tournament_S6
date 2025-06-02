import SignUpForm from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign up',
};

function SignUp() {
    return <SignUpForm />;
}

export default SignUp;

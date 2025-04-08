'use client';

import { Button, Container, Stack } from '@mui/material';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { data: session } = authClient.useSession();

    const router = useRouter();

    return (
        <Container sx={{ display: 'flex', padding: 2 }}>
            <Stack>
                <Button variant="contained">Hello world</Button>
                {session && (
                    <Button
                        variant="contained"
                        onClick={async () =>
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push('/auth/sign-in');
                                    },
                                },
                            })
                        }
                    >
                        Logout
                    </Button>
                )}
                {!session && (
                    <Button variant="contained" onClick={() => router.push('/auth/sign-up')}>
                        Log in/Sign up
                    </Button>
                )}
            </Stack>
        </Container>
    );
}

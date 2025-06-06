'use client';

import { useRouter } from 'next/navigation';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';

function CreateTournamentButton() {
    const router = useRouter();

    return (
        <Fab
            variant="extended"
            size="medium"
            color="primary"
            sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
            }}
            onClick={() => router.push('/tournament/new')}
        >
            <Add sx={{ mr: 1 }} />
            CREATE
        </Fab>
    );
}

export default CreateTournamentButton;

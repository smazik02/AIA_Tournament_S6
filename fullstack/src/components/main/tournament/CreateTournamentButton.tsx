'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';

function CreateTournamentButton() {
    const router = useRouter();

    return (
        <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/tournament/new')}>
            CREATE
        </Button>
    );
}

export default CreateTournamentButton;

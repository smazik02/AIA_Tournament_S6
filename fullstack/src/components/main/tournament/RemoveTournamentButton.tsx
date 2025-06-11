'use client';

import { deleteTournamentSponsorAction } from '@/server-actions/sponsors';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

interface RemoveTournamentButtonProps {
    tournamentId: string;
    sponsorId: string;
}

function RemoveTournamentButton({ tournamentId, sponsorId }: RemoveTournamentButtonProps) {
    return (
        <IconButton color="secondary" onClick={() => deleteTournamentSponsorAction(tournamentId, sponsorId)}>
            <DeleteIcon />
        </IconButton>
    );
}

export default RemoveTournamentButton;

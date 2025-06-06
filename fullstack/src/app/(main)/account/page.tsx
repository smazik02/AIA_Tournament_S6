import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, Container, List, ListItem, Paper, Typography } from '@mui/material';
import { getAllPlayerMatches, MatchWithTournament } from '@/data-access/matches';
import { Metadata } from 'next';

function getOpponentDisplay(match: MatchWithTournament, currentUserId: string): string {
    const opponentIsPlayer1 = match.player2Id === currentUserId;
    const opponentIsPlayer2 = match.player1Id === currentUserId;

    if (opponentIsPlayer2) {
        if (match.player1) {
            return match.player1.name;
        }
        if (match.player1Description) {
            return match.player1Description;
        }
        return 'Awaiting opponent';
    } else if (opponentIsPlayer1) {
        if (match.player2) {
            return match.player2.name;
        }
        if (match.player2Description) {
            return match.player2Description;
        }
        return 'Awaiting opponent';
    }
    if (match.player1Id === null && match.player1Description) return match.player1Description;
    if (match.player2Id === null && match.player2Description) return match.player2Description;

    return 'Opponent not yet determined';
}

export const metadata: Metadata = {
    title: 'Account Information',
};

async function AccountPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect('/auth/sign-in');
    }

    const allMatches = await getAllPlayerMatches();
    const upcomingMatches = allMatches
        .filter((match) => new Date(match.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', padding: 2, gap: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Account Information
            </Typography>
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
                <Typography variant="h6">Name: {session.user.name}</Typography>
                <Typography variant="body1">Email: {session.user.email}</Typography>
            </Paper>

            <Typography variant="h4" component="h2" sx={{ marginBottom: 2 }}>
                Upcoming Matches
            </Typography>
            {upcomingMatches.length > 0 ? (
                <List sx={{ width: '100%' }}>
                    {upcomingMatches.map((match) => (
                        <ListItem key={match.id} disablePadding sx={{ marginBottom: 2 }}>
                            <Card sx={{ width: '100%' }} variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        Tournament: {match.tournament.name}
                                    </Typography>
                                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                        Discipline: {match.tournament.discipline}
                                    </Typography>
                                    <Typography variant="body2">
                                        Date: {new Date(match.date).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">Location: {match.tournament.location}</Typography>
                                    <Typography variant="body2">
                                        Opponent: {getOpponentDisplay(match, session.user.id)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography>No upcoming matches.</Typography>
            )}
        </Container>
    );
}

export default AccountPage;

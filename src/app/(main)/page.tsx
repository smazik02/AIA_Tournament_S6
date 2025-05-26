import { getAllTournamentsPaged, getTournamentsCount } from '@/data-access/tournaments';
import { Box, Card, CardActionArea, CardContent, Container, Grid, Typography } from '@mui/material';
import CreateTournamentButton from '@/components/main/CreateTournamentButton';
import TournamentPagination from '@/components/main/TournamentPagination';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

interface HomePageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function Home({ searchParams }: HomePageProps) {
    const { takeQuery = ITEMS_PER_PAGE, skipQuery = 0 } = await searchParams;

    const take = isNaN(+takeQuery) || +takeQuery <= 0 ? ITEMS_PER_PAGE : +takeQuery;
    const skip = isNaN(+skipQuery) || +skipQuery < 0 ? 0 : +skipQuery;

    const tournaments = await getAllTournamentsPaged({ skip, take });
    const totalTournaments = await getTournamentsCount();

    const totalPages = Math.ceil(totalTournaments / take);
    const currentPage = Math.floor(skip / take) + 1;

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', padding: 2, gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                <CreateTournamentButton />
                {totalTournaments > 0 && totalPages > 1 && (
                    <TournamentPagination count={totalPages} page={currentPage} take={take} />
                )}
            </Box>

            {tournaments.length === 0 ? (
                <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>
                    No tournaments found.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {tournaments.map((tournament) => (
                        <Grid columns={{ xs: 12, sm: 6, md: 4 }} key={tournament.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardActionArea
                                    component={Link}
                                    href={`/tournament/${tournament.id}`}
                                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                                >
                                    <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                                        <Typography variant="h5" component="div" gutterBottom>
                                            {tournament.name}
                                        </Typography>
                                        <Typography sx={{ mb: 1 }} color="text.secondary">
                                            Discipline: {tournament.discipline}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Location: {tournament.location}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Date: {new Date(tournament.time).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Max Participants: {tournament.maxParticipants}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Application Deadline:{' '}
                                            {new Date(tournament.applicationDeadline).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {tournaments.length > 0 && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 3 }}>
                    <TournamentPagination count={totalPages} page={currentPage} take={take} />
                </Box>
            )}
        </Container>
    );
}

export default Home;

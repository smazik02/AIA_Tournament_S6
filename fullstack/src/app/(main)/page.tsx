import { getAllTournamentsPaged, getTournamentsCount } from '@/data-access/tournaments';
import { Box, Card, CardActionArea, CardContent, Container, Grid, Typography } from '@mui/material';
import CreateTournamentButton from '@/components/main/tournament/CreateTournamentButton';
import TournamentPagination from '@/components/main/tournament/TournamentPagination';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12;

interface HomePageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function Home({ searchParams }: HomePageProps) {
    let { take = ITEMS_PER_PAGE, skip = 0 } = await searchParams;

    take = isNaN(+take) || +take <= 0 ? ITEMS_PER_PAGE : +take;
    skip = isNaN(+skip) || +skip < 0 ? 0 : +skip;

    const tournaments = await getAllTournamentsPaged({ skip, take });
    const totalTournaments = await getTournamentsCount();

    const totalPages = Math.ceil(totalTournaments / take);
    const currentPage = Math.floor(skip / take) + 1;

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', padding: 2, gap: 3 }}>
            <CreateTournamentButton />

            {totalTournaments > 0 && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 3 }}>
                    <TournamentPagination count={totalPages} page={currentPage} take={take} />
                </Box>
            )}

            {tournaments.length === 0 ? (
                <Typography variant="h6" sx={{ textAlign: 'center', m: 3 }}>
                    No tournaments found.
                </Typography>
            ) : (
                <>
                    <Typography variant="h4" sx={{ textAlign: 'center', m: 3 }}>
                        All tournaments:
                    </Typography>
                    <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                        {tournaments.map((tournament) => (
                            <Grid columns={{ xs: 12, sm: 6, md: 4 }} key={tournament.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        width: '320px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        p: 2,
                                    }}
                                >
                                    <CardActionArea
                                        component={Link}
                                        href={`/tournament/${tournament.id}`}
                                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                                            <Typography variant="h5" component="div" gutterBottom noWrap>
                                                {tournament.name}
                                            </Typography>
                                            <Typography sx={{ mb: 1 }} color="text.secondary" noWrap>
                                                <b>Discipline</b>: {tournament.discipline}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                <b>Location</b>: {tournament.location}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                <b>Date</b>: {new Date(tournament.time).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                <b>Max Participants</b>: {tournament.maxParticipants}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                <b>Application Deadline</b>:{' '}
                                                {new Date(tournament.applicationDeadline).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
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

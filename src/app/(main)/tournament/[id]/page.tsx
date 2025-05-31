import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTournament } from '@/data-access/tournaments';
import { notFound } from 'next/navigation';
import {
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material';
import { Business, Edit, EmojiEvents, Event, Group, HowToReg, LocationOn, Person } from '@mui/icons-material';
import Link from 'next/link';
import ApplyToTournamentButton from '@/components/main/ApplyToTournamentButton';
import { GoogleMapsEmbed } from '@next/third-parties/google';

interface TournamentPageProps {
    params: Promise<{ id: string }>;
}

async function TournamentPage({ params }: TournamentPageProps) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    const tournament = await getTournament(id);
    if (!tournament) {
        notFound();
    }

    const formattedTime = new Date(tournament.time).toLocaleString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const formattedDeadline = new Date(tournament.applicationDeadline).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const isOwner = session?.user !== undefined && tournament.organizerId === session.user.id;
    const canParticipate =
        session?.user !== undefined &&
        tournament.participants.find((participant) => participant.userId === session.user.id) === undefined;
    const rankedPlayersCount = tournament.participants.length;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}
                >
                    {tournament.name}
                </Typography>

                <Grid container spacing={3}>
                    <Grid columns={{ xs: 12, md: 8 }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <EmojiEvents sx={{ mr: 1 }} color="primary" /> Discipline
                            </Typography>
                            <Typography variant="body1">{tournament.discipline}</Typography>
                        </Box>

                        <Box mb={3}>
                            <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Person sx={{ mr: 1 }} color="primary" /> Organizer
                            </Typography>
                            <Typography variant="body1">{tournament.organizer.name || 'N/A'}</Typography>
                        </Box>

                        <Box mb={3}>
                            <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Event sx={{ mr: 1 }} color="primary" /> Date & Time
                            </Typography>
                            <Typography variant="body1">{formattedTime}</Typography>
                        </Box>

                        <Box mb={3}>
                            <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <LocationOn sx={{ mr: 1 }} color="primary" /> Location
                            </Typography>
                            <Typography variant="body1">{tournament.location}</Typography>
                            {tournament.location !== '' && (
                                <GoogleMapsEmbed
                                    apiKey={process.env.GOOGLE_MAPS_KEY ?? ''}
                                    mode="place"
                                    q={tournament.location}
                                />
                            )}
                        </Box>
                    </Grid>

                    <Grid columns={{ xs: 12, md: 4 }}>
                        <Card variant="outlined" sx={{ p: 2, backgroundColor: 'action.hover' }}>
                            <Box mb={2}>
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    gutterBottom
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <Group sx={{ mr: 1 }} /> Max Participants
                                </Typography>
                                <Typography variant="body1">{tournament.maxParticipants}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box mb={2}>
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    gutterBottom
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <Event sx={{ mr: 1 }} /> Application Deadline
                                </Typography>
                                <Typography variant="body1">{formattedDeadline}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box>
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    gutterBottom
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <HowToReg sx={{ mr: 1 }} /> Registered Players
                                </Typography>
                                <Typography variant="body1">{rankedPlayersCount}</Typography>
                                {/* This assumes "number of ranked players" means currently registered/applied. Adjust as needed. */}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {tournament.sponsors && tournament.sponsors.length > 0 && (
                    <Box mt={4}>
                        <Typography
                            variant="h5"
                            component="h2"
                            gutterBottom
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Business sx={{ mr: 1 }} color="primary" /> Sponsors
                        </Typography>
                        <List>
                            {tournament.sponsors.map((sponsor) => (
                                <ListItem key={sponsor.id} disablePadding>
                                    {sponsor.logoUrl && (
                                        <ListItem>
                                            <Avatar src={sponsor.logoUrl} alt={sponsor.name}>
                                                <Business /> {/* Fallback icon */}
                                            </Avatar>
                                        </ListItem>
                                    )}
                                    <ListItemText primary={sponsor.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                <Box
                    sx={{
                        mt: 4,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        justifyContent: 'center',
                    }}
                >
                    <ApplyToTournamentButton tournamentId={tournament.id} canParticipate={canParticipate} />
                </Box>
                <Box
                    sx={{
                        mt: 4,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        justifyContent: 'center',
                    }}
                >
                    {isOwner && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<Edit />}
                            component={Link}
                            href={`/tournament/${tournament.id}/update`}
                        >
                            Edit Tournament
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default TournamentPage;

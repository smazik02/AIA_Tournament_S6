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
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material';
import { Business, Edit, EmojiEvents, Event, Group, HowToReg, LocationOn, Person } from '@mui/icons-material';
import Link from 'next/link';
import ApplyToTournamentButton from '@/components/main/tournament/ApplyToTournamentButton';
import { GoogleMapsEmbed } from '@next/third-parties/google';
import AddSponsorModal from '@/components/main/tournament/AddSponsorModal';
import RemoveTournamentButton from '@/components/main/tournament/RemoveTournamentButton';

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

                <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Grid columns={{ xs: 12, md: 8 }}>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
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

                            {tournament.location !== '' && (
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
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    <Grid columns={{ xs: 12, md: 8 }}>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
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
                                </Box>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>

                {tournament.location !== '' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
                        <GoogleMapsEmbed
                            mode="place"
                            height={400}
                            width="100%;"
                            q={tournament.location}
                            apiKey={process.env.GOOGLE_MAPS_KEY ?? ''}
                        />
                    </Box>
                )}

                <Box mt={4}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ mr: 1 }} color="primary" /> Sponsors
                    </Typography>
                    {isOwner && <AddSponsorModal tournamentId={tournament.id} />}
                    {tournament.sponsors.length > 0 && (
                        <List>
                            {tournament.sponsors.map((sponsor) => (
                                <ListItem
                                    key={sponsor.id}
                                    disablePadding
                                    sx={{ m: 1 }}
                                    secondaryAction={
                                        <RemoveTournamentButton
                                            tournamentId={tournament.id}
                                            sponsorId={sponsor.id}
                                            isHidden={!isOwner}
                                        />
                                    }
                                >
                                    {sponsor.logoUrl && (
                                        <ListItemAvatar>
                                            <Avatar src={sponsor.logoUrl} alt={sponsor.name}>
                                                <Business /> {/* Fallback icon */}
                                            </Avatar>
                                        </ListItemAvatar>
                                    )}
                                    <ListItemText primary={sponsor.name} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {tournament.sponsors.length === 0 && (
                        <Typography variant="body1" sx={{ pt: 1 }}>
                            No sponsors.
                        </Typography>
                    )}
                </Box>

                <Grid
                    container
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        flexDirection: { xs: 'column', sm: 'row' },
                    }}
                >
                    <Grid columns={{ xs: 12, md: 8 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mt: 2,
                            }}
                        >
                            <ApplyToTournamentButton tournamentId={tournament.id} canParticipate={canParticipate} />
                        </Box>
                    </Grid>
                    <Grid columns={{ xs: 12, md: 8 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mt: 2,
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
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default TournamentPage;

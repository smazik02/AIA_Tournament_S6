import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTournament, getTournamentParticipants } from '@/data-access/tournaments';
import { notFound } from 'next/navigation';
import {
    Avatar,
    AvatarGroup,
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
    Tooltip,
    Typography,
} from '@mui/material';
import { Business, Edit, EmojiEvents, Event, Group, HowToReg, LocationOn, People, Person } from '@mui/icons-material';
import Link from 'next/link';
import ApplyToTournamentForm from '@/components/main/tournament/ApplyToTournamentForm';
import { GoogleMapsEmbed } from '@next/third-parties/google';
import AddSponsorModal from '@/components/main/tournament/AddSponsorModal';
import RemoveTournamentButton from '@/components/main/tournament/RemoveTournamentButton';
import { Metadata } from 'next';
import { stringAvatar } from '@/components/avatar.utils';

interface TournamentPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TournamentPageProps): Promise<Metadata> {
    const { id } = await params;
    const tournamentName = await getTournament(id).then((tournament) => tournament?.name ?? '');
    return { title: `Details: ${tournamentName}` };
}

async function TournamentPage({ params }: TournamentPageProps) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    const tournament = await getTournament(id);
    if (!tournament) {
        notFound();
    }

    const participants = await getTournamentParticipants(id);

    const rankedPlayersCount = tournament.participants.length;

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
    const participates =
        session?.user !== undefined && tournament.participants.find((p) => p.userId === session.user.id) !== undefined;
    const pastApplicationDate = tournament.applicationDeadline < new Date();

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

                {participants.length > 0 && (
                    <Box mt={4}>
                        <Typography
                            variant="h5"
                            component="h2"
                            gutterBottom
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <People sx={{ mr: 1 }} color="primary" /> Participants
                        </Typography>
                        <Box display="flex" sx={{ mt: 2 }}>
                            <AvatarGroup max={5} total={participants.length}>
                                {participants.map((participant) => (
                                    <Box key={participant.id}>
                                        <Tooltip title={participant.user.name}>
                                            {participant.user.image !== null ? (
                                                <Avatar
                                                    key={participant.id}
                                                    alt={participant.user.name}
                                                    src={participant.user.image}
                                                />
                                            ) : (
                                                <Avatar
                                                    key={participant.id}
                                                    alt={participant.user.name}
                                                    {...stringAvatar(participant.user.name)}
                                                />
                                            )}
                                        </Tooltip>
                                    </Box>
                                ))}
                            </AvatarGroup>
                        </Box>
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
                                                <Business />
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
                            <ApplyToTournamentForm
                                tournamentId={tournament.id}
                                participates={participates}
                                pastDate={pastApplicationDate}
                            />
                        </Box>
                    </Grid>
                    {isOwner && (
                        <Grid columns={{ xs: 12, md: 8 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 2,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<Edit />}
                                    component={Link}
                                    href={`/tournament/${tournament.id}/update`}
                                >
                                    Edit Tournament
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
}

export default TournamentPage;

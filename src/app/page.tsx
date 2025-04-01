import { Button, Container } from '@mui/material';

export default function Home() {
    return (
        <Container sx={{ display: 'flex', padding: 2 }}>
            <Button variant="contained">Hello world</Button>
        </Container>
    );
}

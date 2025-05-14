'use client';

import { Add } from '@mui/icons-material';
import { Button, Container, Pagination } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const [page, setPage] = useState(1);

    const handleChangePage = (_: ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    return (
        <Container sx={{ display: 'flex', padding: 2 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/tournament/new')}>
                CREATE
            </Button>
            <Pagination count={5} page={page} onChange={handleChangePage} />
        </Container>
    );
}

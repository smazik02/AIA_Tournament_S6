'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';
import { Pagination } from '@mui/material';

interface TournamentPaginationProps {
    count: number;
    page: number;
    take: number;
}

function TournamentPagination({ count, page, take }: TournamentPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChangePage = (_: ChangeEvent<unknown>, newPage: number) => {
        const newSkip = (newPage - 1) * take;
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

        currentParams.set('skip', newSkip.toString());
        currentParams.set('take', take.toString());

        router.push(`/?${currentParams.toString()}`);
    };

    if (count <= 1) {
        return null;
    }

    return <Pagination count={count} page={page} onChange={handleChangePage} color="primary" />;
}

export default TournamentPagination;

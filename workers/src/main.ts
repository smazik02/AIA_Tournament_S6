import app from './app';
import { PORT } from './config/constants';

app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log(`App listening on http://localhost:${PORT}`);
});

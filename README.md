# Directories

- **workers** - worker queue utilizing Redis and BullMQ to enqueue scheduled tasks (tournament ladder generation)
- **fullstack** - the webapp itself with a PostgreSQL database

# Running

### You'll need:

- Node.js (version 22)
- pnpm package manager (installed either natively in the OS, or through `npm install pnpm -g`)
- Docker Engine

### To run the project for the first time:

#### In the workers directory
- run `pnpm i` to install all dependencies
- run `pnpn db:up` to run the Redis cache (it'll fail if you don't have Docker Engine running)
- run `pnpm dev` to serve the app in the dev mode
- alternatively run `pnpm start` to build with tsc and run with node

#### In the fullstack directory
- run `pnpm init-env` to install all dependencies and create required .env files
- fill out the .env files as instructed (they include things like db connection string, authentication library secret,
  etc.)
- run `pnpm db:init` - it builds and runs a database Docker container, generates files required by Prisma ORM and pushes
  all migrations to that database (if you haven't filled out .env files yet, this will throw an error)
- run `pnpm dev` to serve the app locally in a development environment
- alternatively build the whole app with `pnpm build`, and then serve it with `pnpm start`

# Project description

The aim of this project is to create an online tournament system. The system should allow its users to conduct
tournaments in a discipline selected by students. The organizers can set a time and place of the tournament, limits on
the number of participants and sponsor logos while competitors can apply to participate and enter the results of their
encounters

# Functional requirements (1 point)

1. Each user must register in the system providing his first name, last name, email address (used also as a login) and a
   password. After registering, the system sends an email to the given address with a confirmation link which expires in
   24 hours. The user account becomes active only after it is confirmed by the link.
2. The system allows its users to log in (+ _I forgot my password_ option).
3. The main page displays a list of upcoming tournaments (with paging, 10 tournaments per page), also visible to users
   who aren't logged in.
4. After clicking on any given tournament, a details page is displayed which basic tournament information (name,
   discipline, organizer, time, Google Maps with location, max participants, participation application deadline, sponsor
   logos, number of ranked players) with the option of applying to participate in the tournament. If the logged-in user
   is this event’s organizer, he can also edit the tournament information.
5. Each user can organize his own tournament. All required information needs to be provided. You can’t host tournaments
   in the past.

# Functional requirements (2 points)

1. All above
2. After selecting the option to sign up for the tournament the system asks for a license number and current ranking (at
   this point, users who aren’t logged in are asked to log in). Assume that both license number and ranking need to be
   unique. For simplicity, you can assume that this data is not verified by the organizer.
3. There can only be as many participants as the organizer specified via the limits.
4. After the participation application deadline passes, the system selects the tournament ladder, seeding the seeded
   players according to their ranking. The way the ladder is organized and the players selected as well as the system of
   play should correspond to a discipline selected by the student.
5. Users can easily view their upcoming games and tournaments for which they are registered.

# Functional requirements (3 points)

1. All above
2. After selection, users can view the ladder on the tournament page. From now on, the users can enter the results of
   their games played. For simplicity, you can assume that it is sufficient to select the winner of the encounter,
   however, both participants have to select the same winner. If the participants enter conflicting results, both
   results are withdrawn, and they can reenter the result
3. When the result is entered successfully, the tournament ladder (scoreboard) is updated.

# Functional requirements (4 points)

1. All above
2. The main page implements a simple search mechanism
3. The ladder/scoreboard should be presented with some sort of visualization (a table is not enough to fulfill this
   point).

# Non functional requirements

- ORM mechanism, but using queries in certain specific cases is allowed
- Irreversible operations require additional confirmation in the form of dialog boxes
- Variable binding, data validation, post/redirect/get, proper password management
- Proper handling of concurrent data access (e.g., participants limits, entering game results,
  etc.)

# Utilized technologies

- JavaScript/TypeScript
- Next.js framework for both frontend and backend (fullstack app)
- MaterialUI component library
- PostgreSQL database
- Prisma ORM
- BetterAuth authentication library
- Email.JS for mailing

# Database schema

### User, account, session and verification => handled by auth library

### Tournament

- id
- name
- discipline
- time
- location (GPS coordinates)
- max participants
- application deadline
- creation date
- sponsors => Sponsor (many to many)
- organizer => User (one to many)
- ranked players => User (many to many)

### Tournament participants

- id
- license number (unique)
- ranking (unique)
- registration date
- user => User
- tournament => Tournament

### Match

- id
- tournament
- date
- player 1 => User
- player 2 => User
- winner => User

### Result

- id
- score
- match => Match
- player => User

### Sponsor

- id
- name
- logo url

### Tournament sponsors

- tournament id => Tournament
- sponsor id => Sponsor
